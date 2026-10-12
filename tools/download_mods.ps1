<#
 download_mods.ps1 — загрузка модов «Арканополиса» через Modrinth API.
 Работает в Windows PowerShell 5.1+ без установки Python.

 Использование (из папки репозитория):
   powershell -ExecutionPolicy Bypass -File tools\download_mods.ps1
   powershell -ExecutionPolicy Bypass -File tools\download_mods.ps1 -Side server
   powershell -ExecutionPolicy Bypass -File tools\download_mods.ps1 -RequiredOnly
   powershell -ExecutionPolicy Bypass -File tools\download_mods.ps1 -Report report.txt
#>
[CmdletBinding()]
param(
    [string]$Manifest = "mods\mods.json",
    [string]$Out = "mods",
    [ValidateSet("both", "client", "server")]
    [string]$Side = "both",
    [switch]$RequiredOnly,
    [string]$Report
)

$ErrorActionPreference = "Continue"

# Windows PowerShell 5.1 по умолчанию может не включать TLS 1.2
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch { }

$api = "https://api.modrinth.com/v2"
$ua = "arcanopolis-pack/0.1.0 (modpack downloader)"

$lines = New-Object System.Collections.Generic.List[string]
function Log([string]$msg) {
    Write-Host $msg
    $lines.Add($msg) | Out-Null
}

if (-not (Test-Path $Manifest)) {
    Write-Host "Не найден манифест: $Manifest (запустите скрипт из папки репозитория)"
    exit 1
}

$json = Get-Content -Raw -Encoding UTF8 $Manifest | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $Out | Out-Null

$mc = $json.pack.minecraft
$loaderVersion = $json.pack.loader.version
Log ("Сборка: {0} | Minecraft {1} | forge {2}" -f $json.pack.name, $mc, $loaderVersion)
Log ""

$gv = [uri]::EscapeDataString(('["{0}"]' -f $mc))
$ld = [uri]::EscapeDataString('["forge"]')

$ok = 0; $manual = 0; $failed = 0

foreach ($mod in @($json.mods)) {
    if ($RequiredOnly -and -not $mod.required) { continue }
    if ($Side -eq "server" -and $mod.side -eq "client") { continue }
    if ($Side -eq "client" -and $mod.side -eq "server") { continue }

    $name = $mod.name
    $slug = $mod.modrinth
    $want = $mod.version
    if (-not $want) { $want = "latest" }

    if (-not $slug) {
        $cf = $mod.curseforge
        if (-not $cf) { $cf = $mod.id }
        Log ("[ВРУЧНУЮ] {0}: нет slug в Modrinth -> https://www.curseforge.com/minecraft/mc-mods/{1}" -f $name, $cf)
        $manual++
        continue
    }

    $url = "{0}/project/{1}/version?game_versions={2}&loaders={3}" -f $api, $slug, $gv, $ld
    try {
        $versions = @(Invoke-RestMethod -Uri $url -Headers @{ "User-Agent" = $ua })
    } catch {
        $code = ""
        if ($_.Exception.Response) { $code = " (HTTP $([int]$_.Exception.Response.StatusCode))" }
        if ($code -match "404") {
            $cf = $mod.curseforge
            if (-not $cf) { $cf = $mod.id }
            Log ("[ВРУЧНУЮ] {0}: проект '{1}' не найден в Modrinth -> https://www.curseforge.com/minecraft/mc-mods/{2}" -f $name, $slug, $cf)
            $manual++
        } else {
            Log ("[ОШИБКА] {0}: {1}{2}" -f $name, $_.Exception.Message, $code)
            $failed++
        }
        Start-Sleep -Milliseconds 400
        continue
    }
    Start-Sleep -Milliseconds 400

    if ($want -eq "latest") {
        $ver = $versions | Select-Object -First 1
    } else {
        $ver = $versions | Where-Object { $_.version_number -eq $want } | Select-Object -First 1
    }

    if (-not $ver) {
        Log ("[ВРУЧНУЮ] {0}: нет версии '{1}' для {2}/forge" -f $name, $want, $mc)
        $manual++
        continue
    }

    $files = @($ver.files)
    $primary = @($files | Where-Object { $_.primary })
    if ($primary.Count -gt 0) { $f = $primary[0] } elseif ($files.Count -gt 0) { $f = $files[0] } else { $f = $null }

    if (-not $f) {
        Log ("[ОШИБКА] {0}: у версии {1} нет файлов" -f $name, $ver.version_number)
        $failed++
        continue
    }

    $dest = Join-Path $Out $f.filename
    if (Test-Path $dest) {
        Log ("[ЕСТЬ]    {0} (уже скачан)" -f $f.filename)
        $ok++
        continue
    }

    try {
        Invoke-WebRequest -Uri $f.url -OutFile $dest -UserAgent $ua | Out-Null
    } catch {
        Log ("[ОШИБКА] {0}: загрузка не удалась: {1}" -f $name, $_.Exception.Message)
        if (Test-Path $dest) { Remove-Item $dest -Force }
        $failed++
        continue
    }

    # Проверка контрольных сумм (если опубликованы)
    $hashes = $f.hashes
    $verified = $true
    if ($hashes -and $hashes.sha512) {
        $h = (Get-FileHash -Algorithm SHA512 $dest).Hash.ToLower()
        if ($h -ne $hashes.sha512.ToLower()) { $verified = $false }
    } elseif ($hashes -and $hashes.sha1) {
        $h = (Get-FileHash -Algorithm SHA1 $dest).Hash.ToLower()
        if ($h -ne $hashes.sha1.ToLower()) { $verified = $false }
    }

    if (-not $verified) {
        Log ("[ОШИБКА] {0}: контрольная сумма не совпала ({1})" -f $name, $f.filename)
        Remove-Item $dest -Force
        $failed++
        continue
    }

    Log ("[OK]      {0}  <- {1} {2}" -f $f.filename, $name, $ver.version_number)
    $ok++
}

Log ""
Log ("Итог: скачано/есть — {0}, вручную — {1}, ошибок — {2}" -f $ok, $manual, $failed)
if ($manual -gt 0) {
    Log "Файлы «вручную» скачайте по ссылкам выше и положите в папку mods\"
}

if ($Report) {
    $lines | Set-Content -Encoding UTF8 $Report
    Write-Host "Отчёт сохранён: $Report"
}

if ($failed -gt 0) { exit 1 } else { exit 0 }

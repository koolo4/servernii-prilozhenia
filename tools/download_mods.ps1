<#
 download_mods.ps1 — загрузка модов «Арканополиса» через Modrinth / Maven / GitHub / CurseForge.
 Работает в Windows PowerShell 5.1+ без установки Python.

 Каскад источников для каждого мода:
   1. Modrinth API (с проверкой SHA-1/SHA-512)
   2. Maven (точные закреплённые версии, например FTB)
   3. GitHub Releases (официальные репозитории)
   4. CurseForge через api.cfwidget.com -> media.forgecdn.net

 Способы запуска (из любой папки!):
   1. Двойной щелчок по файлу "Скачать_моды.bat" в корне репозитория.
   2. powershell -ExecutionPolicy Bypass -File tools\download_mods.ps1

 Параметры:
   -Manifest   путь к манифесту (по умолчанию mods\mods.json в корне репозитория)
   -Out        папка для jar-файлов (по умолчанию mods\)
   -Side       both | client | server  (server = без клиентских модов)
   -RequiredOnly   только обязательные моды
   -Report     сохранить отчёт в файл
   -NoPause    не ждать Enter в конце (для автоматизации)
#>
[CmdletBinding()]
param(
    [string]$Manifest = "mods\mods.json",
    [string]$Out = "mods",
    [ValidateSet("both", "client", "server")]
    [string]$Side = "both",
    [switch]$RequiredOnly,
    [string]$Report,
    [switch]$NoPause
)

$ErrorActionPreference = "Continue"

# --- Определяем корень репозитория по расположению самого скрипта ----------
$ToolsDir = $PSScriptRoot
if (-not $ToolsDir) { $ToolsDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
$RepoRoot = Split-Path -Parent $ToolsDir

if (-not [System.IO.Path]::IsPathRooted($Manifest)) { $Manifest = Join-Path $RepoRoot $Manifest }
if (-not [System.IO.Path]::IsPathRooted($Out))      { $Out = Join-Path $RepoRoot $Out }
if ($Report -and -not [System.IO.Path]::IsPathRooted($Report)) { $Report = Join-Path $RepoRoot $Report }

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch { }

$api = "https://api.modrinth.com/v2"
$ua = "arcanopolis-pack/0.2.0 (modpack downloader)"

$lines = New-Object System.Collections.Generic.List[string]
function Log([string]$msg) {
    Write-Host $msg
    $lines.Add($msg) | Out-Null
}

function Finish([int]$code) {
    if (-not $NoPause) {
        Write-Host ""
        Read-Host "Готово. Нажмите Enter, чтобы закрыть окно" | Out-Null
    }
    exit $code
}

# Разворачивает вложенные массивы (защита от особенностей PowerShell 5.1).
# Возвращает элементы ПО ОДНОМУ (без оборачивания в массив), поэтому
# вызов через @() всегда даёт плоский список.
function Get-Flat($obj) {
    $list = New-Object System.Collections.Generic.List[object]
    $queue = New-Object System.Collections.Generic.Queue[object]
    foreach ($i in @($obj)) { $queue.Enqueue($i) }
    while ($queue.Count -gt 0) {
        $cur = $queue.Dequeue()
        if ($null -eq $cur) { continue }
        if ($cur -is [System.Array]) { foreach ($s in $cur) { $queue.Enqueue($s) } }
        else { $list.Add($cur) }
    }
    foreach ($item in $list) { Write-Output $item }
}

function Get-WebJson([string]$url) {
    $resp = Invoke-WebRequest -Uri $url -Headers @{ "User-Agent" = $ua } -UseBasicParsing
    return ($resp.Content | ConvertFrom-Json)
}

# --- Загрузка файла с проверкой суммы (если есть) --------------------------
function Save-File([string]$url, [string]$dest, $hashes) {
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UserAgent $ua -UseBasicParsing | Out-Null
    } catch {
        if (Test-Path $dest) { Remove-Item $dest -Force }
        return "download: $($_.Exception.Message)"
    }
    if ($hashes -and $hashes.sha512) {
        $h = (Get-FileHash -Algorithm SHA512 $dest).Hash.ToLower()
        if ($h -ne "$($hashes.sha512)".ToLower()) { Remove-Item $dest -Force; return "checksum mismatch" }
    } elseif ($hashes -and $hashes.sha1) {
        $h = (Get-FileHash -Algorithm SHA1 $dest).Hash.ToLower()
        if ($h -ne "$($hashes.sha1)".ToLower()) { Remove-Item $dest -Force; return "checksum mismatch" }
    }
    return $null
}

# ============================ ИСТОЧНИК 1: MODRINTH =========================
function Find-OnModrinth($mod, [string]$mc) {
    $slugs = @(Get-Flat $mod.modrinth)
    $want = "$($mod.version)"
    if (-not $want) { $want = "latest" }

    foreach ($slug in $slugs) {
        if (-not $slug) { continue }

        # Запрос 1: с фильтром по загрузчику forge; запрос 2: без фильтра
        foreach ($withLoader in @($true, $false)) {
            if ($withLoader) {
                $gv = [uri]::EscapeDataString(('["{0}"]' -f $mc))
                $ld = [uri]::EscapeDataString('["forge"]')
                $url = "{0}/project/{1}/version?game_versions={2}&loaders={3}" -f $api, $slug, $gv, $ld
            } else {
                $gv = [uri]::EscapeDataString(('["{0}"]' -f $mc))
                $url = "{0}/project/{1}/version?game_versions={2}" -f $api, $slug, $gv
            }

            try { $raw = Get-WebJson $url } catch { Start-Sleep -Milliseconds 300; continue }
            Start-Sleep -Milliseconds 300

            $versions = @(Get-Flat $raw)
            if ($withLoader) {
                $versions = @($versions | Where-Object { @($_.loaders) -contains "forge" })
            } else {
                $versions = @($versions | Where-Object { @($_.loaders) -contains "forge" })
            }
            if ($versions.Count -eq 0) { continue }

            $ver = $null
            if ($want -eq "latest") {
                $ver = $versions[0]
            } else {
                foreach ($v in $versions) {
                    if ("$($v.version_number)" -eq $want) { $ver = $v; break }
                }
                # запасной путь: совпадение по имени jar-файла (например Create 0.5.1.f)
                if (-not $ver) {
                    foreach ($v in $versions) {
                        foreach ($file in @(Get-Flat $v.files)) {
                            if ("$($file.filename)" -match [regex]::Escape($want)) { $ver = $v; break }
                        }
                        if ($ver) { break }
                    }
                }
            }
            if (-not $ver) { continue }

            $files = @(Get-Flat $ver.files)
            $f = $null
            foreach ($file in $files) {
                if ($file.primary) { $f = $file; break }
            }
            if (-not $f -and $files.Count -gt 0) { $f = $files[0] }
            if (-not $f) { continue }

            return @{
                filename = "$($f.filename)"
                url      = "$($f.url)"
                hashes   = $f.hashes
                version  = "$($ver.version_number)"
                source   = "Modrinth/$slug"
            }
        }
    }
    return $null
}

# ============================ ИСТОЧНИК 2: MAVEN ============================
function Find-OnMaven($mod) {
    $m = $mod.maven_url
    if ($m -is [System.Array]) { $m = $m | Select-Object -First 1 }
    if (-not $m) { return $null }
    $url = "$m"
    $name = $url.Substring($url.LastIndexOf("/") + 1)
    return @{
        filename = $name
        url      = $url
        hashes   = $null
        version  = "pinned"
        source   = "Maven"
    }
}

# ============================ ИСТОЧНИК 3: GITHUB ===========================
function Find-OnGitHub($mod, [string]$mc) {
    $repos = @(Get-Flat $mod.github)
    foreach ($repo in $repos) {
        if (-not $repo) { continue }
        try { $rel = @(Get-Flat (Get-WebJson ("https://api.github.com/repos/{0}/releases?per_page=15" -f $repo))) }
        catch { continue }
        Start-Sleep -Milliseconds 300

        foreach ($r in $rel) {
            $assets = @(Get-Flat $r.assets)
            $tag = "$($r.tag_name)"
            $pat = "$($mod.file_pattern)"
            foreach ($a in $assets) {
                $n = "$($a.name)"
                if ($n -notmatch '\.jar$') { continue }
                if ($n -match 'sources|javadoc|slim') { continue }
                if ($pat -and $n -notmatch $pat) { continue }
                if ($n -match [regex]::Escape($mc) -or $tag -match [regex]::Escape($mc)) {
                    return @{
                        filename = $n
                        url      = "$($a.browser_download_url)"
                        hashes   = $null
                        version  = $tag
                        source   = "GitHub/$repo"
                    }
                }
            }
        }
    }
    return $null
}

# ============================ ИСТОЧНИК 4: CURSEFORGE =======================
function Find-OnCurseForge($mod, [string]$mc) {
    $slugs = @(Get-Flat $mod.curseforge)
    foreach ($slug in $slugs) {
        if (-not $slug) { continue }
        try { $data = Get-WebJson ("https://api.cfwidget.com/minecraft/mc-mods/{0}" -f $slug) }
        catch { Start-Sleep -Milliseconds 300; continue }
        Start-Sleep -Milliseconds 300

        $files = @(Get-Flat $data.files)
        if ($files.Count -eq 0) { continue }

        $best = $null
        $pat = "$($mod.file_pattern)"
        foreach ($f in $files) {
            $n = "$($f.name)"
            if ($n -match 'sources|javadoc|slim|_api') { continue }
            if ($pat -and $n -notmatch $pat) { continue }

            # файл должен относиться к нужной версии игры
            $isMc = $false
            if ("$($f.version)" -match [regex]::Escape($mc)) { $isMc = $true }
            if (@($f.versions) -contains $mc) { $isMc = $true }
            if ($n -match [regex]::Escape($mc)) { $isMc = $true }
            if (-not $isMc) { continue }

            # не берём neoforge-сборки
            if ($n -match 'neoforge') { continue }

            # чем новее файл (больше id), тем выше приоритет; R-релизы важнее бет
            $score = [int64]0
            if ("$($f.type)" -eq "R") { $score += 10000000000 }
            if ($n -match 'forge') { $score += 1000000000 }
            $id = 0
            try { $id = [int64]$f.id } catch { $id = 0 }
            $score += [int64]($id / 1000)

            if (-not $best -or $score -gt $best.score) {
                $best = @{ file = $f; score = $score; id = $id }
            }
        }
        if (-not $best) { continue }

        $f = $best.file
        $n = "$($f.name)"
        $url = "$($f.url)"
        if (-not $url -or $url -eq "") {
            $p1 = [math]::Floor($best.id / 1000)
            $p2 = $best.id % 1000
            $url = "https://media.forgecdn.net/files/{0}/{1}/{2}" -f $p1, $p2, [uri]::EscapeDataString($n)
        }
        return @{
            filename = $n
            url      = $url
            hashes   = $null
            version  = "$($f.version)"
            source   = "CurseForge/$slug"
        }
    }
    return $null
}

# ================================ MAIN =====================================
if (-not (Test-Path $Manifest)) {
    Log "ОШИБКА: не найден манифест модов:"
    Log "  $Manifest"
    Finish 1
}

try {
    $json = Get-Content -Raw -Encoding UTF8 $Manifest | ConvertFrom-Json
} catch {
    Log "ОШИБКА: не удалось прочитать манифест: $($_.Exception.Message)"
    Finish 1
}

New-Item -ItemType Directory -Force -Path $Out | Out-Null

$mc = "$($json.pack.minecraft)"
Log ("Сборка: {0} | Minecraft {1} | forge {2}" -f $json.pack.name, $mc, $json.pack.loader.version)
Log ("Папка для модов: $Out")
Log ("Источники: Modrinth -> Maven -> GitHub -> CurseForge")
Log ""

$ok = 0; $manual = 0; $failed = 0

$modList = @(Get-Flat $json.mods)
Log ("Модов в манифесте: {0}" -f $modList.Count)
Log ""

foreach ($mod in $modList) {
    if (-not $mod -or -not $mod.name) { continue }
    if ($RequiredOnly -and -not $mod.required) { continue }
    if ($Side -eq "server" -and "$($mod.side)" -eq "client") { continue }
    if ($Side -eq "client" -and "$($mod.side)" -eq "server") { continue }

    $name = "$($mod.name)"

    $hit = Find-OnModrinth $mod $mc
    if (-not $hit) { $hit = Find-OnMaven $mod }
    if (-not $hit) { $hit = Find-OnGitHub $mod $mc }
    if (-not $hit) { $hit = Find-OnCurseForge $mod $mc }
    if ($hit -is [System.Array]) { $hit = @($hit) | Select-Object -First 1 }

    if (-not $hit) {
        Log ("[ВРУЧНУЮ] {0} — не найден ни в одном источнике. Ссылки:" -f $name)
        foreach ($cf in @(Get-Flat $mod.curseforge)) {
            if ($cf) { Log ("           https://www.curseforge.com/minecraft/mc-mods/{0}" -f $cf) }
        }
        $manual++
        continue
    }

    $dest = Join-Path $Out $hit.filename
    if (Test-Path $dest) {
        Log ("[ЕСТЬ]    {0} (уже скачан) [{1}]" -f $hit.filename, $hit.source)
        $ok++
        continue
    }

    $err = Save-File $hit.url $dest $hit.hashes
    if ($err) {
        Log ("[ОШИБКА] {0}: {1} [{2}]" -f $name, $err, $hit.source)
        $failed++
        continue
    }

    Log ("[OK]      {0}  <- {1} ({2}) [{3}]" -f $hit.filename, $name, $hit.version, $hit.source)
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

if ($failed -gt 0 -or $manual -gt 0) { Finish 1 } else { Finish 0 }

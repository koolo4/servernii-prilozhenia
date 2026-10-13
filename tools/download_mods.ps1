<#
 download_mods.ps1 — загрузка модов «Арканополиса» через Modrinth / Maven / GitHub / CurseForge.
 Работает в Windows PowerShell 5.1+ без установки Python.

 Каскад источников для каждого мода:
   1. Modrinth API (slug-кандидаты, затем поиск по названию; проверка SHA-1/SHA-512)
   2. Maven (точные закреплённые версии, например FTB)
   3. GitHub Releases (официальные репозитории)
   4. CurseForge через api.cfwidget.com -> media.forgecdn.net (строгий, затем мягкий фильтр)

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
$ua = "arcanopolis-pack/0.3.1 (modpack downloader)"
# CDN CurseForge (media.forgecdn.net) отдаёт 403 на нестандартные User-Agent —
# для СКАЧИВАНИЯ файлов используем браузерный UA.
$browserUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

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
# Возвращает элементы ПО ОДНОМУ, поэтому вызов через @() даёт плоский список.
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

# --- Проверка контрольной суммы (если есть) --------------------------------
function Test-Hash([string]$dest, $hashes) {
    if (-not $hashes) { return $true }
    if ($hashes.sha512) {
        $h = (Get-FileHash -Algorithm SHA512 $dest).Hash.ToLower()
        return ($h -eq "$($hashes.sha512)".ToLower())
    }
    if ($hashes.sha1) {
        $h = (Get-FileHash -Algorithm SHA1 $dest).Hash.ToLower()
        return ($h -eq "$($hashes.sha1)".ToLower())
    }
    return $true
}

# --- Проверка, что файл — настоящий jar (ZIP с концом архива) -------------
# Forge падает с "zip END header not found" на любом битом/обрезанном jar.
function Test-JarFile([string]$path) {
    try {
        $fs = [System.IO.File]::OpenRead($path)
        try {
            $len = $fs.Length
            if ($len -lt 22) { return "файл слишком мал ($len байт)" }
            $buf = New-Object byte[] 4
            $fs.Read($buf, 0, 4) | Out-Null
            if ($buf[0] -ne 0x50 -or $buf[1] -ne 0x4B) {
                return ("не ZIP: начинается с {0:X2}{1:X2}{2:X2}{3:X2} (HTML/текст?)" -f $buf[0], $buf[1], $buf[2], $buf[3])
            }
            # ищем сигнатуру конца архива (PK\x05\x06) в последних 66 КБ
            $tail = [Math]::Min($len, 66000)
            $fs.Seek($len - $tail, [System.IO.SeekOrigin]::Begin) | Out-Null
            $data = New-Object byte[] $tail
            $read = 0
            while ($read -lt $tail) {
                $n = $fs.Read($data, $read, $tail - $read)
                if ($n -le 0) { break }
                $read += $n
            }
            for ($i = $read - 4; $i -ge 0; $i--) {
                if ($data[$i] -eq 0x50 -and $data[$i+1] -eq 0x4B -and $data[$i+2] -eq 0x05 -and $data[$i+3] -eq 0x06) {
                    return $null
                }
            }
            return "обрыв архива (нет конца ZIP)"
        } finally { $fs.Close() }
    } catch {
        return "не удалось прочитать: $($_.Exception.Message)"
    }
}

# --- Загрузка файла: пробуем все URL, затем curl.exe -----------------------
function Save-File($urls, [string]$dest, $hashes) {
    $errs = New-Object System.Collections.Generic.List[string]
    $urlList = @(Get-Flat $urls)

    foreach ($u in $urlList) {
        if (-not $u) { continue }
        $headers = @{ "Accept" = "*/*" }
        if ("$u" -match 'forgecdn\.net|curseforge\.com') { $headers["Referer"] = "https://www.curseforge.com/" }
        try {
            Invoke-WebRequest -Uri $u -OutFile $dest -UserAgent $browserUA -Headers $headers -UseBasicParsing | Out-Null
            if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt 0)) {
                if (Test-Hash $dest $hashes) {
                    $bad = Test-JarFile $dest
                    if (-not $bad) { return $null }
                    $errs.Add("$bad [$u]")
                } else {
                    $errs.Add("checksum mismatch [$u]")
                }
                Remove-Item $dest -Force
            } else {
                $errs.Add("пустой файл [$u]")
            }
        } catch {
            $errs.Add("$($_.Exception.Message) [$u]")
            if (Test-Path $dest) { Remove-Item $dest -Force }
        }
    }

    # Запасной путь: curl.exe (встроен в Windows 10+)
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if ($curl) {
        foreach ($u in $urlList) {
            if (-not $u) { continue }
            & $curl.Source -L -s -S -A $browserUA -e "https://www.curseforge.com/" -o $dest $u | Out-Null
            if (($LASTEXITCODE -eq 0) -and (Test-Path $dest) -and ((Get-Item $dest).Length -gt 0)) {
                if (Test-Hash $dest $hashes) {
                    $bad = Test-JarFile $dest
                    if (-not $bad) { return $null }
                    $errs.Add("$bad (curl) [$u]")
                } else {
                    $errs.Add("checksum mismatch (curl) [$u]")
                }
                Remove-Item $dest -Force
            } elseif (Test-Path $dest) {
                Remove-Item $dest -Force
            }
        }
    }

    if ($errs.Count -eq 0) { return "download: нет ссылок" }
    return ("download: " + ($errs -join " | "))
}

# ============================ ИСТОЧНИК 1: MODRINTH =========================
# Пробует один проект Modrinth по slug: 'latest' или закреплённая версия.
function Try-ModrinthProject([string]$slug, $mod, [string]$mc) {
    $want = "$($mod.version)"
    if (-not $want) { $want = "latest" }

    # Запрос 1: с фильтром по загрузчику forge; запрос 2: без фильтра
    foreach ($withLoader in @($true, $false)) {
        $gv = [uri]::EscapeDataString(('["{0}"]' -f $mc))
        if ($withLoader) {
            $ld = [uri]::EscapeDataString('["forge"]')
            $url = "{0}/project/{1}/version?game_versions={2}&loaders={3}" -f $api, $slug, $gv, $ld
        } else {
            $url = "{0}/project/{1}/version?game_versions={2}" -f $api, $slug, $gv
        }

        $raw = $null
        try { $raw = Get-WebJson $url } catch {
            Start-Sleep -Milliseconds 900
            try { $raw = Get-WebJson $url } catch { Start-Sleep -Milliseconds 300; continue }
        }
        Start-Sleep -Milliseconds 350

        $versions = @(Get-Flat $raw)
        $versions = @($versions | Where-Object { @($_.loaders) -contains "forge" })
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
            urls     = @("$($f.url)")
            hashes   = $f.hashes
            version  = "$($ver.version_number)"
            source   = "Modrinth/$slug"
        }
    }
    return $null
}

function Find-OnModrinth($mod, [string]$mc) {
    $slugs = @(Get-Flat $mod.modrinth)

    foreach ($slug in $slugs) {
        if (-not $slug) { continue }
        $hit = Try-ModrinthProject $slug $mod $mc
        if ($hit) { return $hit }
    }

    # Проход 3: поиск по названию мода (если slug неизвестен или сменился)
    try {
        $q = [uri]::EscapeDataString("$($mod.name)")
        $facets = [uri]::EscapeDataString('[["project_type:mod"],["versions:1.20.1"],["categories:forge"]]')
        $res = Get-WebJson ("{0}/search?query={1}&facets={2}&limit=5" -f $api, $q, $facets)
        Start-Sleep -Milliseconds 350
        foreach ($hitProj in @(Get-Flat $res.hits)) {
            $slug2 = "$($hitProj.slug)"
            if (-not $slug2) { continue }
            if ($slugs -contains $slug2) { continue }   # уже пробовали
            # защита от ложных совпадений: название или slug должны совпадать с именем мода
            $wantN = ("$($mod.name)".ToLowerInvariant() -replace '[^a-z0-9]', '')
            $tN = ("$($hitProj.title)".ToLowerInvariant() -replace '[^a-z0-9]', '')
            $sN = ("$slug2".ToLowerInvariant() -replace '[^a-z0-9]', '')
            if ($tN -ne $wantN -and $sN -ne $wantN) { continue }
            $hit = Try-ModrinthProject $slug2 $mod $mc
            if ($hit) {
                $hit.source = "Modrinth/search:{0}" -f $slug2
                return $hit
            }
        }
    } catch { }
    return $null
}

# ============================ ИСТОЧНИК 2: MAVEN ============================
function Find-OnMaven($mod) {
    $urls = New-Object System.Collections.Generic.List[string]
    foreach ($u in @(Get-Flat $mod.maven_urls)) { if ($u) { $urls.Add("$u") } }
    foreach ($u in @(Get-Flat $mod.maven_url))  { if ($u) { $urls.Add("$u") } }
    if ($urls.Count -eq 0) { return $null }

    $first = $urls[0]
    $name = $first.Substring($first.LastIndexOf("/") + 1)
    return @{
        filename = $name
        urls     = $urls.ToArray()
        hashes   = $null
        version  = "pinned"
        source   = "Maven"
    }
}

# ============================ ИСТОЧНИК 3: GITHUB ===========================
function Find-OnGitHub($mod, [string]$mc) {
    $repos = @(Get-Flat $mod.github)
    $pat = "$($mod.file_pattern)"

    foreach ($repo in $repos) {
        if (-not $repo) { continue }
        try { $rel = @(Get-Flat (Get-WebJson ("https://api.github.com/repos/{0}/releases?per_page=50" -f $repo))) }
        catch { Start-Sleep -Milliseconds 300; continue }
        Start-Sleep -Milliseconds 350

        foreach ($r in $rel) {
            $assets = @(Get-Flat $r.assets)
            $tag = "$($r.tag_name)"
            $tagMatch = ($tag -match [regex]::Escape($mc))

            $jars = @()
            foreach ($a in $assets) {
                $n = "$($a.name)"
                if ($n -notmatch '\.jar$') { continue }
                if ($n -match 'sources|javadoc|slim') { continue }
                if ($pat -and $n -notmatch $pat) { continue }
                $jars += $a
            }
            if ($jars.Count -eq 0) { continue }

            # берём релиз, если тег или хотя бы один jar относится к нужной версии MC
            $nameMatch = $false
            foreach ($a in $jars) {
                if ("$($a.name)" -match [regex]::Escape($mc)) { $nameMatch = $true; break }
            }
            if (-not $tagMatch -and -not $nameMatch) { continue }

            $pick = $null
            foreach ($a in $jars) {
                if ("$($a.name)" -match [regex]::Escape($mc)) { $pick = $a; break }
            }
            if (-not $pick) { $pick = $jars[0] }

            return @{
                filename = "$($pick.name)"
                urls     = @("$($pick.browser_download_url)")
                hashes   = $null
                version  = $tag
                source   = "GitHub/$repo"
            }
        }
    }
    return $null
}

# ============================ ИСТОЧНИК 4: CURSEFORCF =======================
function Find-OnCurseForge($mod, [string]$mc) {
    $slugs = @(Get-Flat $mod.curseforge)
    $pat = "$($mod.file_pattern)"
    # "1.20.1", "1.20-..." (формат LDTTeam) или ровно "1.20"
    $mcAlt = '1\.20\.1|1\.20($|[^0-9.])'
    $script:cfDiag = $null

    foreach ($slug in $slugs) {
        if (-not $slug) { continue }
        $data = $null
        try { $data = Get-WebJson ("https://api.cfwidget.com/minecraft/mc-mods/{0}" -f $slug) }
        catch { Start-Sleep -Milliseconds 350; continue }
        Start-Sleep -Milliseconds 350

        $files = @(Get-Flat $data.files)
        if ($files.Count -eq 0) {
            $script:cfDiag = ("cfwidget/{0}: проект не найден или файлов нет" -f $slug)
            continue
        }

        # карта версий проекта: { "1.20.1": [id, id, ...] }
        $idMap = @()
        $prop = $null
        if ($data.versions) { $prop = $data.versions.PSObject.Properties[$mc] }
        if ($prop) { $idMap = @(Get-Flat $prop.Value) }

        # Два прохода: строгий фильтр, затем мягкий (любой файл для 1.20.x)
        foreach ($strict in @($true, $false)) {
            $best = $null
            foreach ($f in $files) {
                $n = "$($f.name)"
                if ($n -match 'sources|javadoc|slim|_api') { continue }
                if ($n -match 'neoforge') { continue }
                if ($pat -and $n -notmatch $pat) { continue }

                # файл должен относиться к нужной версии игры
                $isMc = $false
                if ("$($f.version)" -match $mcAlt) { $isMc = $true }
                if ($n -match $mcAlt) { $isMc = $true }
                if (@($f.versions) -contains $mc) { $isMc = $true }
                if (-not $isMc -and $idMap.Count -gt 0) {
                    foreach ($vid in $idMap) {
                        if ("$vid" -eq "$($f.id)") { $isMc = $true; break }
                    }
                }
                if ($strict -and -not $isMc) { continue }
                if (-not $strict -and -not $isMc -and $n -notmatch '1\.20') { continue }

                # чем новее файл (больше id), тем выше приоритет; R-релизы важнее бет
                $score = [int64]0
                if ("$($f.type)" -eq "R") { $score += 10000000000 }
                if ($n -match 'forge') { $score += 1000000000 }
                if ($isMc) { $score += 100000000 }
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
            $urls = New-Object System.Collections.Generic.List[string]

            $furl = "$($f.url)"
            if ($furl) { $urls.Add($furl) }

            if ($best.id -gt 0) {
                $p1 = [math]::Floor($best.id / 1000)
                $p2 = $best.id % 1000
                $esc = [uri]::EscapeDataString($n)
                $urls.Add(("https://media.forgecdn.net/files/{0}/{1}/{2}" -f $p1, $p2, $esc))
                $urls.Add(("https://edge.forgecdn.net/files/{0}/{1}/{2}" -f $p1, $p2, $esc))
                if ($esc -ne $n) {
                    $urls.Add(("https://media.forgecdn.net/files/{0}/{1}/{2}" -f $p1, $p2, $n))
                }
                $pid2 = "$($data.id)"
                if ($pid2) {
                    $urls.Add(("https://cursemaven.com/curse/maven/{0}-{1}/{2}/{0}-{1}-{2}.jar" -f $slug, $pid2, $best.id))
                }
                # официальная точка входа CurseForge (делает редирект на CDN)
                $urls.Add(("https://www.curseforge.com/api/v1/mods/{0}/files/{1}/download" -f $slug, $best.id))
            }

            return @{
                filename = $n
                urls     = $urls.ToArray()
                hashes   = $null
                version  = "$($f.version)"
                source   = "CurseForge/$slug"
            }
        }

        # Диагностика: проект есть, но ни один файл не подошёл
        $sample = @()
        foreach ($f in ($files | Select-Object -First 6)) {
            $sample += ("{0} ({1})" -f $f.name, $f.version)
        }
        $script:cfDiag = ("cfwidget/{0}: файлов {1}, ни один не подошёл. Примеры: {2}" -f $slug, $files.Count, ($sample -join "; "))
    }
    return $null
}

# ==================== ПРЯМЫЕ ФАЙЛЫ CURSEFORGE (по номеру) =================
# Ссылка вида curseforge.com/minecraft/mc-mods/{slug}/download/{file_id}
# раскрывается в прямые URL CDN — без api.cfwidget.com.
function Get-CfFileUrls([string]$slug, [string]$fid, [string]$knownName = "", [string]$projIdIn = "") {
    $urls = New-Object System.Collections.Generic.List[string]
    $fname = $knownName
    $fid64 = 0
    try { $fid64 = [int64]$fid } catch { }
    $p1 = [math]::Floor($fid64 / 1000)
    $p2 = $fid64 % 1000

    # 1. Прямые CDN-ссылки, если имя файла уже известно
    if ($fname) {
        $esc = [uri]::EscapeDataString($fname)
        $urls.Add(("https://media.forgecdn.net/files/{0}/{1}/{2}" -f $p1, $p2, $esc))
        $urls.Add(("https://edge.forgecdn.net/files/{0}/{1}/{2}" -f $p1, $p2, $esc))
    }

    # 2. Имя файла и числовой ID проекта вытаскиваем из страниц CurseForge
    $projId = $projIdIn
    foreach ($pageUrl in @(
        ("https://www.curseforge.com/minecraft/mc-mods/{0}/files/{1}" -f $slug, $fid),
        ("https://www.curseforge.com/minecraft/mc-mods/{0}/download/{1}" -f $slug, $fid)
    )) {
        try {
            $page = Invoke-WebRequest -Uri $pageUrl -UserAgent $browserUA -Headers @{ "Referer" = "https://www.curseforge.com/" } -UseBasicParsing
            # JS экранирует слеши как \/ — вернём их к нормальному виду
            $html = "$($page.Content)" -replace '\\/', '/'
            if (-not $projId) {
                $m = [regex]::Match($html, '(?i)"projectId"\s*:\s*(\d+)')
                if (-not $m.Success) { $m = [regex]::Match($html, '(?i)data-projectid="(\d+)"') }
                if ($m.Success) { $projId = $m.Groups[1].Value }
            }
            if (-not $fname) {
                foreach ($pat in @(
                    ("files/{0}/{1}/([^""'\s\\<>?]+\.jar)" -f $p1, $p2),
                    '(?i)"fileName"\s*:\s*"([^"]+\.jar)"',
                    ('(?i)(' + [regex]::Escape($slug) + '[A-Za-z0-9._\-]*\.jar)'),
                    '(?i)href="([^"]+\.jar[^"]*)"'
                )) {
                    $m = [regex]::Match($html, $pat)
                    if ($m.Success) {
                        $cand = $m.Groups[1].Value
                        if ($cand -match '/') { $cand = $cand.Substring($cand.LastIndexOf('/') + 1) }
                        $cand = [uri]::UnescapeDataString($cand)
                        if ($cand -match '\.jar$') { $fname = $cand; break }
                    }
                }
            }
        } catch { }
        if ($fname -and $projId) { break }
    }

    # 3. Имя известно -> прямые CDN-ссылки (работают без api/v1)
    if ($fname -and $urls.Count -eq 0) {
        $esc = [uri]::EscapeDataString($fname)
        $urls.Add(("https://media.forgecdn.net/files/{0}/{1}/{2}" -f $p1, $p2, $esc))
        $urls.Add(("https://edge.forgecdn.net/files/{0}/{1}/{2}" -f $p1, $p2, $esc))
    }

    # 3.5. Curse Maven — надёжное зеркало файлов CurseForge
    if ($projId) {
        $cm = "https://cursemaven.com/curse/maven/{0}-{1}/{2}/{0}-{1}-{2}.jar" -f $slug, $projId, $fid
        if (-not $urls.Contains($cm)) { $urls.Add($cm) }
    }

    # 4. Точки входа CurseForge: перехватываем редирект 302 -> настоящий CDN,
    # сами адреса добавляем как запасные кандидаты
    foreach ($modKey in @($slug, $projId)) {
        if (-not $modKey) { continue }
        foreach ($ep in @('download', 'download-url')) {
            $apiUrl = "https://www.curseforge.com/api/v1/mods/{0}/files/{1}/{2}" -f $modKey, $fid, $ep
            try {
                Invoke-WebRequest -Uri $apiUrl -UserAgent $browserUA -Headers @{ "Referer" = "https://www.curseforge.com/" } -MaximumRedirection 0 -UseBasicParsing | Out-Null
            } catch {
                $resp = $null
                try { $resp = $_.Exception.Response } catch { }
                if ($resp -and $resp.Headers) {
                    $loc = "$($resp.Headers['Location'])"
                    if ($loc -match '\.jar') {
                        if ($loc -match '^/') { $loc = "https://www.curseforge.com" + $loc }
                        if (-not $urls.Contains($loc)) { $urls.Insert(0, $loc) }
                        if (-not $fname -and $loc -match '([^/]+\.jar)') {
                            $fname = [uri]::UnescapeDataString($Matches[1])
                        }
                    }
                }
            }
            if (-not $urls.Contains($apiUrl)) { $urls.Add($apiUrl) }
        }
    }

    return @{ urls = $urls.ToArray(); filename = $fname }
}

function Find-OnCfFile($mod) {
    foreach ($it in @(Get-Flat $mod.curseforge_files)) {
        if (-not $it) { continue }
        $slug = "$($it.slug)"
        $fid = "$($it.file_id)"
        if (-not $slug -or -not $fid) { continue }
        $r = Get-CfFileUrls $slug $fid "$($it.filename)" "$($it.project_id)"
        $fname = $r.filename
        if (-not $fname) { $fname = "{0}-{1}.jar" -f $mod.id, $fid }
        return @{
            filename = $fname
            urls     = $r.urls
            hashes   = $null
            version  = "cf:{0}" -f $fid
            source   = "CurseForge/{0}#{1}" -f $slug, $fid
        }
    }
    return $null
}

# Прямые ссылки из манифеста (manual_urls) — последний источник.
# Ссылка на страницу CurseForge раскрывается так же, как curseforge_files.
function Get-ManualHit($mod) {
    $urls = New-Object System.Collections.Generic.List[string]
    $fname = $null
    foreach ($u in @(Get-Flat $mod.manual_urls)) {
        if (-not $u) { continue }
        if ("$u" -match 'curseforge\.com/minecraft/mc-mods/(?<slug>[^/]+)/(?:download|files)/(?<fid>\d+)') {
            $r = Get-CfFileUrls $Matches['slug'] $Matches['fid']
            foreach ($x in $r.urls) { if (-not $urls.Contains($x)) { $urls.Add($x) } }
            if (-not $fname) { $fname = $r.filename }
        } else {
            $urls.Add("$u")
            if (-not $fname -and "$u" -match '\.jar$') {
                $fname = $u.Substring($u.LastIndexOf('/') + 1)
            }
        }
    }
    if ($urls.Count -eq 0) { return $null }
    if (-not $fname) { $fname = "{0}-manual.jar" -f $mod.id }
    return @{
        filename = $fname
        urls     = $urls.ToArray()
        hashes   = $null
        version  = "manual_url"
        source   = "Прямая ссылка"
    }
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
    $script:cfDiag = $null

    $finished = $false
    $srcErrors = New-Object System.Collections.Generic.List[string]

    foreach ($stage in @('modrinth', 'maven', 'github', 'cffile', 'cfwidget', 'manual')) {
        $hit = $null
        switch ($stage) {
            'modrinth' { $hit = Find-OnModrinth $mod $mc }
            'maven'    { $hit = Find-OnMaven $mod }
            'github'   { $hit = Find-OnGitHub $mod $mc }
            'cffile'   { $hit = Find-OnCfFile $mod }
            'cfwidget' { $hit = Find-OnCurseForge $mod $mc }
            'manual'   { $hit = Get-ManualHit $mod }
        }
        if ($hit -is [System.Array]) { $hit = @($hit) | Select-Object -First 1 }
        if (-not $hit) { continue }

        $dest = Join-Path $Out $hit.filename
        if (Test-Path $dest) {
            $bad = Test-JarFile $dest
            if (-not $bad) {
                Log ("[ЕСТЬ]    {0} (уже скачан) [{1}]" -f $hit.filename, $hit.source)
                $ok++
                $finished = $true
                break
            }
            Log ("[БИТЫЙ]  {0} — {1}; удаляю и скачиваю заново" -f $hit.filename, $bad)
            Remove-Item $dest -Force
        }

        $err = Save-File $hit.urls $dest $hit.hashes
        if (-not $err) {
            Log ("[OK]      {0}  <- {1} ({2}) [{3}]" -f $hit.filename, $name, $hit.version, $hit.source)
            $ok++
            $finished = $true
            break
        }
        # источник не справился — пробуем следующий
        $srcErrors.Add(("[{0}] {1}" -f $hit.source, $err))
    }

    if ($finished) { continue }

    if ($srcErrors.Count -gt 0) {
        Log ("[ОШИБКА] {0}:" -f $name)
        foreach ($e in $srcErrors) { Log ("           {0}" -f $e) }
        $failed++
    } else {
        Log ("[ВРУЧНУЮ] {0} — не найден ни в одном источнике. Ссылки:" -f $name)
        foreach ($cf in @(Get-Flat $mod.curseforge)) {
            if ($cf) { Log ("           https://www.curseforge.com/minecraft/mc-mods/{0}" -f $cf) }
        }
        if ($script:cfDiag) { Log ("           {0}" -f $script:cfDiag) }
        $manual++
    }
}

Log ""
Log ("Итог: скачано/есть — {0}, вручную — {1}, ошибок — {2}" -f $ok, $manual, $failed)
if ($manual -gt 0) {
    Log "Файлы «вручную» скачайте по ссылкам выше и положите в папку mods\"
}

# --- Проверка целостности всех jar в папке --------------------------------
# Заодно ищем дубликаты modId (два jar одного мода = краш Forge).
function Get-ModIds([string]$path) {
    $ids = New-Object System.Collections.Generic.List[string]
    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem | Out-Null
        $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
        try {
            foreach ($entry in $zip.Entries) {
                if ($entry.FullName -ieq 'META-INF/mods.toml') {
                    $sr = New-Object System.IO.StreamReader($entry.Open())
                    try { $txt = $sr.ReadToEnd() } finally { $sr.Close() }
                    # modId самого мода — только до секции зависимостей
                    $cut = $txt.IndexOf('[[dependencies')
                    if ($cut -ge 0) { $txt = $txt.Substring(0, $cut) }
                    foreach ($m in [regex]::Matches($txt, '(?im)^\s*modId\s*=\s*"([^"]+)"')) {
                        $ids.Add($m.Groups[1].Value)
                    }
                }
            }
        } finally { $zip.Dispose() }
    } catch { }
    foreach ($i in $ids) { Write-Output $i }
}

Log ""
Log "Проверка целостности jar-файлов:"
$broken = 0
$byId = @{}
foreach ($f in (Get-ChildItem -Path $Out -File | Sort-Object Name)) {
    if ($f.Name -notmatch '\.jar$') {
        Log ("[ФАЙЛ]   {0} — не jar (Forge не загрузит; можно убрать из папки mods)" -f $f.Name)
        continue
    }
    $bad = Test-JarFile $f.FullName
    if ($bad) {
        Log ("[БИТЫЙ]  {0} — {1}; УДАЛЁН (такой файл вызывает краш Forge)" -f $f.Name, $bad)
        Remove-Item $f.FullName -Force
        $broken++
        continue
    }
    foreach ($mid in @(Get-ModIds $f.FullName)) {
        if (-not $mid) { continue }
        if (-not $byId.ContainsKey($mid)) { $byId[$mid] = New-Object System.Collections.Generic.List[string] }
        $byId[$mid].Add($f.Name)
    }
}
foreach ($mid in @($byId.Keys | Sort-Object)) {
    if ($byId[$mid].Count -gt 1) {
        Log ("[ДУБЛЬ]  мод '{0}' лежит в нескольких файлах: {1} — оставьте один" -f $mid, ($byId[$mid] -join ', '))
        $broken++
    }
}
if ($broken -gt 0) {
    Log ("Проблемных файлов: {0}. Удалите лишние/битые и запустите скрипт ещё раз." -f $broken)
} else {
    Log "Все jar-файлы целые, дубликатов нет."
}

if ($Report) {
    $lines | Set-Content -Encoding UTF8 $Report
    Write-Host "Отчёт сохранён: $Report"
}

if ($failed -gt 0 -or $manual -gt 0 -or $broken -gt 0) { Finish 1 } else { Finish 0 }

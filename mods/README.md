# Папка mods/

Здесь лежат jar-файлы модов сборки. **Сами jar-файлы не коммитятся в git** (см. `.gitignore`) — их нужно скачать.

## Способ 1: скрипт (рекомендуется)

**Windows (PowerShell, Python не нужен):**
```powershell
powershell -ExecutionPolicy Bypass -File tools\download_mods.ps1
```
Только серверный набор (без клиентских модов):
```powershell
powershell -ExecutionPolicy Bypass -File tools\download_mods.ps1 -Side server
```

**Linux / macOS:**
```bash
python3 tools/download_mods.py --manifest mods/mods.json --out mods/
```

> **Важно для Windows:** команда `python3` в PowerShell — это заглушка Microsoft Store (печатает «Python» и завершается). Если Python установлен, используйте `python` или `py`. Либо вообще обойдитесь PowerShell-скриптом выше.

Скрипты:
- подбирают версию каждого мода для Minecraft 1.20.1 + Forge через Modrinth API;
- скачивают jar и проверяют контрольные суммы (SHA-1/SHA-512), если они опубликованы;
- пишут отчёт о том, что скачано, а что нужно поставить вручную.

## Способ 2: вручную

Откройте [`docs/03-mods.md`](../docs/03-mods.md) — там версии и страницы проектов. Скачайте файлы для **Minecraft 1.20.1, Forge** и положите в эту папку.

## Правила

1. **Не ставьте отдельный Flywheel** — он встроен в Create 0.5.1+.
2. **Не ставьте Rubidium/Optifine** вместе с Embeddium.
3. Не ставьте EMI/REI вместе с JEI.
4. Аддоны Create обновляйте только вместе с самим Create.
5. После изменения состава модов обновите `mods/docs` и `mods/mods.json`.

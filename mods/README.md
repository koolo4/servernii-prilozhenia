# Папка mods/

Здесь лежат jar-файлы модов сборки. **Сами jar-файлы не коммитятся в git** (см. `.gitignore`) — их нужно скачать.

## Способ 1: скрипт (рекомендуется)

```bash
python3 tools/download_mods.py --manifest mods/mods.json --out mods/
```

Скрипт:
- подбирает версию каждого мода для Minecraft 1.20.1 + Forge через Modrinth API;
- скачивает jar и проверяет контрольные суммы (SHA-1/SHA-512), если они опубликованы;
- пишет отчёт о том, что скачано, а что нужно поставить вручную.

Только серверный набор (без клиентских модов):

```bash
python3 tools/download_mods.py --manifest mods/mods.json --out mods/ --side server
```

## Способ 2: вручную

Откройте [`docs/03-mods.md`](../docs/03-mods.md) — там версии и страницы проектов. Скачайте файлы для **Minecraft 1.20.1, Forge** и положите в эту папку.

## Правила

1. **Не ставьте отдельный Flywheel** — он встроен в Create 0.5.1+.
2. **Не ставьте Rubidium/Optifine** вместе с Embeddium.
3. Не ставьте EMI/REI вместе с JEI.
4. Аддоны Create обновляйте только вместе с самим Create.
5. После изменения состава модов обновите `mods/docs` и `mods/mods.json`.

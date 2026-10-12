#!/usr/bin/env python3
"""
download_mods.py — загрузка и проверка модов «Арканополиса» через Modrinth API.

Использование:
    python3 tools/download_mods.py --manifest mods/mods.json --out mods/
    python3 tools/download_mods.py --manifest mods/mods.json --out mods/ --side server
    python3 tools/download_mods.py --manifest mods/mods.json --out mods/ --required-only
    python3 tools/download_mods.py --manifest mods/mods.json --report report.txt

Требуется только стандартная библиотека Python 3.8+ и доступ в интернет.
Modrinth API: https://docs.modrinth.com/
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.modrinth.com/v2"
USER_AGENT = "arcanopolis-pack/0.1.0 (modpack downloader)"

# Корень репозитория — по расположению скрипта, а не рабочей папке.
# Скрипт можно запускать откуда угодно (в т.ч. двойным щелчком).
ROOT = Path(__file__).resolve().parent.parent


def repo_path(p: str) -> Path:
    path = Path(p)
    return path if path.is_absolute() else ROOT / path


def api_get(url: str) -> object:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def pick_version(versions: list, want: str) -> dict | None:
    """Modrinth отдаёт версии от новых к старым."""
    if not versions:
        return None
    if want in ("latest", "", None):
        return versions[0]
    for v in versions:
        if v.get("version_number") == want:
            return v
    return None


def download_file(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=300) as resp, open(dest, "wb") as f:
        while True:
            chunk = resp.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)


def verify(path: Path, hashes: dict) -> bool:
    if not hashes:
        return True  # контрольных сумм нет — считаем допустимым
    if "sha512" in hashes:
        h = hashlib.sha512(path.read_bytes()).hexdigest()
        return h == hashes["sha512"]
    if "sha1" in hashes:
        h = hashlib.sha1(path.read_bytes()).hexdigest()
        return h == hashes["sha1"]
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description="Скачать моды сборки по манифесту")
    ap.add_argument("--manifest", required=True, help="путь к mods/mods.json")
    ap.add_argument("--out", default="mods", help="папка для jar-файлов (default: mods)")
    ap.add_argument("--side", choices=["client", "server", "both"], default="both",
                    help="какие моды скачивать: both=все, client=только клиентские, "
                         "server=без клиентских (default: both)")
    ap.add_argument("--required-only", action="store_true", help="только обязательные моды")
    ap.add_argument("--report", help="сохранить отчёт в файл")
    ap.add_argument("--sleep", type=float, default=0.4, help="пауза между запросами к API")
    ap.add_argument("--no-pause", action="store_true",
                    help="не ждать Enter в конце (Windows, запуск двойным щелчком)")
    args = ap.parse_args()

    manifest_path = repo_path(args.manifest)
    if not manifest_path.exists():
        print(f"ОШИБКА: не найден манифест модов: {manifest_path}")
        print("Убедитесь, что файл mods/mods.json существует.")
        return 1

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    out = repo_path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    report: list[str] = []
    ok, manual, failed = 0, 0, 0

    def log(line: str) -> None:
        print(line)
        report.append(line)

    pack = manifest.get("pack", {})
    log(f"Сборка: {pack.get('name')} | Minecraft {pack.get('minecraft')} | "
        f"{pack.get('loader', {}).get('type', 'forge')} {pack.get('loader', {}).get('version', '')}")
    log("")

    for mod in manifest["mods"]:
        mid, name = mod["id"], mod["name"]
        side = mod.get("side", "both")
        required = mod.get("required", True)

        if args.required_only and not required:
            continue
        if args.side == "server" and side == "client":
            continue
        if args.side == "client" and side == "server":
            continue

        slug = mod.get("modrinth")
        want = mod.get("version", "latest")

        if not slug:
            cf = mod.get("curseforge", mid)
            log(f"[ВРУЧНУЮ] {name}: нет slug в Modrinth → "
                f"https://www.curseforge.com/minecraft/mc-mods/{cf}")
            manual += 1
            continue

        try:
            q = urllib.parse.urlencode({
                "game_versions": json.dumps([pack.get("minecraft", "1.20.1")]),
                "loaders": json.dumps(["forge"]),
            })
            versions = api_get(f"{API}/project/{slug}/version?{q}")
            time.sleep(args.sleep)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                cf = mod.get("curseforge", mid)
                log(f"[ВРУЧНУЮ] {name}: проект '{slug}' не найден в Modrinth → "
                    f"https://www.curseforge.com/minecraft/mc-mods/{cf}")
                manual += 1
                continue
            log(f"[ОШИБКА] {name}: API {e.code}")
            failed += 1
            continue
        except Exception as e:  # noqa: BLE001
            log(f"[ОШИБКА] {name}: {e}")
            failed += 1
            continue

        ver = pick_version(versions, want)
        if ver is None:
            log(f"[ВРУЧНУЮ] {name}: нет версии '{want}' для 1.20.1/forge")
            manual += 1
            continue

        files = [f for f in ver.get("files", []) if f.get("primary")] or ver.get("files", [])
        if not files:
            log(f"[ОШИБКА] {name}: у версии {ver.get('version_number')} нет файлов")
            failed += 1
            continue

        f = files[0]
        fname = f["filename"]
        dest = out / fname
        if dest.exists():
            log(f"[ЕСТЬ]    {fname} (уже скачан)")
            ok += 1
            continue

        try:
            download_file(f["url"], dest)
            if not verify(dest, f.get("hashes", {})):
                log(f"[ОШИБКА] {name}: контрольная сумма не совпала ({fname})")
                dest.unlink(missing_ok=True)
                failed += 1
                continue
        except Exception as e:  # noqa: BLE001
            log(f"[ОШИБКА] {name}: загрузка не удалась: {e}")
            failed += 1
            continue

        log(f"[OK]      {fname}  <- {name} {ver.get('version_number')}")
        ok += 1

    log("")
    log(f"Итог: скачано/есть — {ok}, вручную — {manual}, ошибок — {failed}")
    if manual:
        log("Файлы «вручную» скачайте по ссылкам выше (CurseForge/Modrinth) и положите в mods/.")

    if args.report:
        report_path = repo_path(args.report)
        report_path.write_text("\n".join(report) + "\n", encoding="utf-8")
        print(f"Отчёт сохранён: {report_path}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    code = main()
    # При запуске двойным щелчком в Windows окно закрывается сразу —
    # держим его открытым, пока пользователь не нажмёт Enter.
    if sys.platform == "win32" and "--no-pause" not in sys.argv:
        try:
            input("\nГотово. Нажмите Enter, чтобы закрыть окно...")
        except EOFError:
            pass
    sys.exit(code)

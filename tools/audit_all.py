#!/usr/bin/env python3
"""Сквозной аудит сборки: книга квестов, JS-детект, PMmo-конфиги, манифест.

Запускает аудит ворот эпох и условий MineColonies, а поверх — глубокие
проверки, которые те не делают:
  - SNBT: уникальность id квестов/задач/наград, все зависимости разрешаются,
    у каждого квеста есть заголовок, описание и хотя бы одна задача;
    достижимость каждого квеста от входа главы (нет «висячих» квестов);
  - JS: синтаксис (node --check), каждая строка ведёт на существующую задачу,
    граф строк не имеет тупиков (идеальный игрок проходит все строки);
  - контент 0.9.x: секреты (invisible, без линий), реликвии (29, опыт),
    боссы Cataclysm (kill-задачи), листья Tinkers';
  - config PMmo: TOML парсится, оверлей выключен, фейерверков в SKILL_UP нет;
  - mods/mods.json: валиден, обязательные зависимости ядра на месте.

Использование: python3 tools/audit_all.py ; код выхода 1 — есть проблемы.
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CH = ROOT / "config" / "ftbquests" / "quests" / "chapters"
sys.path.insert(0, str(ROOT / "tools"))
import audit_quest_gates as aqg  # noqa: E402

aqg.CH = CH

PROBLEMS: list[str] = []


def bad(msg: str) -> None:
    PROBLEMS.append(msg)
    print("  ✗", msg)


def parse_file(path: Path):
    text = path.read_text(encoding="utf-8")
    fname = re.search(r'filename: "([^"]+)"', text)
    cid = re.search(r'\bid: "([0-9A-F]+)"', text)
    order = re.search(r"order_index: (\d+)", text)
    depsm = re.search(r"dependencies: \[([^\]]*)\]\n\torder_index", text)
    chdeps = re.findall(r'"([0-9A-F]+)"', depsm.group(1)) if depsm else []
    quests = []
    qpos = text.index("quests: [")
    for obj in aqg.split_objects(text, qpos):
        mid = re.search(r'\bid: "([0-9A-F]+)"', obj)
        if not mid:
            continue
        mdep = re.search(r"dependencies: \[([^\]]*)\]", obj)
        deps = re.findall(r'"([0-9A-F]+)"', mdep.group(1)) if mdep else []
        tasks = []
        mt = re.search(r"\n\t\t\ttasks: \[(.*?)\n\t\t\t\]", obj, re.S)
        if mt:
            block = mt.group(1)
            for tm in re.finditer(r'id: "(0A11[0-9A-F]+)"', block):
                tt = re.search(r'type: "([a-z_]+)"', block[tm.end():])
                tasks.append((tm.group(1), tt.group(1) if tt else "?"))
        mrew = re.search(r"\n\t\t\trewards: \[(.*?)\n\t\t\t\]", obj, re.S)
        rewards = re.findall(r'id: "(0A11[0-9A-F]+)"',
                             mrew.group(1)) if mrew else []
        title = re.search(r'\n\t\t\ttitle: "([^"]*)"', obj)
        quests.append({
            "id": mid.group(1), "deps": deps, "tasks": tasks,
            "rewards": rewards,
            "title": title.group(1) if title else "",
            "has_desc": "\n\t\t\tdescription: [" in obj
                        and not re.search(r"description: \[\s*\]", obj),
            "optional": bool(re.search(r"\n\t\t\toptional: true", obj)),
            "invisible": bool(re.search(r"\n\t\t\tinvisible: true", obj)),
            "chapter": path.stem,
            "raw": obj,
        })
    return {
        "file": path.stem,
        "filename": fname.group(1) if fname else "",
        "id": cid.group(1) if cid else "",
        "order": int(order.group(1)) if order else -1,
        "chdeps": chdeps,
        "quests": quests,
    }


def main() -> int:
    print("=== 1/6 АУДИТ ВОРОТ ЭПОХ ===", flush=True)
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "audit_quest_gates.py")],
                       cwd=ROOT)
    if r.returncode != 0:
        bad("аудит ворот эпох вернул нарушения")

    print("\n=== 2/6 АУДИТ УСЛОВИЙ MINECOLONIES ===", flush=True)
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "audit_minecolonies.py")],
                       cwd=ROOT)
    if r.returncode != 0:
        bad("аудит MineColonies вернул нарушения")

    print("\n=== 3/6 СТРУКТУРА SNBT ===")
    chapters = [parse_file(f) for f in sorted(CH.glob("*.snbt"))]
    quests = [q for c in chapters for q in c["quests"]]
    qids = [q["id"] for q in quests]
    tids = [t for q in quests for t, _ in q["tasks"]]
    rids = [r for q in quests for r in q["rewards"]]
    if len(qids) != len(set(qids)):
        bad("дубли id квестов")
    if len(tids) != len(set(tids)):
        bad("дубли id задач")
    if len(rids) != len(set(rids)):
        bad("дубли id наград")
    chids = {c["id"] for c in chapters}
    orders = [c["order"] for c in chapters]
    if len(set(orders)) != len(orders):
        bad("дубли order_index глав")
    for c in chapters:
        if c["filename"] != c["file"]:
            bad(f"{c['file']}: filename={c['filename']} не совпадает с файлом")
        for d in c["chdeps"]:
            if d not in chids:
                bad(f"{c['file']}: зависимость главы {d} не существует")
    qset = set(qids)
    for q in quests:
        for d in q["deps"]:
            if d not in qset:
                bad(f"{q['chapter']} «{q['title']}»: зависимость {d} не существует")
        if not q["tasks"]:
            bad(f"{q['chapter']} «{q['title']}»: нет задач")
        if not q["title"]:
            bad(f"{q['chapter']} [{q['id']}]: пустой заголовок")
        if not q["has_desc"]:
            bad(f"{q['chapter']} «{q['title']}»: нет описания")
    # достижимость: квест выполним, если выполнимы все его зависимости;
    # квесты без зависимостей — входы. Итерация до неподвижной точки.
    done, changed = set(), True
    while changed:
        changed = False
        for q in quests:
            if q["id"] not in done and all(d in done for d in q["deps"]):
                done.add(q["id"])
                changed = True
    stuck = [q for q in quests if q["id"] not in done]
    for q in stuck:
        bad(f"{q['chapter']} «{q['title']}»: недостижим (тупик зависимостей)")
    print(f"  глав: {len(chapters)}, квестов: {len(quests)}, "
          f"задач: {len(tids)}, наград: {len(rids)} — проверено")

    print("\n=== 4/6 JS-ГРАФ УСЛОВИЙ ===")
    js_path = ROOT / "kubejs" / "server_scripts" / "95_colony_checks.js"
    if shutil.which("node"):
        r = subprocess.run(["node", "--check", str(js_path)],
                           capture_output=True)
        if r.returncode != 0:
            bad("node --check: синтаксис 95_colony_checks.js")
    js = js_path.read_text(encoding="utf-8")
    chains = json.loads(re.search(r"const CHAPTER_CHAINS = (\{.*?\n\})", js, re.S).group(1))
    rows = [row for bucket in chains.values() for row in bucket]
    tset = set(tids)
    skip_tasks = set()
    for row in rows:
        if row["task"] not in tset:
            bad(f"JS-строка ведёт на несуществующую задачу {row['task']}")
        if row["kind"] == "skip":
            skip_tasks.add(row["task"])
        for d in row.get("deps", []):
            if d not in tset:
                bad(f"JS deps: задача {d} не существует")
            if d in skip_tasks:
                bad(f"JS deps: зависимость от skip-задачи {d} — тупик")
    custom_tasks = {t for q in quests for t, tt in q["tasks"] if tt == "custom"}
    row_tasks = {row["task"] for row in rows}
    if custom_tasks - row_tasks:
        bad(f"custom-задач без JS-строки: {len(custom_tasks - row_tasks)}")
    # тупики графа: прогон идеального игрока
    finished = set(skip_tasks)
    progress = True
    active = [row for row in rows if row["kind"] != "skip"]
    while progress:
        progress = False
        for row in active:
            if row["task"] not in finished and \
                    all(d in finished for d in row.get("deps", [])):
                finished.add(row["task"])
                progress = True
    dead = [row for row in active if row["task"] not in finished]
    for row in dead:
        bad(f"JS-строка никогда не сработает: {row.get('f')}:{row.get('q')}"
            f" [{row['task']}] kind={row['kind']}")
    print(f"  строк: {len(rows)} (skip {len(skip_tasks)}), тупиков нет"
          if not dead else f"  строк: {len(rows)}")

    print("\n=== 5/6 КОНТЕНТ 0.9.x ===")
    secrets = [q for q in quests if q["invisible"]]
    if len(secrets) != 7:
        bad(f"секретных квестов {len(secrets)}, ждали 7")
    for q in secrets:
        if q["deps"]:
            bad(f"секрет «{q['title']}» [{q['id']}] имеет зависимости")
        if "hide_dependency_lines: true" not in q["raw"]:
            bad(f"секрет [{q['id']}] без hide_dependency_lines")
    rel = next((c for c in chapters if c["file"] == "81_side_relics"), None)
    if rel is None:
        bad("нет главы 81_side_relics")
    else:
        if len(rel["quests"]) != 29:
            bad(f"реликвий {len(rel['quests'])}, ждали 29")
        for q in rel["quests"]:
            kinds = [tt for _, tt in q["tasks"]]
            if kinds != ["item"]:
                bad(f"реликвия «{q['title']}»: задачи {kinds}")
            if q["deps"]:
                bad(f"реликвия «{q['title']}»: есть зависимости")
            if not re.search(r'type: "xp"', q["raw"]):
                bad(f"реликвия «{q['title']}»: награда не опытом")
    kills = [q for q in quests for _, tt in q["tasks"] if tt == "kill"
             and 'entity: "cataclysm:' in q["raw"]]
    if len(kills) != 9:
        bad(f"боссов Cataclysm {len(kills)}, ждали 9")
    tic = [q for q in quests if 'item: "tconstruct:' in q["raw"]
           and any(tt == "item" for _, tt in q["tasks"])]
    if len(tic) != 5:
        bad(f"листьев Tinkers' {len(tic)}, ждали 5")
    print(f"  секретов: {len(secrets)}, реликвий: "
          f"{len(rel['quests']) if rel else 0}, боссов: {len(kills)}, "
          f"Tinkers': {len(tic)}")

    print("\n=== 6/6 PMMO-КОНФИГИ И МАНИФЕСТ ===")
    try:
        import tomllib
        client = tomllib.loads(
            (ROOT / "config" / "pmmo-client.toml").read_text(encoding="utf-8"))
        gui = client.get("Client", {}).get("GUI", {})
        if gui.get("Display Skill List") is not False:
            bad('pmmo-client: "Display Skill List" не false')
        perks = tomllib.loads(
            (ROOT / "config" / "pmmo-Perks.toml").read_text(encoding="utf-8"))
        fe = perks.get("Perks", {}).get("For_Event", {})
        fw = [e for ev in fe.values() for e in ev
              if e.get("perk") == "pmmo:fireworks"]
        if fw:
            bad(f"pmmo-Perks: осталось фейерверков: {len(fw)}")
        total = sum(len(v) for v in fe.values())
        if total != 25:  # 4+9+1+1+1+2+1+2+4 стандартных перка без фейерверков
            bad(f"pmmo-Perks: перков {total}, ждали 25 (что-то потерялось)")
        print(f"  PMmo: оверлей выключен, фейерверков нет, перков {total}")
    except ModuleNotFoundError:
        print("  (tomllib недоступен — TOML пропущен)")
    except Exception as e:  # noqa: BLE001
        bad(f"PMMO TOML не парсится: {e}")
    manifest = json.loads((ROOT / "mods" / "mods.json").read_text(encoding="utf-8"))
    mods = manifest["mods"] if isinstance(manifest, dict) else manifest
    ids = {m["id"] for m in mods}
    if len(mods) != 75:
        bad(f"в манифесте модов {len(mods)}, ждали 75")
    for m in mods:
        for dep in m.get("deps", []):
            if dep not in ids:
                bad(f"мод {m['id']}: зависимость {dep} отсутствует в манифесте")
    print(f"  манифест: {len(mods)} модов, зависимости разрешаются")

    print()
    if PROBLEMS:
        print(f"ИТОГ: ПРОБЛЕМ: {len(PROBLEMS)}")
        return 1
    print("ИТОГ: всё чисто — книга, JS-граф, конфиги и манифест согласованы")
    return 0


if __name__ == "__main__":
    sys.exit(main())

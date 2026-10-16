#!/usr/bin/env python3
"""Аудит условий MineColonies: каждое условие колонии в книге обязано быть
выполнимым в реальном MineColonies 1.20.1.

Проверяет сгенерированные строки kubejs/server_scripts/95_colony_checks.js:
  - townhall:N — уровень ратуши 1..5 (уровней выше 5 в MineColonies нет);
  - building:word:N — уровень 1..5, а word обязано встречаться в настоящем
    id типа здания (ModBuildings из исходников MineColonies: residence —
    жилой дом, deliveryman — курьер, farmer/fisherman/stonemason/blacksmith/
    sawmill/guardtower — по подстроке);
  - citizens:N — минимум 1 житель;
  - camp — строка первого квеста на месте.
Плюс иконки minecolonies:* в главах сверяются со списком реально
существующих блоков/предметов (blockstates + deployer-предметы).

Использование: python3 tools/audit_minecolonies.py
Код выхода 1 — есть невыполнимые условия.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / "kubejs" / "server_scripts" / "95_colony_checks.js"
CH = ROOT / "config" / "ftbquests" / "quests" / "chapters"

# id типов зданий ModBuildings (ldtteam/MineColonies, ветка 1.20.x, проверено
# по src/main/java/com/minecolonies/api/colony/buildings/ModBuildings.java)
BUILDING_IDS = [
    "archery", "baker", "barracks", "barrackstower", "blacksmith", "builder",
    "chickenherder", "combatacademy", "composter", "cook", "cowboy",
    "crusher", "deliveryman", "farmer", "fisherman", "guardtower",
    "residence", "library", "lumberjack", "miner", "sawmill", "shepherd",
    "sifter", "smeltery", "stonemason", "stonesmeltery", "swineherder",
    "townhall", "warehouse", "postbox", "florist", "enchanter",
    "university", "hospital", "stash", "school", "glassblower", "dyer",
    "fletcher", "mechanic", "plantation", "tavern", "concretemixer",
    "rabbithutch", "beekeeper", "mysticalsite", "graveyard", "netherworker",
    "simplequarry", "mediumquarry", "largequarry", "alchemist", "kitchen",
]

# существующие блоки-предметы minecolonies (blockstates + предметы снабжения)
KNOWN_ITEMS = {f"minecolonies:blockhut{x}" for x in [
    "alchemist", "archery", "baker", "barracks", "barrackstower",
    "beekeeper", "blacksmith", "builder", "chickenherder", "citizen",
    "combatacademy", "composter", "concretemixer", "cook", "cowboy",
    "crusher", "deliveryman", "dyer", "enchanter", "farmer", "field",
    "fisherman", "fletcher", "florist", "glassblower", "graveyard",
    "guardtower", "hospital", "kitchen", "library", "lumberjack",
    "mechanic", "miner", "mysticalsite", "netherworker", "plantation",
    "plantationfield", "rabbithutch", "sawmill", "school", "sifter",
    "smeltery", "stonemason", "stonesmeltery", "swineherder", "tavern",
    "townhall", "university", "warehouse",
]} | {"minecolonies:supplycamp", "minecolonies:supplychest",
       "minecolonies:supplycampdeployer", "minecolonies:supplychestdeployer"}


def word_ok(word: str) -> bool:
    """word должно быть подстрокой хотя бы одного настоящего id здания."""
    return any(word in bid for bid in BUILDING_IDS)


def main() -> int:
    js = JS.read_text(encoding="utf-8")
    m = re.search(r"const CHAPTER_CHAINS = (\{.*?\n\})", js, re.S)
    if not m:
        print("✗ CHAPTER_CHAINS не найден в JS")
        return 1
    chains = json.loads(m.group(1))
    rows = [r for bucket in chains.values() for r in bucket]
    problems = []

    from collections import Counter
    kinds = Counter(r["kind"] for r in rows)
    print("=== СТРОКИ УСЛОВИЙ КОЛОНИИ ===")
    for kind in ("camp", "townhall", "citizens", "building"):
        part = [r for r in rows if r["kind"] == kind]
        print(f"  {kind}: {len(part)}")
    print()

    for r in rows:
        tag = f"{r.get('f')}:{r.get('q')} [{r['task']}]"
        if r["kind"] == "townhall" and not 1 <= r["n"] <= 5:
            problems.append(f"{tag}: townhall:{r['n']} — уровня выше 5 нет")
        elif r["kind"] == "building":
            if not 1 <= r["n"] <= 5:
                problems.append(f"{tag}: building ур. {r['n']} — выше 5 нет")
            if not word_ok(r["word"]):
                problems.append(
                    f"{tag}: building:{r['word']} — такого здания нет "
                    f"(residence=дом, deliveryman=курьер)")
        elif r["kind"] == "citizens" and r["n"] < 1:
            problems.append(f"{tag}: citizens:{r['n']}")

    if not any(r["kind"] == "camp" for r in rows):
        problems.append("нет строки camp (первый квест пролога)")

    print("=== ИКОНКИ minecolonies:* ===")
    bad_icons = Counter()
    for f in sorted(CH.glob("*.snbt")):
        text = f.read_text(encoding="utf-8")
        for icon in re.findall(r'icon: "(minecolonies:[a-z0-9_]+)"', text):
            if icon not in KNOWN_ITEMS:
                bad_icons[icon] += 1
    for icon, n in bad_icons.items():
        problems.append(f"иконка {icon} x{n} — такого предмета нет")

    if problems:
        print(f"✗ НЕВЫПОЛНИМЫХ УСЛОВИЙ: {len(problems)}")
        for p in problems:
            print("  -", p)
        return 1
    print("✓ все условия MineColonies выполнимы: уровни 1..5, здания "
          "существуют, иконки на месте")
    return 0


if __name__ == "__main__":
    sys.exit(main())

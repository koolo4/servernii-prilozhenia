#!/usr/bin/env python3
"""Аудит «нельзя пропустить»: проверяет, что ворота каждой эпохи (первые квесты
следующей эпохи) транзитивно требуют ВСЕ обязательные квесты предыдущих эпох.

Пропускаемыми считаются только: optional-квесты (бонусы), повторяемые
(can_repeat — контракты) и главы целиком бонусные/справочные (70–74, 80).

Использование: python3 tools/audit_quest_gates.py
Код выхода 1 — найдены обязательные квесты, которые можно не выполнять.
"""
import re
import sys
from pathlib import Path

CH = Path("config/ftbquests/quests/chapters")
MAIN = ["00_prologue", "10_epoch_wood_water", "20_epoch_steam_logistics",
        "30_epoch_industry", "40_epoch_magic", "50_epoch_network",
        "60_epoch_cosmos"]
SIDE = ["70_side_architects", "71_side_expeditions", "72_side_schools",
        "73_side_engineering", "74_side_supply", "80_reference"]


def split_objects(text, start):
    """Объекты верхнего уровня массива quests (start — позиция '[')."""
    objs, i, n = [], text.index("[", start), len(text)
    depth = 0
    in_str = False
    buf = None
    while i < n:
        c = text[i]
        if in_str:
            if c == "\\":
                i += 2
                continue
            if c == '"':
                in_str = False
        else:
            if c == '"':
                in_str = True
            elif c == "{":
                if depth == 0:
                    buf = i
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0 and buf is not None:
                    objs.append(text[buf:i + 1])
                    buf = None
            elif c == "]" and depth == 0:
                break
        i += 1
    return objs


def parse_chapter(path):
    text = path.read_text(encoding="utf-8")
    qpos = text.index("quests: [")
    quests = []
    for obj in split_objects(text, qpos):
        mid = re.search(r'\bid: "([0-9A-F]+)"', obj)
        if not mid:
            continue
        mdep = re.search(r"dependencies: \[([^\]]*)\]", obj)
        deps = re.findall(r'"([0-9A-F]+)"', mdep.group(1)) if mdep else []
        mtitle = re.search(r'title: "([^"]*)"', obj)
        quests.append({
            "id": mid.group(1),
            "title": mtitle.group(1) if mtitle else "",
            "deps": deps,
            "optional": bool(re.search(r"\boptional: true", obj)),
            "repeatable": bool(re.search(r"\bcan_repeat: true", obj)),
            "invisible": bool(re.search(r"\binvisible: true", obj)),
        })
    chid = re.search(r'\bid: "([0-9A-F]+)"\s*\n\torder_index', text)
    return (chid.group(1) if chid else path.stem), quests


def main():
    quest = {}          # id -> dict(+chapter)
    chapters = {}
    for f in sorted(CH.glob("*.snbt")):
        cid, qs = parse_chapter(f)
        chapters[f.stem] = qs
        for q in qs:
            q["chapter"] = f.stem
            quest[q["id"]] = q

    def ancestors(ids):
        seen, stack = set(), list(ids)
        while stack:
            cur = stack.pop()
            if cur in seen or cur not in quest:
                continue
            seen.add(cur)
            stack.extend(quest[cur]["deps"])
        return seen

    problems = 0
    print("=== ВОРОТА ЭПОХ: можно ли перейти дальше, что-то пропустив ===\n")
    for idx, name in enumerate(MAIN):
        qs = chapters[name]
        req = [q for q in qs if not q["optional"] and not q["repeatable"]]
        bonus = [q for q in qs if q["optional"] or q["repeatable"]]
        if idx + 1 < len(MAIN):
            nxt = chapters[MAIN[idx + 1]]
            gate = sorted({d for q in nxt for d in q["deps"]
                           if d in quest and quest[d]["chapter"] == name})
            gate_names = [f'«{quest[g]["title"]}»' for g in gate]
            closure = ancestors(gate)
            label = f"ворота → {MAIN[idx + 1]}: " + (", ".join(gate_names) or "НЕТ СВЯЗИ!")
        else:
            # финал игры: квест(ы), транзитивно требующие ВСЕ обязательные
            # квесты главы (пост-финальный эпилог — сокровищницы и т.п. —
            # опционален и сюда не входит)
            allreq = {q["id"] for q in req}
            gate = sorted(q["id"] for q in req
                          if allreq <= ancestors([q["id"]]))
            gate_names = [f'«{quest[g]["title"]}»' for g in gate]
            closure = ancestors(gate)
            label = "финал игры: " + (", ".join(gate_names) or "НЕТ ФИНАЛА!")
        missing = [q for q in req if q["id"] not in closure]
        leaked = [quest[i] for i in closure
                  if quest[i]["chapter"] in SIDE]
        print(f"{name}: обязательных {len(req)}, бонусных {len(bonus)}")
        print(f"  {label}")
        if missing:
            problems += 1
            print(f"  ✗ МОЖНО ПРОПУСТИТЬ ({len(missing)}):")
            for q in missing:
                print(f"    - «{q['title']}» [{q['id']}]")
        else:
            print("  ✓ пропустить обязательный квест нельзя")
        if leaked:
            problems += 1
            print(f"  ✗ ворота зависят от бонусных/справочных глав: "
                  f"{[q['title'] for q in leaked]}")
        print()

    print("=== ЦИКЛЫ ЗАВИСИМОСТЕЙ (недопустимы: FTB не загрузит главу) ===\n")
    color = {}
    cyc = [0]

    def dfs(u, trail):
        color[u] = 1
        for v in quest[u]["deps"]:
            if v not in quest:
                continue
            if color.get(v) == 1:
                cyc[0] += 1
                print("  ✗ ЦИКЛ: " + " -> ".join(
                    f"«{quest[t]['title']}»" for t in trail + [v]))
            elif color.get(v, 0) == 0:
                dfs(v, trail + [u])
        color[u] = 2

    for qid in quest:
        if color.get(qid, 0) == 0:
            dfs(qid, [])
    if not cyc[0]:
        print("  ✓ циклов нет")
    problems += cyc[0]
    print()

    print("=== ПРЕДУПРЕЖДЕНИЯ ===")
    warn = 0
    for q in quest.values():
        if q["optional"] or q["repeatable"]:
            continue
        for d in q["deps"]:
            if d in quest and (quest[d]["optional"] or quest[d]["repeatable"]):
                warn += 1
                print(f"  ! обязательный «{q['title']}» зависит от бонусного "
                      f"«{quest[d]['title']}»")
    if not warn:
        print("  нет: обязательные квесты не зависят от бонусных")
    print()
    print(f"ИТОГ: {'НАРУШЕНИЙ: ' + str(problems) if problems else 'нарушений нет — каждая эпоха требует все обязательные квесты'}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())

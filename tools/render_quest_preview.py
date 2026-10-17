#!/usr/bin/env python3
"""Рендер превью книги квестов из сгенерированных SNBT.

Рисует узлы и линии зависимостей каждой главы в PNG (matplotlib),
чтобы раскладку можно было ПРОВЕРИТЬ ГЛАЗАМИ до заливки в игру.

Использование: python3 tools/render_quest_preview.py [глава ...]
Без аргументов — все главы. Результат: docs/images/quest-layout/<глава>.png
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CH = ROOT / "config" / "ftbquests" / "quests" / "chapters"
OUT = ROOT / "docs" / "images" / "quest-layout"

GATES = {"00_prologue": "Право на поселение",
         "10_epoch_wood_water": "Ключевой проект: городская мастерская",
         "20_epoch_steam_logistics": "Ключевой проект: паровой узел",
         "30_epoch_industry": "Технический паспорт",
         "40_epoch_magic": "Ключевой проект: арканная лаборатория",
         "50_epoch_network": "Ключевой проект: ядро автоматики",
         "60_epoch_cosmos": "Запуск проекта"}


def parse(fn: Path):
    t = fn.read_text(encoding="utf-8")
    quests = {}   # id -> (title, x, y)
    deps = {}     # id -> [dep ids]
    for b in re.split(r"\n\t\t\{\n", t)[1:]:
        mid = re.search(r'\n\t\t\tid: "([0-9A-F]+)"', b)
        mt = re.search(r'\n\t\t\ttitle: "(.*?)"\n\t\t\tx: (-?[\d.]+)d\n'
                       r'\t\t\ty: (-?[\d.]+)d', b)
        if not (mid and mt):
            continue
        qid = mid.group(1)
        quests[qid] = (mt.group(1), float(mt.group(2)), float(mt.group(3)))
        md = re.search(r"dependencies: \[(.*?)\]", b)
        deps[qid] = re.findall(r'"([0-9A-F]+)"', md.group(1)) if md else []
        if "hide_dependency_lines: true" in b:
            deps[qid] = []  # в игре этих линий не видно
    return quests, deps


def main() -> int:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(CH.glob("*.snbt"))
    if len(sys.argv) > 1:
        files = [f for f in files if any(a in f.name for a in sys.argv[1:])]
    for fn in files:
        quests, deps = parse(fn)
        gate_ids = set()
        for b in re.split(r"\n\t\t\{\n", fn.read_text(encoding="utf-8"))[1:]:
            mid = re.search(r'\n\t\t\tid: "([0-9A-F]+)"', b)
            if mid and "hide_dependency_lines: true" in b:
                gate_ids.add(mid.group(1))
        if not quests:
            continue
        fig, ax = plt.subplots(figsize=(13, 9))
        ax.set_facecolor("#20242c")
        fig.patch.set_facecolor("#20242c")
        for qid, ds in deps.items():
            if qid not in quests:
                continue
            x1, y1 = quests[qid][1], quests[qid][2]
            for d in ds:
                if d in quests:
                    x0, y0 = quests[d][1], quests[d][2]
                    ax.plot([x0, x1], [-y0, -y1], color="#8a7f74",
                            lw=0.5, alpha=0.45, zorder=1)
        for qid, (title, x, y) in quests.items():
            if qid in gate_ids:
                ax.scatter([x], [-y], marker="D", s=170, c="#ffb84d",
                           edgecolors="white", zorder=4)
            elif qid == next(iter(quests)):
                ax.scatter([x], [-y], marker="s", s=110, c="#c792ff",
                           edgecolors="white", zorder=4)
            else:
                ax.scatter([x], [-y], s=16, c="#d8d8d8",
                           edgecolors="#555", linewidths=0.3, zorder=3)
        ax.set_title(f"{fn.stem} — {len(quests)} квестов", color="white")
        ax.set_aspect("equal")
        ax.axis("off")
        fig.tight_layout()
        out = OUT / (fn.stem + ".png")
        fig.savefig(out, dpi=95)
        plt.close(fig)
        print("OK", out)
    return 0


if __name__ == "__main__":
    sys.exit(main())

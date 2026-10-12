#!/usr/bin/env python3
"""
gen_textures.py — генерация текстур 16×16 для предметов arcanopolis:
Только стандартная библиотека Python (PNG пишется вручную).

Использование:
    python3 tools/gen_textures.py
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "kubejs" / "assets" / "arcanopolis" / "textures" / "item"
SIZE = 16


def write_png(path: Path, pixels: list[list[tuple[int, int, int, int]]]) -> None:
    """pixels[y][x] = (r, g, b, a)"""
    raw = b""
    for row in pixels:
        raw += b"\x00" + b"".join(struct.pack("4B", *px) for px in row)

    def chunk(tag: bytes, data: bytes) -> bytes:
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0)  # RGBA8
    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
           + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    path.write_bytes(png)


def blank(color=(0, 0, 0, 0)) -> list[list[tuple[int, int, int, int]]]:
    return [[color for _ in range(SIZE)] for _ in range(SIZE)]


def rect(px, x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if 0 <= x < SIZE and 0 <= y < SIZE:
                px[y][x] = c


def circle(px, cx, cy, r, c, hollow=False, inner=None):
    for y in range(SIZE):
        for x in range(SIZE):
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            if hollow:
                if r * r - 2 * r <= d2 <= r * r:
                    px[y][x] = c
                elif inner and d2 < r * r - 2 * r:
                    px[y][x] = inner
            elif d2 <= r * r:
                px[y][x] = c


def diamond(px, cx, cy, r, c):
    for y in range(SIZE):
        for x in range(SIZE):
            if abs(x - cx) + abs(y - cy) <= r:
                px[y][x] = c


def frame(px, c, t=1):
    rect(px, 0, 0, SIZE - 1, t - 1, c)
    rect(px, 0, SIZE - t, SIZE - 1, SIZE - 1, c)
    rect(px, 0, 0, t - 1, SIZE - 1, c)
    rect(px, SIZE - t, 0, SIZE - 1, SIZE - 1, c)


# --- палитры ---
PARCH = (222, 205, 160, 255)
PARCH_D = (190, 168, 118, 255)
RED = (170, 40, 40, 255)
RED_D = (120, 24, 24, 255)
BRONZE = (176, 116, 62, 255)
BRONZE_D = (130, 82, 40, 255)
STEEL = (140, 150, 160, 255)
STEEL_D = (90, 100, 112, 255)
STEEL_L = (190, 200, 210, 255)
BRASS = (196, 160, 74, 255)
BRASS_D = (150, 116, 44, 255)
PURPLE = (140, 80, 200, 255)
PURPLE_D = (90, 46, 140, 255)
TEAL = (60, 180, 180, 255)
TEAL_D = (30, 120, 130, 255)
CYAN = (80, 210, 230, 255)
DARK = (36, 36, 44, 255)
GOLD = (240, 200, 80, 255)
GOLD_D = (190, 150, 40, 255)
CRIMSON = (150, 30, 50, 255)
MAGENTA = (230, 70, 140, 255)
BLUE = (60, 100, 200, 255)
BLUE_D = (36, 60, 140, 255)
WHITE = (240, 240, 245, 255)
BLACK = (20, 20, 24, 255)


def tex_city_charter():
    px = blank(PARCH)
    frame(px, PARCH_D, 1)
    rect(px, 3, 3, 12, 4, PARCH_D)     # заголовок
    rect(px, 3, 6, 12, 7, PARCH_D)     # строки
    rect(px, 3, 9, 10, 10, PARCH_D)
    circle(px, 11, 12, 2, RED)         # печать
    circle(px, 11, 12, 1, RED_D)
    return px


def seal(base, dark, spark=None):
    px = blank()
    circle(px, 8, 8, 6, dark)
    circle(px, 8, 8, 5, base)
    circle(px, 8, 8, 2, dark)
    if spark:
        px[3][3] = spark
        px[3][12] = spark
        px[12][3] = spark
        px[12][12] = spark
    return px


def tex_seal_craftsmen():
    px = seal(BRONZE, BRONZE_D)
    rect(px, 7, 5, 8, 10, BRONZE_D)    # молоток-марка
    rect(px, 5, 7, 10, 8, BRONZE_D)
    return px


def tex_seal_steam():
    px = seal(STEEL, STEEL_D)
    rect(px, 6, 4, 9, 5, WHITE)        # облачко пара
    rect(px, 5, 6, 10, 7, STEEL_L)
    rect(px, 7, 9, 8, 11, STEEL_D)
    return px


def tex_technical_passport():
    px = blank(BLUE)
    frame(px, BLUE_D, 1)
    rect(px, 2, 2, 13, 3, GOLD)        # золотая полоса
    rect(px, 3, 6, 12, 7, WHITE)       # строки
    rect(px, 3, 9, 11, 10, WHITE)
    rect(px, 3, 12, 8, 13, WHITE)
    return px


def tex_seal_arcana():
    px = seal(PURPLE, PURPLE_D, spark=GOLD)
    diamond(px, 8, 8, 2, WHITE)
    return px


def tex_seal_network():
    px = seal(TEAL, TEAL_D)
    for i in range(4, 13):             # сетка
        px[8][i] = CYAN
        px[i][8] = CYAN
    px[8][8] = WHITE
    return px


def tex_reinforced_casing():
    px = blank(STEEL)
    frame(px, STEEL_D, 2)
    rect(px, 4, 4, 11, 11, STEEL_L)
    rect(px, 5, 5, 10, 10, STEEL)
    for x, y in [(3, 3), (3, 12), (12, 3), (12, 12)]:  # заклёпки
        px[y][x] = BRASS
    return px


def tex_arcane_converter():
    px = blank(PURPLE_D)
    frame(px, DARK, 1)
    circle(px, 8, 8, 5, PURPLE)
    circle(px, 8, 8, 3, TEAL)
    px[8][8] = WHITE
    rect(px, 0, 7, 2, 8, TEAL_D)       # контакты
    rect(px, 13, 7, 15, 8, TEAL_D)
    return px


def tex_ritual_regulator():
    px = blank(CRIMSON)
    frame(px, DARK, 1)
    rect(px, 3, 3, 12, 12, RED_D)
    diamond(px, 8, 8, 4, GOLD)
    diamond(px, 8, 8, 2, CRIMSON)
    px[8][8] = GOLD
    return px


def tex_automation_core():
    px = blank(DARK)
    frame(px, TEAL_D, 1)
    rect(px, 3, 3, 12, 12, TEAL_D)
    rect(px, 5, 5, 10, 10, TEAL)
    for i in range(3, 13, 3):          # дорожки
        px[i][3] = CYAN
        px[3][i] = CYAN
    px[8][8] = WHITE
    return px


def tex_primal_catalyst():
    px = blank()
    circle(px, 8, 8, 6, GOLD_D)
    circle(px, 8, 8, 5, GOLD)
    diamond(px, 8, 8, 3, WHITE)
    px[8][8] = GOLD_D
    return px


def tex_heart_of_arcanopolis():
    px = blank()
    # сердце
    for y in range(3, 13):
        for x in range(2, 14):
            dx, dy = x - 8, y - 6.5
            lobe = ((dx + 2.2) ** 2 + dy ** 2) ** 0.5
            lobe2 = ((dx - 2.2) ** 2 + dy ** 2) ** 0.5
            tip = abs(dx) * 0.9 + (y - 7) * 1.1 if y > 6 else 0
            if y <= 8:
                if lobe <= 3.4 or lobe2 <= 3.4:
                    px[y][x] = MAGENTA
            else:
                if tip <= 5.2 and 2 <= x <= 13:
                    px[y][x] = MAGENTA
    rect(px, 6, 5, 9, 7, RED)          # блик
    px[5][6] = WHITE
    px[8][8] = GOLD                    # ядро
    px[9][8] = GOLD_D
    return px


TEXTURES = {
    "city_charter": tex_city_charter,
    "seal_craftsmen": tex_seal_craftsmen,
    "seal_steam": tex_seal_steam,
    "technical_passport": tex_technical_passport,
    "seal_arcana": tex_seal_arcana,
    "seal_network": tex_seal_network,
    "reinforced_casing": tex_reinforced_casing,
    "arcane_converter": tex_arcane_converter,
    "ritual_regulator": tex_ritual_regulator,
    "automation_core": tex_automation_core,
    "primal_catalyst": tex_primal_catalyst,
    "heart_of_arcanopolis": tex_heart_of_arcanopolis,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in TEXTURES.items():
        path = OUT / f"{name}.png"
        write_png(path, fn())
        print(f"OK {path.relative_to(OUT.parent.parent.parent.parent)}")
    print(f"Всего: {len(TEXTURES)} текстур → {OUT}")


if __name__ == "__main__":
    main()

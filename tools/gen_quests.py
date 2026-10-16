#!/usr/bin/env python3
"""
gen_quests.py — генератор квестбука «Арканополис» для FTB Quests (1.20.1).
Выпускает config/ftbquests/quests/{data,chapter_groups}.snbt и chapters/*.snbt.

ID объектов — 16-символьные HEX (как в штатных файлах FTB Quests).
После генерации файлы можно дорабатывать в игре (режим редактирования FTB Quests).

Использование:
    python3 tools/gen_quests.py
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "config" / "ftbquests" / "quests"
CHAPTERS = OUT / "chapters"

# Группы глав
# ВАЖНО: ID в FTB Quests парсятся через Long.parseLong(hex, 16) и должны быть
# МЕНЬШЕ 2^63 (первая hex-цифра 0-7). Префикс «A11A» переполнял long: FTB
# присваивал объектам случайные ID и молча отбрасывал все зависимости —
# из-за этого в игре не было ни линий, ни блокировок цепочки. Не возвращать!
G_MAIN = "011A000000000001"
G_SIDE = "011A000000000002"
G_REF = "011A000000000003"

_counters: dict[str, int] = {}


CUSTOM_CHECKS: list = []  # (task_id, cond) — собирается при эмиссии
CHAIN_ROWS: dict = {}  # файл главы -> строки-барьеры цепочки (в порядке квестов)
_CUR_CHAPTER = [""]
_CUR_INDEPENDENT = [False]  # текущий квест независимый (своя JS-«цепочка» без блокировок)
_CUR_QUEST_KEY = [""]  # ключ текущего квеста при эмиссии (строки JS несут deps графа)

HUT_ICONS = {
    "builder": "minecolonies:blockhutbuilder",
    "lumberjack": "minecolonies:blockhutlumberjack",
    "miner": "minecolonies:blockhutminer",
    "farm": "minecolonies:blockhutfarmer",
    "fish": "minecolonies:blockhutfisherman",
    "cook": "minecolonies:blockhutcook",
    "saw": "minecolonies:blockhutsawmill",
    "stone": "minecolonies:blockhutstonemason",
    "black": "minecolonies:blockhutblacksmith",
    "guard": "minecolonies:blockhutguardtower",
    "warehouse": "minecolonies:blockhutwarehouse",
    "courier": "minecolonies:blockhutcourier",
    "home": "minecolonies:blockhutcitizen",
    "townhall": "minecolonies:blockhuttownhall",
    "university": "minecolonies:blockhutuniversity",
    "library": "minecolonies:blockhutlibrary",
    "school": "minecolonies:blockhutschool",
    "hospital": "minecolonies:blockhuthospital",
    "mech": "minecolonies:blockhutmechanic",
}

ICON_OVERRIDES = {
    ("00_prologue", "start"): "minecolonies:supplycamp",
    ("00_prologue", "charter"): "arcanopolis:city_charter",
    ("00_prologue", "p_tr"): "minecraft:chest",
    ("10_epoch_wood_water", "hub"): "arcanopolis:seal_craftsmen",
    ("10_epoch_wood_water", "e1_tr"): "minecraft:chest",
    ("20_epoch_steam_logistics", "hub"): "arcanopolis:seal_steam",
    ("20_epoch_steam_logistics", "e2_tr"): "minecraft:chest",
    ("30_epoch_industry", "hub"): "arcanopolis:technical_passport",
    ("30_epoch_industry", "passport"): "arcanopolis:technical_passport",
    ("30_epoch_industry", "casing"): "arcanopolis:reinforced_casing",
    ("30_epoch_industry", "e3_tr"): "minecraft:chest",
    ("40_epoch_magic", "hub"): "arcanopolis:seal_arcana",
    ("40_epoch_magic", "ritual"): "arcanopolis:ritual_regulator",
    ("40_epoch_magic", "e4_tr"): "minecraft:chest",
    ("50_epoch_network", "hub"): "arcanopolis:seal_network",
    ("50_epoch_network", "project"): "arcanopolis:automation_core",
    ("50_epoch_network", "e5_tr"): "minecraft:chest",
    ("60_epoch_cosmos", "hub"): "arcanopolis:heart_of_arcanopolis",
    ("60_epoch_cosmos", "heart"): "arcanopolis:heart_of_arcanopolis",
    ("60_epoch_cosmos", "finale"): "arcanopolis:heart_of_arcanopolis",
    ("60_epoch_cosmos", "catalyst"): "arcanopolis:primal_catalyst",
    ("60_epoch_cosmos", "e6_tr"): "minecraft:chest",
}


def auto_icon(q) -> str:
    for t in q.tasks:
        if t.ttype == "item":
            return t.item.split("|")[0].split(" ")[0]
        if t.ttype == "kill":
            return "minecraft:" + t.entity.split(":")[-1] + "_spawn_egg"
        if t.ttype == "dimension":
            return "minecraft:obsidian" if "nether" in t.entity else "minecraft:end_stone"
        if t.ttype == "structure":
            return {
                "minecraft:stronghold": "minecraft:ender_eye",
                "minecraft:bastion_remnant": "minecraft:gilded_blackstone",
                "minecraft:end_city": "minecraft:purpur_block",
                "minecraft:ancient_city": "minecraft:sculk",
            }.get(t.entity, "minecraft:compass")
        if t.ttype == "advancement":
            return "minecraft:emerald"
        if t.ttype == "stat":
            return "minecraft:leather_boots"
        if t.ttype == "custom":
            cond = t.cond
            if cond.startswith("item_any:"):
                return cond[len("item_any:"):].split("@")[0].split("|")[0]
            pp = cond.split(":")
            if pp[0] == "townhall":
                return "minecolonies:blockhuttownhall"
            if pp[0] == "citizens":
                return "minecraft:villager_spawn_egg"
            if pp[0] == "building" and len(pp) >= 3:
                return HUT_ICONS.get(pp[1], "minecolonies:supplycamp")
            return "minecraft:book"
    return "minecraft:book"



def uid(kind: str, chapter: int) -> str:
    """Уникальный 16-символьный HEX id: 0A11 | глава(2) | тип(2) | счётчик(8).

    Первая цифра 0 обязательна: id обязан помещаться в signed long (< 2^63),
    иначе FTB Quests не может распарсить его и отбрасывает зависимости.
    """
    k = f"{chapter:02X}{kind}"
    _counters[k] = _counters.get(k, 0) + 1
    return f"0A11{chapter:02X}{kind}{_counters[k]:08X}"


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


@dataclass
class Task:
    ttype: str  # item | checkmark | advancement | custom
    item: str = ""
    count: int = 0
    title: str = ""
    advancement: str = ""
    cond: str = ""  # для custom: townhall:N | citizens:N | building:word:N | item_any:a|b@N | always
    entity: str = ""  # kill: entity id | dimension: dimension id | stat: stat id
    consume: bool = False  # item: потребить предметы (торговые квесты)


@dataclass
class Reward:
    item: str
    count: int = 1
    rtype: str = "item"  # item | command | xp


@dataclass
class Quest:
    key: str
    title: str
    x: float
    y: float
    desc: list[str] = field(default_factory=list)
    tasks: list[Task] = field(default_factory=list)
    rewards: list[Reward] = field(default_factory=list)
    deps: list[str] = field(default_factory=list)  # "quest" или "file:quest"
    icon: str = ""
    optional: bool = False
    repeatable: bool = False
    independent: bool = False  # независимый квест: без цепочки и без линии к соседям
    secret: bool = False  # секретный: без линий, невидим до выполнения (invisible)


@dataclass
class Chapter:
    file: str
    title: str
    icon: str
    group: str
    order: int
    quests: list[Quest] = field(default_factory=list)
    deps_ch: list[str] = field(default_factory=list)  # файлы глав-зависимостей (жёсткие эпохи)


def item_task(item: str, count: int = 0, title: str = "") -> Task:
    return Task("item", item=item, count=count, title=title)


def check(title: str) -> Task:
    return Task("checkmark", title=title)


def custom(cond: str, title: str = "") -> Task:
    """Задача с авто-детекцией (custom) — НЕ отмечается игроком вручную.

    cond: townhall:N | citizens:N | building:word:N | always
    """
    return Task("custom", cond=cond, title=title)


def adv_task(advancement: str) -> Task:
    return Task("advancement", advancement=advancement)


def _pretty(item_id: str) -> str:
    return item_id.split(":")[-1].replace("_", " ")


HUT_RU = {
    "builder": "хижину строителя", "lumberjack": "хижину лесоруба",
    "miner": "хижину шахтёра", "farm": "ферму", "fish": "хижину рыбака",
    "cook": "поваренную хижину", "saw": "лесопилку",
    "stone": "хижину каменщика", "black": "кузницу",
    "guard": "сторожевую башню", "warehouse": "склад",
    "courier": "хижину курьера", "home": "жилой дом",
    "townhall": "ратушу", "university": "университет",
    "library": "библиотеку", "school": "школу", "hospital": "больницу",
    "mech": "мастерскую механика",
}

MOB_RU = {
    "zombie": "зомби", "skeleton": "скелетов", "spider": "пауков",
    "creeper": "криперов", "blaze": "ифритов (блейзов)",
    "enderman": "эндерменов", "wither_skeleton": "визер-скелетов",
    "pillager": "разбойников (пиллагеров)", "vindicator": "поборников (виндикаторов)",
    "ravager": "разорителей (рейвагеров)",
}

DIM_RU = {
    "minecraft:the_nether": "Нижний мир (Незер)",
    "minecraft:the_end": "Край (Энд)",
    "minecraft:overworld": "обычный мир",
}

STRUCT_RU = {
    "minecraft:stronghold": "крепость (стронгхолд)",
    "minecraft:bastion_remnant": "развалины бастиона",
    "minecraft:end_city": "город Края",
    "minecraft:ancient_city": "древний город",
}


def task_instruction(t: Task) -> str:
    """Человекочитаемая строка «что сделать» для одной задачи."""
    if t.ttype == "item":
        n = t.count or 1
        if t.consume:
            return (f"Сдайте: {_pretty(t.item)} [{t.item}] ×{n}. "
                    "Предметы будут потрачены при сдаче квеста.")
        return (f"Добудьте или изготовьте: {_pretty(t.item)} [{t.item}] ×{n}. "
                "Засчитывается, пока предмет находится у вас в инвентаре.")
    if t.ttype == "kill":
        mob = MOB_RU.get(t.entity.split(":")[-1], _pretty(t.entity))
        return f"Победите существ: {mob} — {t.count} шт."
    if t.ttype == "dimension":
        return f"Отправьтесь в измерение: {DIM_RU.get(t.entity, t.entity)}."
    if t.ttype == "structure":
        return (f"Найдите и посетите: {STRUCT_RU.get(t.entity, t.entity)}. "
                "Зайдите внутрь, чтобы сервер зафиксировал визит.")
    if t.ttype == "advancement":
        return f"Получите достижение: {_pretty(t.advancement)} [{t.advancement}]."
    if t.ttype == "stat":
        if "walk" in t.entity:
            return f"Пройдите пешком суммарно {t.count // 100000} км (считает ванильная статистика)."
        return f"Доведите статистику {t.entity} до {t.count}."
    if t.ttype == "custom":
        cond = t.cond or "always"
        if cond.startswith("item_any:"):
            rest = cond[len("item_any:"):]
            items, n = rest.rsplit("@", 1)
            opts = ", ".join(f"{_pretty(x)} [{x}]" for x in items.split("|"))
            return f"Получите любой из вариантов: {opts} — всего ×{n}."
        p = cond.split(":")
        if p[0] == "camp":
            return ("Установите лагерь или корабль снабжения MineColonies в выбранном месте. "
                    "Сервер сам найдёт постройку рядом с вами (или засчитает шаг, когда появится ратуша).")
        if p[0] == "townhall":
            return (f"Улучшите ратушу своей колонии до уровня {p[1]} "
                    "(заказ на улучшение выдаётся строителю).")
        if p[0] == "citizens":
            return (f"Население колонии: не меньше {p[1]} жителей. "
                    "Принимайте новых жителей, когда есть свободные жилые дома и еда.")
        if p[0] == "building" and len(p) >= 3:
            hut = HUT_RU.get(p[1], p[1])
            return (f"Постройте или улучшите {hut} — нужен уровень не ниже {p[2]}. "
                    "Заказ на постройку/улучшение кладётся строителю, материалы подвезёт курьер.")
        return "Ознакомительный шаг: специальных действий не нужно, он засчитается сам."
    return "Условие проверяется автоматически."


def describe_quest(q: Quest) -> list[str]:
    """Полноценное описание квеста: что сделать по каждой задаче + подсказки."""
    lines = [task_instruction(t) for t in q.tasks]
    kinds = {t.ttype for t in q.tasks}
    conds = [(t.cond or "") for t in q.tasks if t.ttype == "custom"]
    if any(c.startswith(("townhall:", "citizens:", "building:")) for c in conds):
        lines.append("Условия колонии проверяются автоматически каждые несколько секунд, "
                     "пока вы рядом со своим городом. Вручную отмечать ничего нельзя и не нужно.")
    if q.repeatable:
        lines.append("Повторяемый квест: после получения награды его можно выполнять снова и снова.")
    elif q.independent:
        lines.append("Независимый квест: он не входит в основную цепочку, не блокирует другие квесты "
                     "и не требует выполнения предыдущих.")
    else:
        lines.append("Квест цепочки: следующий квест по линии откроется только после выполнения этого.")
    return lines


def ir(item: str, count: int = 1) -> Reward:
    return Reward(item, count)


def rcmd(command: str) -> Reward:
    return Reward(command, 1, "command")


def rxp(n: int) -> Reward:
    return Reward("", n, "xp")


def kill_task(entity: str, n: int = 1, title: str = "") -> Task:
    return Task("kill", count=n, title=title, entity=entity)


def dim_task(dimension: str, title: str = "") -> Task:
    return Task("dimension", title=title, entity=dimension)


def stat_task(stat: str, value: int, title: str = "") -> Task:
    return Task("stat", count=value, title=title, entity=stat)


# ============================================================================
# Содержание глав
# ============================================================================

def build_chapters() -> list[Chapter]:
    ch: list[Chapter] = []

    # ---------------------------------------------------------------- ПРОЛОГ
    ch.append(Chapter("00_prologue", "Пролог. «Право на поселение»",
                      "arcanopolis:city_charter", G_MAIN, 0, [
        Quest("start", "Хартия нового мира", 0, 0,
              ["Добро пожаловать в Арканополис!",
               "Эта сборка — о городе, который становится машиной.",
               "Начните с выбора площадки и поставьте лагерь снабжения."],
              [check("Выберите площадку и поставьте лагерь или корабль снабжения")],
              [ir("minecraft:bread", 16)], []),
        Quest("orders", "Строительные заказы", 2, 0,
              ["Освойте систему заказов MineColonies:",
               "рабочие запрашивают материалы, а вы обеспечиваете поставки."],
              [check("Выполните первый строительный заказ")], [], ["start"]),
        Quest("town_hall", "Ратуша", 2, 1.5,
              ["Сердце колонии — ратуша. С неё начинается развитие города."],
              [check("Возведите ратушу I уровня")],
              [ir("minecraft:emerald", 8)], ["orders"]),
        Quest("builder", "Хижина строителя", 4, 1.5,
              ["Строитель возводит здания по вашим заказам.",
               "Без хижины строителя колония не вырастет."],
              [check("Постройте хижину строителя")], [], ["town_hall"]),
        Quest("home", "Первый жилой дом", 4, 3,
              ["Жителям нужна крыша над головой."],
              [check("Постройте первое жилое здание")],
              [ir("minecraft:oak_planks", 32)], ["builder"]),
        Quest("food", "Хлеб насущный", 2, 3,
              ["Первые жители не должны голодать:",
               "запасы еды — обязательное условие основания колонии."],
              [item_task("minecraft:bread", 16)], [], ["start"]),
        Quest("workers", "Первые жители", 4, 0,
              ["Примите первого жителя и выдайте ему профессию."],
              [check("Примите первого жителя в колонию")], [], ["town_hall"]),
        Quest("logistics", "Система доставки", 6, 1.5,
              ["Курьеры и склад — кровеносная система города."],
              [check("Настройте доставку материалов курьером")],
              [ir("minecraft:emerald", 4)], ["workers"], optional=True),
        Quest("charter", "Право на поселение", 6, 0,
              ["Колония основана, обеспечена едой и рабочей силой.",
               "Городская хартия подтверждает ваше право на развитие города."],
              [check("Колония основана и обеспечена едой")],
              [ir("arcanopolis:city_charter", 1), ir("minecraft:experience_bottle", 8)],
              ["town_hall", "builder", "food", "workers"]),
    ]))

    # --------------------------------------------------------- ЭПОХА I
    ch.append(Chapter("10_epoch_wood_water", "Эпоха I. «Дерево, вода и ремесло»",
                      "create:water_wheel", G_MAIN, 1, [
        Quest("hub", "Эпоха I", 0, 0,
              ["Дерево, вода и ремесло — первая технологическая эпоха.",
               "Город растёт, а Create начинает работать на него."],
              [check("Приступить к эпохе ремесла")], [], ["00_prologue:charter"]),

        # городская ветка
        Quest("town2", "Ратуша II уровня", -2, 0,
              ["Расширяйте центр колонии."],
              [check("Улучшите ратушу до II уровня")], [], ["hub"]),
        Quest("pop8", "Восемь жителей", -2, 1.5,
              ["Городу нужны люди."],
              [check("Доведите население до 8 жителей")], [], ["town2"]),
        Quest("forester", "Лесоруб", -4, 0,
              ["Древесина — основа строительства и ранней механики."],
              [check("Постройте хижину лесоруба")], [], ["town2"]),
        Quest("miner", "Шахтёр", -4, 1.5,
              ["Руда нужна и колонии, и вашим механизмам."],
              [check("Постройте хижину шахтёра")], [], ["town2"]),
        Quest("warehouse", "Склад", -4, -1.5,
              ["Склад собирает ресурсы города в одном месте."],
              [check("Постройте склад")], [], ["town2"]),
        Quest("courier", "Курьер", -4, -3,
              ["Курьер развозит материалы по хижинам."],
              [check("Наймите хотя бы одного курьера")], [], ["warehouse"]),
        Quest("food_prod", "Производство пищи", -2, -1.5,
              ["Ферма или пекарня — пищевая инфраструктура города."],
              [check("Запустите начальное производство пищи")], [], ["hub"]),

        # техническая ветка
        Quest("water_wheel", "Водяное колесо", 2, 0,
              ["Первая энергия Create — сила воды."],
              [item_task("create:water_wheel")], [ir("create:cogwheel", 8)], ["hub"]),
        Quest("shaft", "Валы и передачи", 2, 1.5,
              ["Без передачи энергии автоматизации не бывает."],
              [item_task("create:shaft", 16)], [], ["water_wheel"]),
        Quest("press", "Механический пресс", 4, 1.5,
              ["Пресс делает пластины — основу деталей."],
              [item_task("create:mechanical_press")], [], ["shaft"]),
        Quest("saw", "Механическая пила", 4, 0,
              ["Пила ускоряет работу с деревом для стройки."],
              [item_task("create:mechanical_saw")], [], ["shaft"]),
        Quest("fan", "Вентиляторная обработка", 4, -1.5,
              ["Вентилятор — дробление, смоление, охлаждение."],
              [item_task("create:encased_fan")], [], ["water_wheel"]),
        Quest("conveyor", "Простые линии", 6, 0,
              ["Конвейерные линии связывают механизмы в производство."],
              [item_task("create:belt_connector", 8)], [], ["press", "saw"]),

        # магическая ветка
        Quest("spellbook", "Книга заклинаний", 2, -3,
              ["Ars Nouveau — магия источника, которая работает на производство."],
              [check("Создайте книгу заклинаний Ars Nouveau")],
              [ir("minecraft:amethyst_shard", 4)], ["hub"]),
        Quest("source", "Самоцветы источника", 4, -3,
              ["Самоцветы — топливо магии и компонент поздних рецептов.",
               "Их можно автоматизировать дробилкой Create (см. JEI)."],
              [item_task("ars_nouveau:source_gem", 8)], [], ["spellbook"]),

        # ключевой проект
        Quest("project", "Ключевой проект: городская мастерская", 8, 0,
              ["Автоматизируйте производство строительных компонентов:",
               "доски, обработанный камень, железные пластины.",
               "Город должен получать их без вашего участия."],
              [check("Мастерская автоматически производит доски, камень и пластины"),
               item_task("create:iron_sheet", 16)],
              [ir("arcanopolis:seal_craftsmen", 1), ir("minecraft:emerald", 16)],
              ["conveyor", "food_prod", "source", "courier"]),
    ]))

    # --------------------------------------------------------- ЭПОХА II
    ch.append(Chapter("20_epoch_steam_logistics", "Эпоха II. «Пар и логистика»",
                      "create:steam_engine", G_MAIN, 2, [
        Quest("hub", "Эпоха II", 0, 0,
              ["Пар и логистика: город переходит к промышленным методам."],
              [check("Приступить к эпохе пара")], [], ["10_epoch_wood_water:project"]),

        # город
        Quest("town23", "Ратуша II–III уровня", -2, 0,
              ["Продолжайте расширять центр колонии."],
              [check("Улучшите ратушу до II–III уровня")], [], ["hub"]),
        Quest("builder3", "Строитель III уровня", -2, 1.5,
              ["Продвинутый строитель возводит крупные здания."],
              [check("Прокачайте строителя до III уровня")], [], ["town23"]),
        Quest("wh2", "Склад II уровня", -4, 0,
              ["Растущий город требует большего склада."],
              [check("Улучшите склад до II уровня")], [], ["town23"]),
        Quest("pop12", "Двенадцать жителей", -2, -1.5,
              ["Город растёт."],
              [check("Доведите население до 12 жителей")], [], ["town23"]),
        Quest("university", "Университет", -4, 1.5,
              ["Городские исследования — условие будущих эпох.",
               "Постройте университет (или выбранное здание исследований)."],
              [check("Постройте университет")],
              [ir("minecraft:experience_bottle", 16)], ["town23"]),
        Quest("food2", "Стабильная еда", -4, -1.5,
              ["Производство пищи должно быть регулярным."],
              [check("Обеспечьте стабильное производство пищи")], [], ["hub"]),

        # техника и магия
        Quest("brass", "Латунная автоматизация", 2, 0,
              ["Латунь Create — материал точных механизмов."],
              [item_task("create:brass_ingot", 16)], [], ["hub"]),
        Quest("steam", "Паровой двигатель", 2, 1.5,
              ["Паровая энергия питает тяжёлые механизмы."],
              [item_task("create:steam_engine")], [], ["brass"]),
        Quest("precision", "Точная механика", 4, 1.5,
              ["Точные механизмы — сердце автоматических линий."],
              [item_task("create:precision_mechanism", 4)], [], ["steam"]),
        Quest("rails", "Железнодорожная логистика", 4, 0,
              ["Поезда или конвейеры — выбирайте транспорт города."],
              [check("Организуйте железнодорожную или конвейерную логистику")],
              [ir("minecraft:rail", 64)], ["steam"], optional=True),
        Quest("ars_auto", "Первая магическая автоматизация", 2, -1.5,
              ["Источник и первые устройства Ars Nouveau обслуживают ремёсла."],
              [check("Запустите первую автоматизацию Ars Nouveau")], [], ["brass"]),

        # ключевой проект
        Quest("project", "Ключевой проект: мастерская компонентов", 6, 0,
              ["Городская мастерская автоматически производит",
               "пластины, шестерни и стандартные строительные компоненты.",
               "Подтвердите централизованное снабжение рабочих."],
              [check("Мастерская производит пластины, шестерни и компоненты"),
               item_task("create:brass_casing", 8)],
              [ir("arcanopolis:seal_steam", 1), ir("minecraft:emerald", 24)],
              ["precision", "food2", "university", "ars_auto"]),
    ]))

    # --------------------------------------------------------- ЭПОХА III
    ch.append(Chapter("30_epoch_industry", "Эпоха III. «Механизмы и индустриальный город»",
                      "mekanism:enrichment_chamber", G_MAIN, 3, [
        Quest("hub", "Эпоха III", 0, 0,
              ["Тяжёлая промышленность: город начинает обеспечивать",
               "работу производственных цепочек, а не только получать материалы."],
              [check("Приступить к индустриальной эпохе")], [], ["20_epoch_steam_logistics:project"]),

        # город
        Quest("town3", "Ратуша III уровня", -2, 0,
              ["Индустриальному городу нужна крепкая администрация."],
              [check("Улучшите ратушу до III уровня")], [], ["hub"]),
        Quest("pop20", "Двадцать жителей", -2, 1.5,
              ["Промышленность требует рабочих рук."],
              [check("Доведите население до 20 жителей")], [], ["town3"]),
        Quest("wh3", "Склад II–III уровня", -4, 0,
              ["Потоки ресурсов растут — склад должен успевать."],
              [check("Улучшите склад до II–III уровня")], [], ["town3"]),
        Quest("research", "Исследования колонии", -4, 1.5,
              ["Завершите несколько исследований в университете."],
              [check("Завершите несколько исследований университета")],
              [], ["town3"]),
        Quest("food_fuel", "Еда и топливо", -2, -1.5,
              ["Жители должны быть обеспечены едой и топливом."],
              [check("Настройте регулярное снабжение едой и топливом")], [], ["hub"]),

        # thermal
        Quest("thermal_line", "Линия Thermal", 2, -1.5,
              ["Дробление, обогащение, плавка — базовая переработка."],
              [check("Запустите линию переработки Thermal")], [], ["hub"]),
        Quest("energy", "Хранение энергии", 4, -1.5,
              ["Промышленность без буфера энергии — не промышленность."],
              [check("Создайте систему хранения энергии")], [], ["thermal_line"]),

        # mekanism
        Quest("enrichment", "Обогащение руд", 2, 0,
              ["Mekanism многократно повышает выход из руды."],
              [item_task("mekanism:enrichment_chamber")], [], ["hub"]),
        Quest("steel", "Производство стали", 2, 1.5,
              ["Сталь — основа усиленных корпусов и поздних машин."],
              [item_task("mekanism:ingot_steel", 16)], [], ["enrichment"]),
        Quest("chain", "Полная цепочка переработки", 4, 0,
              ["Запустите полную цепочку: от руды до готового продукта."],
              [check("Автоматическая переработка руды работает без участия игрока")],
              [ir("minecraft:diamond", 4)], ["steel"]),
        Quest("casing", "Партия усиленных корпусов", 4, 1.5,
              ["Усиленный корпус — базовый компонент поздних эпох.",
               "См. рецепт в JEI: сталь + латунь + машинная рама."],
              [item_task("arcanopolis:reinforced_casing", 4)], [], ["steel"]),

        # ключевой проект
        Quest("warehouse_link", "Промышленная линия и склад", 6, 0,
              ["Подключите промышленную линию к складу колонии:",
               "курьеры должны получать продукцию без вашего участия."],
              [check("Промышленная линия подключена к складу колонии")],
              [], ["chain"]),
        Quest("passport", "Технический паспорт", 8, 0,
              ["Городской контрольный документ эпохи механизмов.",
               "Скрафтите его (расходует Печать пара!) — и дорога в эпоху магии открыта."],
              [item_task("arcanopolis:technical_passport")],
              [ir("minecraft:experience_bottle", 16)],
              ["casing", "warehouse_link", "research", "food_fuel"]),
    ]))

    # --------------------------------------------------------- ЭПОХА IV
    ch.append(Chapter("40_epoch_magic", "Эпоха IV. «Расцвет магии»",
                      "ars_nouveau:source_gem", G_MAIN, 4, [
        Quest("hub", "Эпоха IV", 0, 0,
              ["Магия — самостоятельная система производства",
               "со своими материалами, инфраструктурой и специализациями."],
              [check("Приступить к эпохе магии")], [], ["30_epoch_industry:passport"]),

        # Ars Nouveau
        Quest("ars_base", "Источник и заклинания", -4, -2,
              ["Освойте книгу заклинаний и сбор источника."],
              [check("Освойте основы Ars Nouveau")], [], ["hub"]),
        Quest("ars_helper", "Магические помощники", -4, -0.5,
              ["Слуги и устройства Ars Nouveau обслуживают производство."],
              [check("Автоматизируйте операции магическими помощниками")],
              [], ["ars_base"]),
        Quest("ars_create", "Ars Creo: магия и механизмы", -4, 1,
              ["Свяжите Ars Nouveau с Create (Ars Creo)."],
              [check("Используйте интеграцию Ars Nouveau и Create")],
              [], ["ars_helper"], optional=True),

        # Botania
        Quest("mana_pool", "Мана-пул", -2, -2,
              ["Начните цветочную инфраструктуру Botania."],
              [check("Создайте мана-пул и первые цветы")], [], ["hub"]),
        Quest("mana_auto", "Устойчивая генерация маны", -2, -0.5,
              ["Мана должна производиться автоматически."],
              [check("Организуйте устойчивую автогенерацию маны")],
              [ir("minecraft:poppy", 16)], ["mana_pool"]),

        # Blood Magic
        Quest("altar", "Алтарь крови", 2, -2,
              ["Поставьте алтарь Blood Magic и развивайте его."],
              [check("Создайте алтарь крови")], [], ["hub"]),
        Quest("slates", "Кровавые компоненты", 2, -0.5,
              ["Первые компоненты прогрессии Blood Magic."],
              [item_task("bloodmagic:blankslate", 4)], [], ["altar"]),
        Quest("ritual", "Ритуал", 2, 1,
              ["Проведите ритуал как контрольное испытание школы."],
              [check("Завершите ритуал Blood Magic")], [], ["slates"], optional=True),

        # Eidolon
        Quest("alchemy", "Алхимия Eidolon", 4, -2,
              ["Освойте базовую алхимию Eidolon: Repraised."],
              [check("Освойте базовую алхимию Eidolon")], [], ["hub"]),
        Quest("pewter", "Характерные компоненты", 4, -0.5,
              ["Изготовьте несколько характерных компонентов школы.",
               "(ID предметов Eidolon сверьте в JEI)"],
              [check("Изготовьте алхимические компоненты Eidolon")], [], ["alchemy"]),

        # объединение
        Quest("lab", "Ключевой проект: арканная лаборатория", 0, 2,
              ["Постройте городскую арканную лабораторию:",
               "отдельные линии для источника, маны и ритуальных компонентов.",
               "Достаточно базового достижения в каждой школе."],
              [check("Арканная лаборатория построена и работает"),
               check("Есть достижение в каждой из четырёх школ")],
              [ir("arcanopolis:seal_arcana", 1), ir("minecraft:experience_bottle", 24)],
              ["ars_helper", "mana_auto", "ritual", "pewter"]),
    ]))

    # --------------------------------------------------------- ЭПОХА V
    ch.append(Chapter("50_epoch_network", "Эпоха V. «Сеть и автоматизированное производство»",
                      "ae2:controller", G_MAIN, 5, [
        Quest("hub", "Эпоха V", 0, 0,
              ["Applied Energistics 2 — управляющий слой производства:",
               "физические фабрики, городское снабжение и магические материалы",
               "объединяются в одной сети."],
              [check("Приступить к эпохе сети")], [], ["40_epoch_magic:lab"]),

        Quest("ae2_base", "Сеть AE2", 2, 0,
              ["Запустите контроллер, диски и терминалы."],
              [item_task("ae2:controller")], [], ["hub"]),
        Quest("cells", "Хранение", 2, 1.5,
              ["Ячейки и диски — централизованное хранение ресурсов."],
              [check("Организуйте централизованное хранение ресурсов")],
              [], ["ae2_base"]),
        Quest("patterns", "Шаблоны и заказы", 4, 1.5,
              ["Настройте шаблоны и автоматическое выполнение заказов."],
              [check("Автоматический крафт по шаблонам работает")],
              [], ["cells"]),
        Quest("mek_link", "Applied Mekanistics", 2, -1.5,
              ["Ресурсы Mekanism — в общей сети AE2."],
              [check("Интегрируйте Mekanism с сетью AE2")], [], ["ae2_base"], optional=True),
        Quest("lines", "Несколько линий", 4, -1.5,
              ["Сеть снабжает несколько производственных линий одновременно."],
              [check("Настройте снабжение нескольких линий из сети")], [], ["ae2_base"]),

        Quest("project", "Ключевой проект: «от руды до корпуса»", 6, 0,
              ["Запустите автоматическое производство:",
               "от сырой руды до готового промышленного корпуса.",
               "Скрафтите Ядро автоматизации (расходует Печать расцвета)."],
              [check("Автопроизводство «от руды до корпуса» работает"),
               item_task("arcanopolis:automation_core")],
              [ir("arcanopolis:seal_network", 1), ir("minecraft:diamond", 8)],
              ["patterns", "lines", "mek_link"]),
    ]))

    # --------------------------------------------------------- ЭПОХА VI
    ch.append(Chapter("60_epoch_cosmos", "Эпоха VI. «Космический горизонт»",
                      "arcanopolis:heart_of_arcanopolis", G_MAIN, 6, [
        Quest("hub", "Эпоха VI", 0, 0,
              ["Финальная эпоха: организуйте город, производства и магические школы.",
               "Испытание — в сложности организации, а не в количестве слитков."],
              [check("Приступить к финальной эпохе")], [], ["50_epoch_network:project"]),

        Quest("mek_late", "Поздняя переработка", -2, 0,
              ["Продвинутые системы Mekanism: поздние сплавы и энергетика."],
              [check("Запустите поздние производства Mekanism")], [], ["hub"]),
        Quest("thermal_late", "Продвинутые установки", -2, 1.5,
              ["Сложные компоненты Create и Thermal на пике мощности."],
              [check("Соберите продвинутые установки Thermal и Create")],
              [], ["hub"]),
        Quest("rare", "Редкие реагенты", -2, -1.5,
              ["Редкие компоненты Ars Nouveau, Botania, Blood Magic и Eidolon."],
              [check("Соберите редкие реагенты всех четырёх школ")], [], ["hub"]),
        Quest("center", "Центральное сооружение", 2, -1.5,
              ["Постройте центральный комплекс колонии под Сердце Арканополиса."],
              [check("Центральное сооружение подготовлено")], [], ["hub"]),

        Quest("catalyst", "Изначальный катализатор", 2, 0,
              ["Редкий энергетический реагент — смесь алхимии, эндерия,",
               "террасталя и атомарного сплава (см. JEI: верстак механизмов)."],
              [item_task("arcanopolis:primal_catalyst")],
              [ir("minecraft:nether_star", 1)], ["mek_late", "rare"]),

        Quest("heart", "Сердце Арканополиса", 4, 0,
              ["Финальная механическая сборка города-машины.",
               "Расходует Печать сети. См. рецепт в JEI."],
              [item_task("arcanopolis:heart_of_arcanopolis")],
              [ir("minecraft:nether_star", 2), ir("minecraft:experience_bottle", 64)],
              ["catalyst", "thermal_late"]),

        Quest("finale", "Запуск проекта", 6, 0,
              ["Встройте Сердце в центральное сооружение колонии.",
               "Город работает, производство снабжает поселение,",
               "магия и технологии сходятся в единую систему.",
               "Добро пожаловать в Арканополис."],
              [check("Сердце встроено в центральное сооружение"),
               check("Колония обеспечивается без ручной доставки игроком")],
              [ir("minecraft:totem_of_undying", 1), ir("minecraft:emerald_block", 8)],
              ["heart", "center"]),
    ]))

    # ----------------------------------------------------- НЕОБЯЗАТЕЛЬНЫЕ
    ch.append(Chapter("70_side_architects", "Необязательное: «Архитекторы»",
                      "minecraft:stone_bricks", G_SIDE, 7, [
        Quest("hub", "Архитекторы", 0, 0,
              ["Здания колонии, декор и оформление кварталов."],
              [check("Приступить к развитию архитектуры")], []),
        Quest("style", "Стиль города", -2, 0,
              ["Выберите единый архитектурный стиль колонии."],
              [check("Оформите ратушу и центр в едином стиле")],
              [ir("minecraft:quartz_block", 16)], ["hub"], optional=True),
        Quest("quarters", "Три квартала", 2, 0,
              ["Жилой, ремесленный и торговый кварталы."],
              [check("Выстройте три различимых квартала")],
              [ir("minecraft:item_frame", 8)], ["hub"], optional=True),
        Quest("park", "Городской парк", -2, 1.5,
              ["Зелёное пространство для жителей."],
              [check("Разбейте парк или площадь")],
              [ir("minecraft:flowering_azalea", 16)], ["hub"], optional=True),
        Quest("monument", "Монумент", 2, 1.5,
              ["Памятник городу, который станет машиной."],
              [check("Постройте городской монумент")],
              [ir("minecraft:bell", 1)], ["quarters"], optional=True),
    ]))

    ch.append(Chapter("71_side_expeditions", "Необязательное: «Экспедиции»",
                      "minecraft:compass", G_SIDE, 8, [
        Quest("hub", "Экспедиции", 0, 0,
              ["Исследование мира и поиск редких материалов."],
              [check("Отправиться в первую экспедицию")], []),
        Quest("structures", "Заброшенные постройки", -2, 0,
              ["Ищите структуры и руины — источник редких ресурсов."],
              [check("Найдите и обыщите структуру вдали от дома")],
              [ir("minecraft:golden_apple", 4)], ["hub"], optional=True),
        Quest("nether", "Нижний мир", 2, 0,
              ["Незер — источник энергии и редких материалов."],
              [adv_task("minecraft:story/enter_the_nether")],
              [ir("minecraft:blaze_rod", 8)], ["hub"], optional=True),
        Quest("end", "Край", 2, 1.5,
              ["Энд — финальный рубеж для эндгейм-материалов."],
              [adv_task("minecraft:story/enter_the_end")],
              [ir("minecraft:ender_pearl", 16)], ["nether"], optional=True),
        Quest("colony_ruins", "Следы колоний", -2, 1.5,
              ["Структуры MineColonies в дикой природе."],
              [check("Найдите заброшенное поселение MineColonies")],
              [ir("minecraft:emerald", 16)], ["hub"], optional=True),
    ]))

    ch.append(Chapter("72_side_schools", "Необязательное: «Магистры школы»",
                      "botania:terrasteel_ingot", G_SIDE, 9, [
        Quest("hub", "Магистры школы", 0, 0,
              ["Дополнительные испытания для каждой магической школы."],
              [check("Выбрать школу для углублённого изучения")], []),
        Quest("ars_master", "Магистр Источника", -2, 0,
              ["Освойте продвинутые заклинания и автоматизацию Ars Nouveau."],
              [check("Завершите испытание школы Источника")],
              [ir("minecraft:amethyst_block", 4)], ["hub"], optional=True),
        Quest("botania_master", "Магистр Маны", -2, 1.5,
              ["Продвинутая инфраструктура маны и преобразование ресурсов."],
              [check("Завершите испытание школы Маны")],
              [ir("minecraft:diamond", 8)], ["hub"], optional=True),
        Quest("blood_master", "Магистр Крови", 2, 0,
              ["Продвинутые ритуалы и кровавая алхимия."],
              [check("Завершите испытание школы Крови")],
              [ir("minecraft:redstone_block", 8)], ["hub"], optional=True),
        Quest("eidolon_master", "Магистр Алхимии", 2, 1.5,
              ["Продвинутая алхимия и ритуалы Eidolon."],
              [check("Завершите испытание школы Алхимии")],
              [ir("minecraft:gold_block", 8)], ["hub"], optional=True),
    ]))

    ch.append(Chapter("73_side_engineering", "Необязательное: «Инженерные задачи»",
                      "create:precision_mechanism", G_SIDE, 10, [
        Quest("hub", "Инженерные задачи", 0, 0,
              ["Альтернативные схемы фабрик и транспортных сетей."],
              [check("Взять первую инженерную задачу")], []),
        Quest("layout", "Компактная фабрика", -2, 0,
              ["Разместите полную производственную линию на минимальной площади."],
              [check("Постройте компактную фабрику")],
              [ir("create:precision_mechanism", 4)], ["hub"], optional=True),
        Quest("transport", "Транспортная сеть", 2, 0,
              ["Свяжите несколько цехов единой транспортной системой."],
              [check("Постройте транспортную сеть между цехами")],
              [ir("create:brass_casing", 8)], ["hub"], optional=True),
        Quest("power", "Энергомост", -2, 1.5,
              ["Передавайте энергию между удалёнными цехами."],
              [check("Создайте энергомост между цехами")],
              [ir("minecraft:redstone_block", 4)], ["hub"], optional=True),
        Quest("sorting", "Сортировочная станция", 2, 1.5,
              ["Автоматическая сортировка продукции города."],
              [check("Постройте сортировочную станцию")],
              [ir("minecraft:hopper", 8)], ["transport"], optional=True),
    ]))

    ch.append(Chapter("74_side_supply", "Необязательное: «Город без дефицита»",
                      "minecraft:bread", G_SIDE, 11, [
        Quest("hub", "Город без дефицита", 0, 0,
              ["Испытание на длительное автоматическое снабжение колонии."],
              [check("Приступить к испытанию снабжения")], []),
        Quest("week", "Неделя без участия", 0, 1.5,
              ["Семь игровых дней колония живёт без ручной доставки."],
              [check("7 игровых дней снабжение работает автоматически")],
              [ir("minecraft:bread", 32)], ["hub"], optional=True),
        Quest("month", "Месяц без дефицита", 2, 1.5,
              ["Тридцать дней: еда, топливо, стройматериалы — всё в достатке."],
              [check("30 игровых дней без дефицита в колонии")],
              [ir("minecraft:emerald_block", 4)], ["week"], optional=True),
        Quest("trophy", "Трофей снабжения", 2, 0,
              ["Город-машина работает сам."],
              [check("Колония функционирует без вашего участия")],
              [ir("arcanopolis:city_charter", 1)], ["month"], optional=True),
    ]))

    # ---------------------------------------------------------- СПРАВОЧНИК
    ch.append(Chapter("80_reference", "Справочник сборки",
                      "minecraft:book", G_REF, 12, [
        Quest("seals", "Как работают печати", 0, 0,
              ["Эпохальные печати выдаются ключевыми квестами",
               "и РАСХОДУЮТСЯ в переходных крафтах:",
               "Технический паспорт, Ядро автоматизации, Сердце Арканополиса.",
               "Потеряли печать? Повторите наградный квест невозможно —",
               "восстановите печать крафтом по рецепту в JEI."],
              [check("Разобраться в системе печатей")], []),
        Quest("items", "Кастомные предметы", 2, 0,
              ["12 предметов arcanopolis: — от Городской хартии",
               "до Сердца Арканополиса. Все видны в JEI."],
              [check("Изучить список кастомных предметов")], [], ["seals"]),
        Quest("epochs", "Условия эпох", 2, 1.5,
              ["Каждая эпоха требует городских и производственных достижений.",
               "Подробности — в docs/02-progression.md репозитория сборки."],
              [check("Изучить условия перехода между эпохами")], [], ["items"]),
        Quest("colony", "MineColonies: заказы", -2, 0,
              ["Строительные заказы, запросы рабочих, инвентари хижин",
               "и система доставки — основа городской прогрессии."],
              [check("Изучить механики заказов и доставки")], []),
        Quest("kubejs", "Куда смотреть при правках", -2, 1.5,
              ["Рецепты — kubejs/server_scripts/.",
               "Ошибки — команда /kubejs errors.",
               "Квесты — режим редактирования FTB Quests."],
              [check("Запомнить, где лежат настройки сборки")], [], ["colony"]),
    ]))

    ch.append(_relics_chapter())

    return ch



# ============================================================================
# Дополнительный контент 0.9.0: реликвии, боссы Cataclysm, листья Tinkers',
# секретные квесты. Всё — опциональное/независимое: ворота эпох не запирает.
# ============================================================================

RELICS: list[tuple[str, str, int, str]] = [
    # (id предмета relics:*, русское имя, награда опытом (уровни), лор)
    ("infinity_ham", "Бесконечный окорок", 10, "Говорят, этот окорок невозможно доесть."),
    ("space_dissector", "Рассекатель пространства", 10, "Инструмент, которому тесно в трёх измерениях."),
    ("magic_mirror", "Волшебное зеркало", 10, "Показывает больше, чем простое отражение."),
    ("elytra_booster", "Ускоритель элитр", 10, "С ним небо становится ближе."),
    ("enders_hand", "Рука Эндера", 10, "Дотягивается туда, куда не достаёт своя."),
    ("bastion_ring", "Кольцо бастиона", 6, "Трофей из самого сердца Нижнего мира."),
    ("chorus_inhibitor", "Ингибитор хоруса", 6, "Держит прыгучую магию Края в узде."),
    ("midnight_robe", "Полуночная мантия", 6, "Соткана из городской ночи."),
    ("shadow_glaive", "Теневая глефа", 6, "Клинок, который предпочитает сумрак."),
    ("spatial_sign", "Пространственный знак", 6, "Метка для тех, кто меряет мир шагами порталов."),
    ("blazing_flask", "Пылающая фляга", 6, "Внутри — маленький вечный пожар."),
    ("reflection_necklace", "Ожерелье отражения", 6, "Возвращает миру его же взгляды."),
    ("jellyfish_necklace", "Ожерелье медузы", 6, "Светится и слегка покалывает."),
    ("rage_glove", "Перчатка ярости", 6, "Сжимается в кулак сама по себе."),
    ("holy_locket", "Святой медальон", 6, "Тёплый, как утренний свет в храме."),
    ("horse_flute", "Лошадиная флейта", 3, "Её слышат только те, кого ждут."),
    ("amphibian_boot", "Сапог амфибии", 3, "Один сапог — а пловец уже доволен."),
    ("aqua_walker", "Аква-сапоги", 3, "Для тех, кто не любит мочить ноги."),
    ("magma_walker", "Магмаходы", 3, "Горячо? Это смотря с какой стороны подошвы."),
    ("drowned_belt", "Пояс утопленника", 3, "Пахнет тиной и приключениями."),
    ("arrow_quiver", "Колчан стрел", 3, "Стрелы в нём всегда под рукой."),
    ("hunter_belt", "Пояс охотника", 3, "Пахнет лесом и терпением."),
    ("ice_breaker", "Ледокол", 3, "Зима отступает на шаг назад."),
    ("ice_skates", "Коньки", 3, "Гладкий лёд — быстрая дорога."),
    ("roller_skates", "Роликовые коньки", 3, "Городские улицы созданы для них."),
    ("leather_belt", "Кожаный пояс", 3, "Простой, честный, надёжный."),
    ("solid_snowball", "Прочный снежок", 3, "Не тает. Вообще. Проверено летом."),
    ("spore_sack", "Споровая сумка", 3, "Внутри тихо дышит целый лес."),
    ("wool_mitten", "Шерстяная рукавица", 3, "Связана с любовью и одной лишней петлёй."),
]


def _relics_chapter() -> Chapter:
    """Глава реликвий: 29 независимых квестов «нашёл реликвию — получил опыт».

    Реликвии (мод Relics) лежат в сундуках структур; задача засчитывается,
    когда предмет оказывается в инвентаре. Между собой квесты не связаны.
    """
    qs = []
    for rid, name, xp, lore in RELICS:
        qs.append(Quest(
            f"rel_{rid}", f"Находка: {name}", 0, 0,
            [f"Реликвия мира: {name}. {lore}",
             "Ищите в сундуках структур — деревень, храмов, руин, крепостей и "
             "затонувших кораблей. Засчитается, когда предмет окажется у вас "
             "в инвентаре. Квест независимый и ни с чем не связан; награда — опыт."],
            [item_task(f"relics:{rid}")], [rxp(xp)], [], optional=True))
    return Chapter("81_side_relics", "Необязательное: «Реликвии мира»",
                   "relics:infinity_ham", G_SIDE, 13, qs)


CATACLYSM_BOSSES: list[tuple[str, str, str, str, int, str]] = [
    # (ключ, название, entity cataclysm:*, иконка, опыт, лор)
    ("boss_ender_golem", "Катаклизм: Эндер-голем", "cataclysm:ender_golem",
     "minecraft:purpur_block", 5, "Страж пурпурных руин Края."),
    ("boss_ender_guardian", "Катаклизм: Страж Края", "cataclysm:ender_guardian",
     "minecraft:ender_eye", 8, "Древний страж, охраняющий сокровища Края."),
    ("boss_prowler", "Катаклизм: Мародёр", "cataclysm:the_prowler",
     "minecraft:shield", 6, "Бронированный охотник из глубин."),
    ("boss_wadjet", "Катаклизм: Ваджет", "cataclysm:wadjet",
     "minecraft:sandstone", 6, "Крылатый ужас пустынных гробниц."),
    ("boss_monstrosity", "Катаклизм: Незеритовое чудовище",
     "cataclysm:netherite_monstrosity", "minecraft:netherite_block", 10,
     "Живая крепость из незерита в адских глубинах."),
    ("boss_ignis", "Катаклизм: Игнис", "cataclysm:ignis",
     "minecraft:magma_block", 10, "Рыцарь пламени, чья арена раскалена добела."),
    ("boss_harbinger", "Катаклизм: Предвестник", "cataclysm:the_harbinger",
     "minecraft:wither_skeleton_skull", 12, "Машина войны древних строителей."),
    ("boss_remnant", "Катаклизм: Древний остаток", "cataclysm:ancient_remnant",
     "minecraft:chiseled_sandstone", 12, "Страж песков, помнящий первые города."),
    ("boss_leviathan", "Катаклизм: Левиафан", "cataclysm:the_leviathan",
     "minecraft:heart_of_the_sea", 15, "Ужас бездны из затопленных храмов океана."),
]


def _add_bonus_content(ch: Chapter) -> None:
    """Квесты 0.9.0, добавляемые ПОСЛЕ big-quests-треков (ID не сдвигаются).

    Всё здесь — опциональные листья и секреты: ворота эпох они не запирают,
    линии к основной цепочке не тянут (независимые зоны глав).
    """
    f = ch.file
    if f == "20_epoch_steam_logistics":
        ch.quests += [
            Quest("tic_station", "Станция конструктора Tinkers'", 0, 0,
                  ["Tinkers' Construct начинается со станции конструктора:",
                   "на ней инструменты собирают из отдельных деталей.",
                   "Лист-бонус эпохи: основная цепочка от него не зависит."],
                  [item_task("tconstruct:tinker_station")],
                  [rxp(2)], [], optional=True),
            Quest("tic_parts", "Сборщик деталей", 0, 0,
                  ["Сборщик деталей вырезает детали инструментов из материалов",
                   "по шаблонам — верный напарник станции конструктора."],
                  [item_task("tconstruct:part_builder")],
                  [rxp(2)], [], optional=True),
        ]
    elif f == "30_epoch_industry":
        ch.quests += [
            Quest("tic_smeltery", "Плавильня Tinkers'", 0, 0,
                  ["Плавильня переплавляет руды с удвоением, делает сплавы",
                   "и отливает детали. Соберите контроллер плавильни."],
                  [item_task("tconstruct:smeltery_controller")],
                  [rxp(3)], [], optional=True),
            Quest("tic_cobalt", "Кобальт из Нижнего мира", 0, 0,
                  ["Кобальт добывается в Нижнем мире и нужен для поздних",
                   "сплавов Tinkers'. Принесите четыре слитка."],
                  [item_task("tconstruct:cobalt_ingot", 4)],
                  [rxp(3)], [], optional=True),
            Quest("tic_manyullyn", "Маньюллин: предел жара", 0, 0,
                  ["Маньюллин — королевский сплав кобальта с незеритом, вершина",
                   "металлургии Tinkers'. Обычной плавильне он не по зубам:",
                   "нужен жар 1500 — литейная на пылающей крови поздних эпох",
                   "(см. гейтинг жаром в kubejs/server_scripts/90_era_gating.js)."],
                  [item_task("tconstruct:manyullyn_ingot", 2)],
                  [rxp(5)], [], optional=True),
        ]
    if f == "71_side_expeditions":
        for key, title, ent, icon, xp, lore in CATACLYSM_BOSSES:
            ch.quests.append(Quest(
                key, title, 0, 0,
                [lore,
                 "Охота L_Ender's Cataclysm: боссы стерегут особые арены-структуры",
                 "по мирам. Убийство засчитается автоматически. Ветка бонусная:",
                 "главы и эпохи она не запирает."],
                [kill_task(ent, 1)], [ir("minecraft:emerald", 8), rxp(xp)], [],
                optional=True, icon=icon))
        ch.quests.append(Quest(
            "sec_marathon", "???", 0, 0,
            ["Марафон — это 42 километра 195 метров. Пешком.",
             "Говорят, первый, кто прошёл, — успел рассказать. Успеете и вы."],
            [stat_task("minecraft:walk_one_cm", 4219500)],
            [ir("minecraft:leather_boots", 1), rxp(5)], [],
            optional=True, secret=True))
    if f == "00_prologue":
        ch.quests += [
            Quest("sec_cake", "???", 0, 0,
                  ["Пекарь колонии обещал торт. Когда-нибудь.",
                   "Если торт всё же существует — принесите его. Торт — не ложь."],
                  [item_task("minecraft:cake")],
                  [ir("minecraft:milk_bucket", 1), rxp(1)], [],
                  optional=True, secret=True),
            Quest("sec_eggs", "???", 0, 0,
                  ["Кто-то спрятал по городу пасхальные яйца. Буквально.",
                   "Соберите 16 куриных яиц — и тайна будет раскрыта."],
                  [item_task("minecraft:egg", 16)],
                  [ir("minecraft:chicken_spawn_egg", 1), rxp(1)], [],
                  optional=True, secret=True),
        ]
    elif f == "10_epoch_wood_water":
        ch.quests += [
            Quest("sec_lava", "???", 0, 0,
                  ["Старое шахтёрское правило гласит: не копай вниз.",
                   "Но ведро лавы в инвентаре — это уже позиция. Принесите."],
                  [item_task("minecraft:lava_bucket")],
                  [ir("minecraft:obsidian", 4), rxp(1)], [],
                  optional=True, secret=True),
            Quest("sec_13", "???", 0, 0,
                  ["Город растёт. Тринадцать жителей — отличное число.",
                   "Ничего страшного не случится. Наверное."],
                  [Task("custom", cond="citizens:13",
                        title="13 жителей в колонии")],
                  [ir("minecraft:bread", 13), rxp(2)], [],
                  optional=True, secret=True),
        ]
    elif f == "70_side_architects":
        colors = ["white", "orange", "magenta", "light_blue", "yellow",
                  "lime", "pink", "gray", "light_gray", "cyan", "purple",
                  "blue", "brown", "green", "red", "black"]
        ch.quests.append(Quest(
            "sec_rainbow", "???", 0, 0,
            ["Городу не хватает цвета. Соберите шерсть всех шестнадцати цветов —",
             "и над Арканополисом встанет радуга."],
            [item_task(f"minecraft:{c}_wool") for c in colors],
            [ir("minecraft:firework_rocket", 16), rxp(3)], [],
            optional=True, secret=True))
    elif f == "72_side_schools":
        ch.quests.append(Quest(
            "sec_42", "???", 0, 0,
            ["Библиотекарь шепчет: «Ответ — 42. Вопрос, увы, потерян».",
             "Соберите 42 книги. Зачем — вопрос как раз из потерянных."],
            [item_task("minecraft:book", 42)],
            [ir("minecraft:writable_book", 1), rxp(2)], [],
            optional=True, secret=True))


# ============================================================================
# Граф эпохи вместо линейной цепочки (топологии docs/09)
# ============================================================================

GATE_KEYS: dict[str, str] = {
    "00_prologue": "charter",
    "10_epoch_wood_water": "project",
    "20_epoch_steam_logistics": "project",
    "30_epoch_industry": "passport",
    "40_epoch_magic": "lab",
    "50_epoch_network": "project",
    "60_epoch_cosmos": "finale",
}


def restructure_dag(chapters: list[Chapter]) -> None:
    """Превращает авторские зависимости в строгий граф эпохи.

    Раньше polish() сплющивал всё в одну цепочку (квест N+1 ждал квест N).
    Теперь: параллельные ветки (ручные ветки + треки big_quests) идут в
    свободном порядке, а ВОРОТА эпохи (GATE_KEYS) дополнительно требуют
    каждый обязательный квест главы, который не является их потомком:
    проскочить эпоху, игнорируя ветку, нельзя (решение от 2026-10-16).
    Опциональные/повторяемые квесты независимы и воротами быть не могут.
    """
    def split_dep(d: str, cur: str) -> tuple[str, str]:
        if ":" in d:
            f, k = d.split(":", 1)
            return f, k
        return cur, d

    for ch in chapters:
        quests = {q.key: q for q in ch.quests}
        if not ch.quests:
            continue
        entry = ch.quests[0].key
        for q in ch.quests:
            if q.independent:
                q.deps = []
                continue
            nd = []
            for d in q.deps:
                f, k = split_dep(d, ch.file)
                if f == ch.file and k in quests and quests[k].independent:
                    continue  # бонус не может запирать обязательный квест
                nd.append(d)
            q.deps = nd
            if not q.deps and q.key != entry:
                q.deps = [entry]  # сироты-головы треков — от входа главы
        if ch.file in GATE_KEYS:
            gate = quests[GATE_KEYS[ch.file]]
            dependents: dict[str, set] = {k: set() for k in quests}
            for q in ch.quests:
                if q.independent:
                    continue
                for d in q.deps:
                    f, k = split_dep(d, ch.file)
                    if f == ch.file and k in dependents:
                        dependents[k].add(q.key)

            def closure(start: str, edges: dict) -> set:
                seen, stack = set(), [start]
                while stack:
                    c = stack.pop()
                    if c in seen:
                        continue
                    seen.add(c)
                    stack.extend(edges.get(c, ()))
                return seen

            back: dict[str, set] = {k: set() for k in quests}
            for q in ch.quests:
                if q.independent:
                    continue
                for d in q.deps:
                    f, k = split_dep(d, ch.file)
                    if f == ch.file and k in back:
                        back[q.key].add(k)
            anc_gate = closure(gate.key, back)
            desc_gate = closure(gate.key, dependents)
            # Пост-воротный эпилог («Сокровищницы эпох», финальные проверки
            # треков): квесты зависят ОТ ворот, поэтому обязательными быть
            # не могут — эпоху нельзя было бы закрыть никогда. Это бонус
            # после печати эпохи: помечаем optional, зависимости сохраняем.
            for q in ch.quests:
                if q.key in desc_gate and q.key != gate.key \
                        and not q.independent:
                    q.optional = True
            for q in ch.quests:
                if q.independent or q.key == gate.key:
                    continue
                if q.key in anc_gate or q.key in desc_gate:
                    continue
                if q.key not in gate.deps:
                    gate.deps.append(q.key)

    # --- глобальные проверки: все зависимости разрешаются, циклов нет ---
    keys_all = {(c.file, q.key) for c in chapters for q in c.quests}
    graph: dict = {}
    for ch in chapters:
        for q in ch.quests:
            ds = []
            for d in q.deps:
                f, k = split_dep(d, ch.file)
                assert (f, k) in keys_all, \
                    f"висячая зависимость {d} у {ch.file}:{q.key}"
                ds.append((f, k))
            graph[(ch.file, q.key)] = ds
    color: dict = {}

    def dfs(u, trail):
        color[u] = 1
        for v in graph[u]:
            if color.get(v) == 1:
                raise AssertionError(
                    "ЦИКЛ зависимостей: " + " -> ".join(
                        f"{a}:{b}" for a, b in trail + [v]))
            if color.get(v, 0) == 0:
                dfs(v, trail + [u])
        color[u] = 2

    for node in graph:
        if color.get(node, 0) == 0:
            dfs(node, [])



# ============================================================================
# Авто-детект задач: checkmark-задачи заменяются на custom/item.
# Игрок не может отметить их вручную — прогресс даёт kubejs/server_scripts/
# 95_colony_checks.js (генерируется этим скриптом).
# ============================================================================

TASK_MAP: dict[tuple[str, str], Task] = {}
_CHAIN = [
    ("00_prologue", "start", custom("camp", "Лагерь или корабль снабжения установлен")),
    ("00_prologue", "orders", custom("building:builder:1", "Хижина строителя построена")),
    ("00_prologue", "town_hall", custom("townhall:1", "Ратуша построена")),
    ("00_prologue", "builder", custom("building:builder:2", "Хижина строителя II уровня")),
    ("00_prologue", "home", custom("building:home:1", "Первый жилой дом заселён")),
    ("00_prologue", "food", item_task("minecraft:bread", 32, "Запас хлеба собран")),
    ("00_prologue", "workers", custom("citizens:3", "Три жителя в колонии")),
    ("00_prologue", "logistics", custom("building:courier:1", "Курьерская служба запущена")),
    ("00_prologue", "charter", custom("citizens:5", "Пять жителей в колонии")),

    ("10_epoch_wood_water", "hub", custom("townhall:2", "Ратуша II уровня достигнута")),
    ("10_epoch_wood_water", "town2", custom("townhall:2", "Ратуша II уровня построена")),
    ("10_epoch_wood_water", "pop8", custom("citizens:8", "Восемь жителей")),
    ("10_epoch_wood_water", "forester", custom("building:lumberjack:1", "Хижина лесоруба построена")),
    ("10_epoch_wood_water", "miner", custom("building:miner:1", "Хижина шахтёра построена")),
    ("10_epoch_wood_water", "warehouse", custom("building:warehouse:1", "Склад построен")),
    ("10_epoch_wood_water", "courier", custom("building:courier:1", "Курьер нанят")),
    ("10_epoch_wood_water", "food_prod", custom("building:farm:1", "Ферма работает")),
    ("10_epoch_wood_water", "water_wheel", item_task("create:water_wheel", 1, "Водяное колесо собрано")),
    ("10_epoch_wood_water", "shaft", item_task("create:cogwheel", 16, "Передачи изготовлены")),
    ("10_epoch_wood_water", "press", item_task("create:mechanical_press", 1, "Механический пресс собран")),
    ("10_epoch_wood_water", "saw", item_task("create:mechanical_saw", 1, "Механическая пила собрана")),
    ("10_epoch_wood_water", "fan", item_task("create:encased_fan", 1, "Вентилятор собран")),
    ("10_epoch_wood_water", "conveyor", item_task("create:belt_connector", 16, "Линии конвейеров проложены")),
    ("10_epoch_wood_water", "spellbook", custom("always", "Книга заклинаний изучена")),
    ("10_epoch_wood_water", "source", item_task("ars_nouveau:source_gem", 8, "Самоцветы источника собраны")),
    ("10_epoch_wood_water", "project", custom("building:sawmill:1", "Городская мастерская построена")),

    ("20_epoch_steam_logistics", "hub", custom("townhall:3", "Эпоха II достигнута")),
    ("20_epoch_steam_logistics", "town23", custom("townhall:3", "Ратуша III уровня построена")),
    ("20_epoch_steam_logistics", "builder3", custom("building:builder:3", "Строитель III уровня")),
    ("20_epoch_steam_logistics", "wh2", custom("building:warehouse:2", "Склад II уровня")),
    ("20_epoch_steam_logistics", "pop12", custom("citizens:12", "Двенадцать жителей")),
    ("20_epoch_steam_logistics", "university", custom("building:university:1", "Университет построен")),
    ("20_epoch_steam_logistics", "food2", custom("building:cook:1", "Повар работает")),
    ("20_epoch_steam_logistics", "brass", item_task("create:brass_ingot", 16, "Латунь отлита")),
    ("20_epoch_steam_logistics", "steam", item_task("create:steam_engine", 1, "Паровой двигатель собран")),
    ("20_epoch_steam_logistics", "precision", item_task("create:precision_mechanism", 8, "Точные механизмы собраны")),
    ("20_epoch_steam_logistics", "rails", item_task("create:railway_casing", 4, "Железнодорожная обвязка готова")),
    ("20_epoch_steam_logistics", "ars_auto", custom("always", "Первая магическая автоматизация запущена")),
    ("20_epoch_steam_logistics", "project", custom("building:mechanic:1", "Мастерская компонентов построена")),

    ("30_epoch_industry", "hub", custom("townhall:3", "Эпоха III достигнута")),
    ("30_epoch_industry", "town3", custom("townhall:3", "Ратуша III уровня")),
    ("30_epoch_industry", "pop20", custom("citizens:20", "Двадцать жителей")),
    ("30_epoch_industry", "wh3", custom("building:warehouse:3", "Склад III уровня")),
    ("30_epoch_industry", "research", custom("building:university:2", "Исследования колонии идут")),
    ("30_epoch_industry", "food_fuel", custom("building:cook:2", "Еда и топливо стабильны")),
    ("30_epoch_industry", "thermal_line", item_task("thermal:machine_frame", 2, "Рамы машин собраны")),
    ("30_epoch_industry", "energy", custom("always", "Энергоснабжение запущено")),
    ("30_epoch_industry", "enrichment", item_task("mekanism:enrichment_chamber", 1, "Обогатитель собран")),
    ("30_epoch_industry", "steel", item_task("mekanism:ingot_steel", 16, "Сталь произведена")),
    ("30_epoch_industry", "chain", custom("always", "Цепочка переработки налажена")),
    ("30_epoch_industry", "casing", item_task("arcanopolis:reinforced_casing", 8, "Усиленные корпуса изготовлены")),
    ("30_epoch_industry", "warehouse_link", custom("building:mechanic:2", "Промышленная линия и склад")),
    ("30_epoch_industry", "passport", item_task("arcanopolis:technical_passport", 1, "Технический паспорт собран")),

    ("40_epoch_magic", "hub", custom("townhall:4", "Эпоха IV достигнута")),
    ("40_epoch_magic", "ars_base", item_task("ars_nouveau:source_gem", 32, "Самоцветы источника накоплены")),
    ("40_epoch_magic", "ars_helper", custom("always", "Магические помощники призваны")),
    ("40_epoch_magic", "ars_create", custom("always", "Магия и механизмы объединены")),
    ("40_epoch_magic", "mana_pool", item_task("botania:mana_pool", 1, "Мана-пул создан")),
    ("40_epoch_magic", "mana_auto", item_task("botania:terrasteel_ingot", 2, "Террасталь добыт")),
    ("40_epoch_magic", "altar", item_task("bloodmagic:altar", 1, "Алтарь крови возведён")),
    ("40_epoch_magic", "slates", item_task("bloodmagic:blankslate", 16, "Кровавые плиты изготовлены")),
    ("40_epoch_magic", "ritual", item_task("arcanopolis:ritual_regulator", 1, "Регулятор ритуалов собран")),
    ("40_epoch_magic", "alchemy", custom("always", "Алхимия Eidolon освоена")),
    ("40_epoch_magic", "pewter", custom("always", "Характерные компоненты изготовлены")),
    ("40_epoch_magic", "lab", custom("building:library:2", "Арканная лаборатория построена")),

    ("50_epoch_network", "hub", custom("townhall:5", "Эпоха V достигнута")),
    ("50_epoch_network", "ae2_base", custom("always", "Сеть AE2 развёрнута")),
    ("50_epoch_network", "cells", custom("always", "Хранилище развёрнуто")),
    ("50_epoch_network", "patterns", custom("always", "Шаблоны освоены")),
    ("50_epoch_network", "mek_link", item_task("mekanism:alloy_atomic", 8, "Атомные сплавы изготовлены")),
    ("50_epoch_network", "lines", item_task("mekanism:ultimate_control_circuit", 4, "Высшие контуры изготовлены")),
    ("50_epoch_network", "project", custom("building:mechanic:3", "Линия «от руды до корпуса» готова")),

    ("60_epoch_cosmos", "hub", custom("townhall:6", "Эпоха VI достигнута")),
    ("60_epoch_cosmos", "mek_late", item_task("mekanism:alloy_atomic", 16, "Поздняя переработка налажена")),
    ("60_epoch_cosmos", "thermal_late", item_task("thermal:enderium_ingot", 8, "Эндерий изготовлен")),
    ("60_epoch_cosmos", "rare", item_task("minecraft:nether_star", 2, "Звёзды Нижнего мира добыты")),
    ("60_epoch_cosmos", "center", item_task("arcanopolis:arcane_converter", 8, "Преобразователи изготовлены")),
    ("60_epoch_cosmos", "catalyst", item_task("arcanopolis:primal_catalyst", 1, "Изначальный катализатор собран")),
    ("60_epoch_cosmos", "heart", item_task("arcanopolis:heart_of_arcanopolis", 1, "Сердце Арканополиса собрано")),
    ("60_epoch_cosmos", "finale", custom("always", "Первый импульс Сердца")),
]
for _f, _k, _t in _CHAIN:
    TASK_MAP[(_f, _k)] = _t

# Жёсткая цепочка эпох: глава эпохи N+1 требует полного завершения главы эпохи N
CHAP_CHAIN: dict[str, str] = {
    "10_epoch_wood_water": "00_prologue",
    "20_epoch_steam_logistics": "10_epoch_wood_water",
    "30_epoch_industry": "20_epoch_steam_logistics",
    "40_epoch_magic": "30_epoch_industry",
    "50_epoch_network": "40_epoch_magic",
    "60_epoch_cosmos": "50_epoch_network",
}

# Новые квесты (добавляются В КОНЕЦ списков глав — старые id не сдвигаются)
NEW_QUESTS: dict[str, list[Quest]] = {
    "00_prologue": [
        Quest("timber", "Лесозаготовка", 0, 4.5,
              ["Запас древесины — топливо, ремонт и будущие постройки."],
              [item_task("minecraft:oak_log", 64, "Брёвна заготовлены")], [], ["food"]),
        Quest("stone_reserve", "Каменный резерв", 2, 4.5,
              ["Камень нужен для дорог, укреплений и украшений колонии."],
              [item_task("minecraft:cobblestone", 256, "Камень добыт")], [], ["food"]),
    ],
    "10_epoch_wood_water": [
        Quest("ir_tools", "Железные инструменты", -4, -4.5,
              ["Прочные инструменты для длинных смен рабочих."],
              [item_task("minecraft:iron_pickaxe", 4, "Инструменты изготовлены")], [], ["miner"]),
        Quest("saplings", "Питомник", -2, -3,
              ["Саженцы поддерживают работу лесоруба."],
              [item_task("minecraft:oak_sapling", 16, "Саженцы выращены")], [], ["forester"]),
    ],
    "20_epoch_steam_logistics": [
        Quest("brass_reserve", "Латунный запас", 2, 3,
              ["Латунь — основа точной механики."],
              [item_task("create:brass_ingot", 16, "Латунь отлита")], [], ["brass"]),
        Quest("cogs", "Зубчатые колёса", 4, 3,
              ["Передачи для будущих линий автоматизации."],
              [item_task("create:cogwheel", 32, "Колёса изготовлены")], [], ["precision"]),
    ],
    "30_epoch_industry": [
        Quest("steel_reserve", "Стальной резерв", 2, 3,
              ["Сталь — каркас промышленного города."],
              [item_task("mekanism:ingot_steel", 32, "Сталь произведена")], [], ["steel"]),
        Quest("circuit_stock", "Запас контуров", 4, 3,
              ["Контуры управления — основа промышленной автоматики."],
              [item_task("mekanism:basic_control_circuit", 16, "Контуры изготовлены")], [], ["enrichment"]),
    ],
    "40_epoch_magic": [
        Quest("source_stock", "Резерв самоцветов", -4, -3.5,
              ["Самоцветы источника — топливо магии."],
              [item_task("ars_nouveau:source_gem", 32, "Самоцветы накоплены")], [], ["ars_base"]),
        Quest("terrasteel_pact", "Союз с дриадами", -2, -3.5,
              ["Террасталь подтверждает союз с дриадами."],
              [item_task("botania:terrasteel_ingot", 4, "Террасталь добыт")], [], ["mana_auto"]),
    ],
    "50_epoch_network": [
        Quest("circuits_ultimate", "Высшие контуры", 4, -1.5,
              ["Продвинутая автоматика для сетевых производственных линий."],
              [item_task("mekanism:ultimate_control_circuit", 8, "Контуры изготовлены")], [], ["lines"]),
        Quest("pearl_stock", "Эндер-резерв", 2, -3,
              ["Эндер-жемчуг — основа пространственных технологий."],
              [item_task("minecraft:ender_pearl", 16, "Жемчуг собран")], [], ["ae2_base"]),
    ],
    "60_epoch_cosmos": [
        Quest("nether_stars", "Звёзды Нижнего мира", -2, -3,
              ["Редчайший реагент для финальных ритуалов."],
              [item_task("minecraft:nether_star", 2, "Звёзды добыты")], [], ["rare"]),
        Quest("dragon_breath", "Дыхание дракона", 2, -3,
              ["Алхимический реагент для Сердца Арканополиса."],
              [item_task("minecraft:dragon_breath", 4, "Реагент собран")], [], ["catalyst"]),
    ],
}


_BIG_CACHE = None


def _big_extras() -> dict:
    global _BIG_CACHE
    if _BIG_CACHE is None:
        import big_quests
        _BIG_CACHE = big_quests.build_extras()
    return _BIG_CACHE


def stitch_chapters(chapters: list[Chapter]) -> None:
    """Сквозная мега-цепочка: глава эпохи N+1 начинается после ПОСЛЕДНЕГО квеста эпохи N."""
    last_key: dict[str, str] = {}
    for ch in chapters:
        k = ""
        for q in ch.quests:
            if not q.optional:
                k = q.key
        if k:
            last_key[ch.file] = k
    for ch in chapters:
        if ch.file in CHAP_CHAIN and ch.quests:
            prev = CHAP_CHAIN[ch.file]
            if prev in last_key:
                ch.quests[0].deps = [f"{prev}:{last_key[prev]}"]


def layout_chapters(chapters: list[Chapter]) -> None:
    """Раскладка глав по графу зависимостей (топологии docs/09).

    Раньше квесты выкладывались «змейкой» по списку — цепочка читалась,
    но веток не было видно. Теперь глава — слоистый граф: глубина квеста
    (x) — длина самого длинного пути от входа главы, полоса (y) наследуется
    от первой зависимости, поэтому параллельные ветки (ручные ветки и
    треки big_quests) идут горизонтальными лентами слева направо, линии
    зависимостей короткие, а ворота эпохи — крайний правый слой по центру.
    Независимые квесты (бонусы, секреты, торговля) — отдельной зоной ниже
    графа, без линий. Справочник сохраняет ручные координаты.
    """
    for ch in chapters:
        if ch.file == "80_reference":
            continue
        chained = [q for q in ch.quests if not q.independent]
        free = [q for q in ch.quests if q.independent]
        by_key = {q.key: q for q in ch.quests}
        intra = {q.key: [d for d in q.deps if ":" not in d and d in by_key]
                 for q in chained}
        depth: dict = {}

        def _depth(k: str, guard: frozenset) -> int:
            if k in depth:
                return depth[k]
            if k in guard:
                return 0
            ds = intra.get(k, [])
            depth[k] = 0 if not ds else 1 + max(
                _depth(d, guard | {k}) for d in ds)
            return depth[k]

        for q in chained:
            _depth(q.key, frozenset())
        maxd = max(depth.values(), default=0)
        lane: dict = {}
        occupied: set = set()
        inherited: set = set()

        def _place(q: Quest) -> None:
            if q.key in lane:
                return
            ds = intra[q.key]
            for d in ds:
                _place(by_key[d])
            want = None
            if len(ds) >= 4:  # ворота сходятся к центру своих веток
                med = sorted(lane[d] for d in ds)[len(ds) // 2]
                if (depth[q.key], med) not in occupied:
                    want = med
            if want is None and ds and ds[0] not in inherited \
                    and (depth[q.key], lane[ds[0]]) not in occupied:
                want = lane[ds[0]]
                inherited.add(ds[0])
            if want is None:
                want = 0
                while (depth[q.key], want) in occupied:
                    want += 1
            lane[q.key] = want
            occupied.add((depth[q.key], want))

        for q in chained:
            _place(q)
        maxlane = max(lane.values(), default=0)
        for q in chained:
            q.x = (depth[q.key] - maxd / 2) * 2.2
            q.y = (lane[q.key] - maxlane / 2) * 2.0
        if free:
            y0 = (maxlane / 2 + 2.5) * 2.0
            for i, q in enumerate(free):
                row, col = divmod(i, 5)
                q.x = (col - 2) * 2.0
                q.y = y0 + row * 2.0

def _or_to_custom(t: Task) -> Task:
    """OR-список предметов -> custom item_any (проверка инвентаря скриптом)."""
    if t.ttype == "item" and "|" in t.item:
        return Task("custom", cond=f"item_any:{t.item}@{t.count or 1}",
                    title=t.title or "Получите любой из вариантов")
    return t


def _big_title(t) -> str:
    import big_quests
    return big_quests._task_title(t)


HUB_LORE: dict = {
    ("00_prologue", "start"): [
        "— Земли под застройку выделены. Хартия подписана.",
        "Так начинается история Арканополиса — города, где ремесло",
        "и магия сплетаются в единый механизм."],
    ("10_epoch_wood_water", "hub"): [
        "Эпоха I. Первые механизмы шумят у водяных колёс,",
        "топоры лесорубов задают ритм росту города."],
    ("20_epoch_steam_logistics", "hub"): [
        "Эпоха II. Пар вырывается из-под колпаков, поезда",
        "связывают кварталы, и колония впервые дышит как единое целое."],
    ("30_epoch_industry", "hub"): [
        "Эпоха III. Гудят фабрики, руда превращается в сталь,",
        "а Технический паспорт становится пропуском в будущее."],
    ("40_epoch_magic", "hub"): [
        "Эпоха IV. Источник пробуждается: ритуалы, мана и алхимия",
        "становятся такой же частью производства, как шестерни."],
    ("50_epoch_network", "hub"): [
        "Эпоха V. Сеть связывает цеха, склады и лаборатории —",
        "город начинает мыслить как единая автоматика."],
    ("60_epoch_cosmos", "hub"): [
        "Эпоха VI. Горизонт больше не предел: Сердце Арканополиса",
        "готово пробудиться и устремиться к звёздам."],
    ("60_epoch_cosmos", "finale"): [
        "Первый импульс разнёсся по кварталам. Город живой.",
        "Добро пожаловать в Арканополис."],
}


def polish(chapters: list[Chapter]) -> None:
    """Заменить checkmark-задачи на custom/item, добавить квесты и цепочку эпох."""
    for ch in chapters:
        for q in ch.quests:
            if not any(t.ttype == "checkmark" for t in q.tasks):
                continue
            nt = TASK_MAP.get((ch.file, q.key))
            if nt is None:
                # обучающие задачи без детектируемого условия: custom-always
                # (не отмечаются вручную, не блокируют эпохи)
                first = next(t for t in q.tasks if t.ttype == "checkmark")
                nt = Task("custom", cond="always", title=first.title)
            q.tasks = [nt if t.ttype == "checkmark" else t for t in q.tasks]
        if ch.file in NEW_QUESTS:
            ch.quests.extend(NEW_QUESTS[ch.file])
        for spec in _big_extras().get(ch.file, []):
            tasks = []
            for t in spec["tasks"]:
                if t[0] in ("item", "itemc"):
                    tasks.append(Task("item", item=t[1], count=t[2],
                                      title=_big_title(t), consume=(t[0] == "itemc")))
                elif t[0] == "cus":
                    tasks.append(Task("custom", cond=t[1], title=_big_title(t)))
                elif t[0] == "both":
                    tasks.append(Task("item", item=t[1], count=t[2],
                                      title=_big_title(("item", t[1], t[2]))))
                    tasks.append(Task("custom", cond=t[3],
                                      title=_big_title(("cus", t[3], 0))))
                elif t[0] == "kill":
                    tasks.append(Task("kill", count=t[2], title=_big_title(t), entity=t[1]))
                elif t[0] == "dim":
                    tasks.append(Task("dimension", title=_big_title(t), entity=t[1]))
                elif t[0] == "stat":
                    tasks.append(Task("stat", count=t[2], title=_big_title(t), entity=t[1]))
                elif t[0] == "adv":
                    tasks.append(Task("advancement", title=_big_title(t), advancement=t[1]))
                elif t[0] == "struct":
                    tasks.append(Task("structure", title=_big_title(t), entity=t[1]))
            rewards = []
            for r in spec.get("rewards", []):
                if r[0] == "item":
                    rewards.append(Reward(r[1], r[2]))
                elif r[0] == "cmd":
                    rewards.append(Reward(r[1], 1, "command"))
                elif r[0] == "xp":
                    rewards.append(Reward("", r[1], "xp"))
            ch.quests.append(Quest(spec["key"], spec["title"], spec["x"], spec["y"],
                                   spec["desc"], tasks, rewards, spec["deps"],
                                   optional=bool(spec.get("optional")),
                                   repeatable=bool(spec.get("repeatable"))))
        _add_bonus_content(ch)
        for (lf, lk), lines in HUB_LORE.items():
            if ch.file == lf:
                for q in ch.quests:
                    if q.key == lk:
                        q.desc = list(q.desc) + lines
        for q in ch.quests:
            q.tasks = [_or_to_custom(t) for t in q.tasks]
        # Независимые квесты НЕ входят в цепочку и не соединяются линиями:
        # опциональные (в т.ч. секретные «???»), повторяемая торговля и справочник.
        # Они не блокируют соседей и сами ни от кого не зависят.
        for q in ch.quests:
            q.independent = bool(q.repeatable or q.optional
                                 or ch.file == "80_reference")
        # Описание — каждому квесту: что именно сделать и как это засчитается.
        # Рукописные описания не трогаем; генерируем там, где пусто или стоит
        # шаблонная заглушка «Задача цепочки квестов Арканополиса.»
        for q in ch.quests:
            if not q.tasks:
                continue
            if not q.desc or q.desc[0] == "Задача цепочки квестов Арканополиса.":
                q.desc = describe_quest(q)
            elif len(q.desc) < 2:
                # однострочная рукописная аннотация + конкретные инструкции
                q.desc = list(q.desc) + describe_quest(q)
        # Зависимости больше НЕ сплющиваем в одну цепочку: ветки эпохи идут
        # параллельно; строгие ворота и проверки графа — restructure_dag().
        for q in ch.quests:
            if q.independent:
                q.deps = []
        if ch.file in CHAP_CHAIN:
            ch.deps_ch = [CHAP_CHAIN[ch.file]]

    restructure_dag(chapters)


# ============================================================================
# Генерация kubejs/server_scripts/95_colony_checks.js (условия колонии)
# ============================================================================

def write_colony_js(chapters=None) -> None:
    import json
    MAIN_FILES = ["00_prologue", "10_epoch_wood_water", "20_epoch_steam_logistics",
                  "30_epoch_industry", "40_epoch_magic", "50_epoch_network",
                  "60_epoch_cosmos"]
    # Строка JS теперь несёт список задач-зависимостей (deps): строка квеста
    # срабатывает, только когда выполнены задачи всех квестов, от которых он
    # зависит по графу эпохи (раньше была одна линейная цепочка с break).
    rows_by_quest: dict = {}
    for rows in CHAIN_ROWS.values():
        for r in rows:
            rows_by_quest.setdefault((r.get("f", ""), r.get("q", "")), []).append(r)
    graph: dict = {}
    if chapters:
        graph = {(c.file, q.key): q for c in chapters for q in c.quests}
    for bucket, rows in CHAIN_ROWS.items():
        free_bucket = bucket.endswith("#free")
        for r in rows:
            deps: list = []
            if not free_bucket and r.get("kind") != "skip":
                q = graph.get((r.get("f", ""), r.get("q", "")))
                if q is not None:
                    seen = set()
                    for d in q.deps:
                        df, dk = d.split(":", 1) if ":" in d else (r.get("f", ""), d)
                        for rr in rows_by_quest.get((df, dk), []):
                            if rr["kind"] != "skip":
                                seen.add(rr["task"])
                    deps = sorted(seen)
            r["deps"] = deps
    parts = []
    main_rows = []
    for f in MAIN_FILES:
        main_rows.extend(CHAIN_ROWS.get(f, []))
    body = ",\n".join("    " + json.dumps(r, ensure_ascii=False) for r in main_rows)
    parts.append(f'  "main": [\n{body}\n  ]')
    for file, rows in CHAIN_ROWS.items():
        if file in MAIN_FILES:
            continue
        body = ",\n".join("    " + json.dumps(r, ensure_ascii=False) for r in rows)
        parts.append(f'  "{file}": [\n{body}\n  ]')
    table = ",\n".join(parts)

    tpl = """// 95_colony_checks.js — СГЕНЕРИРОВАНО tools/gen_quests.py, НЕ редактировать вручную!
// Граф зависимостей эпохи: строка условия несёт deps — id задач квестов,
// от которых зависит её квест. Строка срабатывает только когда выполнены
// все deps (фронт графа вместо линейной цепочки). Независимые квесты
// (ключи глав с суффиксом #free) зависимостей не имеют.
// Условия MineColonies и наличие предметов проверяются сервером раз в секунду.

console.info('[Arcanopolis] 95_colony_checks: проверка условий колонии активна (граф)')

const CHAPTER_CHAINS = {
%TABLE%
}

const IColonyManager = Java.loadClass('com.minecolonies.api.colony.IColonyManager')

function arcanopolis_level(player) {
  try { const l = player.level; if (l) return l } catch (e) {}
  try { return player.getLevel() } catch (e) {}
  return null
}

function arcanopolis_colonyOf(player) {
  try {
    const lvl = arcanopolis_level(player)
    if (lvl == null) return null
    const mgr = IColonyManager.getInstance()
    let col = null
    try { col = mgr.getIColony(lvl, player.blockPosition()) } catch (e) {}
    if (col == null) {
      try { col = mgr.getClosestColony(lvl, player.blockPosition()) } catch (e) {}
    }
    return col
  } catch (e) { return null }
}

function arcanopolis_buildingManager(col) {
  try { if (col.getServerBuildingManager) return col.getServerBuildingManager() } catch (e) {}
  try { return col.getBuildingManager() } catch (e) {}
  return null
}

function arcanopolis_itemCount(player, id) {
  try {
    const Reg = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    const RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    const item = Reg.ITEM.get(new RL(String(id)))
    if (item == null) return 0
    const inv = player.getInventory()
    let total = 0
    for (let i = 0; i < inv.getContainerSize(); i++) {
      const st = inv.getItem(i)
      if (!st.isEmpty() && st.getItem().equals(item)) total += st.getCount()
    }
    return total
  } catch (e) { return 0 }
}

// --- Лагерь / корабль снабжения -------------------------------------------
// В MineColonies 1.20.1 блок «supplyship» НЕ существует: лагерь ставит блок
// minecolonies:supplycamp, а корабль снабжения — блок minecolonies:supplychest
// (предметы-развёртыватели: supplycampdeployer и supplychestdeployer).
// Старый поиск блока supplyship был причиной, что первый квест не засчитывался.
const arcanopolis_campScan = {}

function arcanopolis_findCampNow(player) {
  try {
    const lvl = arcanopolis_level(player)
    if (lvl == null) return false
    const px = Math.floor(player.x)
    const py = Math.floor(player.y)
    const pz = Math.floor(player.z)
    for (let dx = -32; dx <= 32; dx++) {
      for (let dz = -32; dz <= 32; dz++) {
        for (let dy = -20; dy <= 20; dy++) {
          const b = lvl.getBlock(px + dx, py + dy, pz + dz)
          if (b && (b.id === 'minecolonies:supplycamp' || b.id === 'minecolonies:supplychest')) return true
        }
      }
    }
  } catch (e) {}
  return false
}

function arcanopolis_findCamp(player) {
  // скан окрестности тяжёлый — результат кэшируется на 5 секунд на игрока
  try {
    const name = String(player.username)
    const now = Date.now()
    const c = arcanopolis_campScan[name]
    if (c && now - c.t < 5000) return c.ok
    const ok = arcanopolis_findCampNow(player)
    arcanopolis_campScan[name] = { t: now, ok: ok }
    return ok
  } catch (e) { return false }
}

BlockEvents.placed(event => {
  try {
    const id = String(event.block.id)
    if (id === 'minecolonies:supplycamp' || id === 'minecolonies:supplychest') {
      const p = event.entity
      if (p && p.isPlayer()) p.persistentData.putBoolean('arcanopolis_camp', true)
    }
  } catch (e) {}
})

function arcanopolis_rowOk(player, row) {
  if (row.kind === 'always') return true
  if (row.kind === 'camp') {
    try { if (player.persistentData.getBoolean('arcanopolis_camp')) return true } catch (e) {}
    try { if (arcanopolis_itemCount(player, 'minecolonies:supplycampdeployer') + arcanopolis_itemCount(player, 'minecolonies:supplychestdeployer') >= 1) return true } catch (e) {}
    try {
      const col = arcanopolis_colonyOf(player)
      if (col != null) {
        const bm = arcanopolis_buildingManager(col)
        if (bm != null && bm.getTownHall() != null) return true
      }
    } catch (e) {}
    return arcanopolis_findCamp(player)
  }
  if (row.kind === 'item_any') {
    try {
      const ids = String(row.items).split('|')
      let total = 0
      for (const id of ids) {
        total += arcanopolis_itemCount(player, id)
        if (total >= row.n) return true
      }
      return total >= row.n
    } catch (e) { return false }
  }
  try {
    const col = arcanopolis_colonyOf(player)
    if (col == null) return false
    if (row.kind === 'townhall') {
      const bm = arcanopolis_buildingManager(col)
      const th = bm != null ? bm.getTownHall() : null
      return th != null && th.getBuildingLevel() >= row.n
    }
    if (row.kind === 'citizens') {
      return col.getCitizenManager().getCitizens().size() >= row.n
    }
    if (row.kind === 'building') {
      const bm = arcanopolis_buildingManager(col)
      if (bm == null) return false
      const it = bm.getBuildings().values().iterator()
      while (it.hasNext()) {
        const b = it.next()
        let hay = ''
        try { hay += ' ' + String(b.getSchematicName()) } catch (e) {}
        try { hay += ' ' + String(b.getBuildingType().getRegistryName()) } catch (e) {}
        try { hay += ' ' + String(b.getBuildingType().getSerializedName()) } catch (e) {}
        if (hay.toLowerCase().indexOf(row.word) >= 0) return b.getBuildingLevel() >= row.n
      }
    }
  } catch (e) {}
  return false
}

const _arcanopolis_done = {}

function arcanopolis_depsDone(name, row) {
  if (!row.deps) return true
  for (const d of row.deps) {
    if (!_arcanopolis_done[name + '|' + d]) return false
  }
  return true
}

ServerEvents.tick(event => {
  const s = event.server || event
  try {
    if (s.getTickCount() % 20 !== 0) return  // раз в секунду
    const players = s.players
    if (!players) return
    for (const p of players) {
      let name = ''
      try { name = String(p.username) } catch (e) { try { name = String(p.getName().getString()) } catch (e2) { return } }
      // два прохода: строки, чьи deps закрылись в этом же тике, не ждут секунду
      for (let pass = 0; pass < 2; pass++) {
        for (const chKey in CHAPTER_CHAINS) {
          const chain = CHAPTER_CHAINS[chKey]
          for (const row of chain) {
            if (row.kind === 'skip') continue
            const dk = name + '|' + row.task
            if (_arcanopolis_done[dk]) continue
            if (!arcanopolis_depsDone(name, row)) continue  // фронт графа: ждём зависимости
            if (!arcanopolis_rowOk(p, row)) continue
            _arcanopolis_done[dk] = true
            try { p.data.ftbquests.addProgress(row.task, 1) } catch (e) {}
            try { s.runCommandSilent('ftbquests change_progress ' + name + ' complete ' + row.task) } catch (e) {}
          }
        }
      }
    }
  } catch (e) {}
})
"""
    js = tpl.replace("%TABLE%", table)
    out = Path("kubejs/server_scripts/95_colony_checks.js")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(js, encoding="utf-8")
    n = sum(len(v) for v in CHAIN_ROWS.values())
    print(f"OK {out} ({n} chain rows, {len(CHAIN_ROWS)} chapters)")

# ============================================================================
# Эмиссия SNBT
# ============================================================================

def snbt_item(item: str) -> str:
    return f'"{esc(item)}"'


def task_icon(t: Task) -> str:
    """Иконка задачи: без неё FTB показывает радужный шар у custom-задач."""
    if t.ttype != "custom":
        return ""
    cond = t.cond or "always"
    if cond.startswith("item_any:"):
        return cond[len("item_any:"):].split("@")[0].split("|")[0]
    pp = cond.split(":")
    if pp[0] == "camp":
        return "minecolonies:supplycamp"
    if pp[0] == "townhall":
        return "minecolonies:blockhuttownhall"
    if pp[0] == "citizens":
        return "minecraft:villager_spawn_egg"
    if pp[0] == "building" and len(pp) >= 2:
        return HUT_ICONS.get(pp[1], "minecolonies:supplycamp")
    return "minecraft:book"


def emit_task(t: Task, chapter_no: int, indent: str) -> str:
    tid = uid("02", chapter_no)
    lines = [f"{indent}{{", f"{indent}\tid: \"{tid}\""]
    if t.ttype == "item":
        if "|" in t.item:
            opts = ", ".join(snbt_item(x) for x in t.item.split("|"))
            lines.append(f"{indent}\titem: [{opts}]")
            if t.count:
                lines.append(f"{indent}\tcount: {t.count}")
        else:
            lines.append(f"{indent}\titem: {snbt_item(t.item)}")
            if t.count:
                lines.append(f"{indent}\tcount: {t.count}")
        if t.consume:
            lines.append(f"{indent}\tconsume_items: true")
    elif t.ttype in ("checkmark", "custom"):
        if t.title:
            lines.append(f"{indent}\ttitle: \"{esc(t.title)}\"")
        _ticon = task_icon(t)
        if _ticon:
            lines.append(f"{indent}\ticon: \"{esc(_ticon)}\"")
    elif t.ttype == "advancement":
        lines.append(f"{indent}\tadvancement: \"{esc(t.advancement)}\"")
        lines.append(f"{indent}\tcriterion: \"\"")
    elif t.ttype == "kill":
        lines.append(f"{indent}\tentity: \"{esc(t.entity)}\"")
        lines.append(f"{indent}\tvalue: {t.count}L")
    elif t.ttype == "dimension":
        lines.append(f"{indent}\tdimension: \"{esc(t.entity)}\"")
    elif t.ttype == "stat":
        lines.append(f"{indent}\tstat: \"{esc(t.entity)}\"")
        lines.append(f"{indent}\tvalue: {t.count}")
    elif t.ttype == "structure":
        lines.append(f"{indent}\tstructure: \"{esc(t.entity)}\"")
    lines.append(f"{indent}\ttype: \"{t.ttype}\"")
    if t.ttype == "custom":
        CUSTOM_CHECKS.append((tid, t.cond or "always"))
    row = {"task": tid, "kind": "skip"}
    if t.ttype == "custom":
        cond = t.cond or "always"
        if cond.startswith("item_any:"):
            rest = cond[len("item_any:"):]
            items, n = rest.rsplit("@", 1)
            row = {"task": tid, "kind": "item_any", "items": items, "n": int(n)}
        else:
            pp = cond.split(":")
            if pp[0] == "building" and len(pp) >= 3:
                row = {"task": tid, "kind": "building", "word": pp[1], "n": int(pp[2])}
            elif len(pp) >= 2 and pp[0] in ("townhall", "citizens"):
                row = {"task": tid, "kind": pp[0], "n": int(pp[1])}
            elif pp[0] == "camp":
                row = {"task": tid, "kind": "camp"}
            else:
                row = {"task": tid, "kind": "always"}
    elif t.ttype == "item" and not t.consume:
        row = {"task": tid, "kind": "item_any", "items": t.item, "n": int(t.count or 1)}
    row["q"] = _CUR_QUEST_KEY[0]
    row["f"] = _CUR_CHAPTER[0]
    # независимые квесты проверяются отдельно и НЕ блокируют основную цепочку
    bucket = _CUR_CHAPTER[0] + ("#free" if _CUR_INDEPENDENT[0] else "")
    CHAIN_ROWS.setdefault(bucket, []).append(row)
    lines.append(f"{indent}}}")
    return "\n".join(lines)


def emit_reward(r: Reward, chapter_no: int, indent: str) -> str:
    rid = uid("03", chapter_no)
    lines = [f"{indent}{{", f"{indent}\tid: \"{rid}\""]
    if r.rtype == "command":
        lines.append(f"{indent}\tcommand: \"{esc(r.item)}\"")
        lines.append(f"{indent}\tpermission_level: 2")
        lines.append(f"{indent}\ttype: \"command\"")
    elif r.rtype == "xp":
        lines.append(f"{indent}\txp: {r.count}")
        lines.append(f"{indent}\ttype: \"xp\"")
    else:
        lines.append(f"{indent}\titem: {snbt_item(r.item)}")
        if r.count != 1:
            lines.append(f"{indent}\tcount: {r.count}")
        lines.append(f"{indent}\ttype: \"item\"")
    lines.append(f"{indent}}}")
    return "\n".join(lines)


def resolve_dep(dep: str, chapter: Chapter, chapter_no: int, qmap_all: dict) -> str:
    if ":" in dep:
        fq, qk = dep.split(":", 1)
        return qmap_all[(fq, qk)]
    return qmap_all[(chapter.file, dep)]


def emit_chapter(ch: Chapter, chapter_no: int, qmap_all: dict, cmap_all: dict) -> str:
    cid = uid("00", chapter_no)
    _CUR_CHAPTER[0] = ch.file
    out = ["{"]
    out.append("\tdefault_hide_dependency_lines: false")
    out.append("\tdefault_quest_shape: \"\"")
    out.append(f"\tfilename: \"{ch.file}\"")
    out.append(f"\tgroup: \"{ch.group}\"")
    out.append(f"\ticon: \"{ch.icon}\"")
    out.append(f"\tid: \"{cid}\"")
    if ch.deps_ch:
        dids = ", ".join(f'"{cmap_all[d]}"' for d in ch.deps_ch)
        out.append(f"\tdependencies: [{dids}]")
    else:
        out.append("\tdependencies: [ ]")
    out.append(f"\torder_index: {ch.order}")
    out.append("\tprogression_mode: \"linear\"")
    out.append("\tquest_links: [ ]")
    out.append("\tquests: [")

    qchunks = []
    for q in ch.quests:
        qid = qmap_all[(ch.file, q.key)]
        _CUR_INDEPENDENT[0] = q.independent
        _CUR_QUEST_KEY[0] = q.key
        b = ["\t\t{", f"\t\t\tdependencies: ["]
        if q.deps:
            dep_ids = [f'"{resolve_dep(d, ch, chapter_no, qmap_all)}"' for d in q.deps]
            b[-1] = f"\t\t\tdependencies: [{', '.join(dep_ids)}]"
        else:
            b[-1] = "\t\t\tdependencies: [ ]"
        if q.deps and not q.independent:
            # линия к предыдущему квесту цепочки должна быть видна всегда
            b.append("\t\t\thide_dependency_lines: false")
        if q.secret:
            b.append("\t\t\thide_dependency_lines: true")
            b.append("\t\t\thide_dependent_lines: true")
            b.append("\t\t\tinvisible: true")
        if q.desc:
            desc = ", ".join(f'"{esc(line)}"' for line in q.desc)
            b.append(f"\t\t\tdescription: [{desc}]")
        b.append(f"\t\t\tid: \"{qid}\"")
        _icon = q.icon or ICON_OVERRIDES.get((ch.file, q.key), "") or auto_icon(q)
        b.append(f"\t\t\ticon: \"{esc(_icon)}\"")
        if q.optional:
            b.append("\t\t\toptional: true")
        if q.repeatable:
            b.append("\t\t\tcan_repeat: true")
        if q.rewards:
            b.append("\t\t\trewards: [")
            b.append(",\n".join(emit_reward(r, chapter_no, "\t\t\t\t") for r in q.rewards))
            b.append("\t\t\t]")
        if q.tasks:
            b.append("\t\t\ttasks: [")
            b.append(",\n".join(emit_task(t, chapter_no, "\t\t\t\t") for t in q.tasks))
            b.append("\t\t\t]")
        b.append(f"\t\t\ttitle: \"{esc(q.title)}\"")
        b.append(f"\t\t\tx: {float(q.x)}d")
        b.append(f"\t\t\ty: {float(q.y)}d")
        b.append("\t\t}")
        qchunks.append("\n".join(b))

    out.append(",\n".join(qchunks))
    out.append("\t]")
    out.append(f"\ttitle: \"{esc(ch.title)}\"")
    out.append("}")
    return "\n".join(out) + "\n"


def main() -> None:
    chapters = build_chapters()
    polish(chapters)
    # stitch_chapters не нужен: эпохи сшиты deps хабов и воротами restructure_dag
    layout_chapters(chapters)

    # Первый проход: зарегистрировать ID всех квестов
    qmap: dict[tuple[str, str], str] = {}
    saved = dict(_counters)
    for idx, ch in enumerate(chapters, start=1):
        for q in ch.quests:
            qmap[(ch.file, q.key)] = uid("01", idx)
    cmap: dict[str, str] = {
        ch.file: f"0A11{idx:02X}0000000001" for idx, ch in enumerate(chapters, start=1)
    }
    _counters.clear()
    _counters.update(saved)

    CHAPTERS.mkdir(parents=True, exist_ok=True)
    for old in CHAPTERS.glob("*.snbt"):
        old.unlink()

    for idx, ch in enumerate(chapters, start=1):
        path = CHAPTERS / f"{ch.file}.snbt"
        path.write_text(emit_chapter(ch, idx, qmap, cmap), encoding="utf-8")
        print(f"OK chapters/{path.name} ({len(ch.quests)} quests)")

    write_colony_js(chapters)

    # data.snbt
    data = """{
\tdefault_autoclaim_rewards: "disabled"
\tdefault_consume_items: false
\tdefault_quest_disable_jei: false
\tdefault_quest_shape: "circle"
\tdefault_reward_team: false
\tdetection_delay: 20
\tdisable_gui: false
\tdrop_loot_crates: false
\temergency_items_cooldown: 300
\tgrid_scale: 0.5d
\ticon: "arcanopolis:city_charter"
\tlock_message: ""
\tloot_crate_no_drop: {
\t\tboss: 0
\t\tmonster: 600
\t\tpassive: 400
\t}
\tpause_game: false
\tprogression_mode: "linear"
\tshow_lock_icons: true
\ttitle: "Арканополис: Хартия нового мира"
\tversion: 13
}
"""
    (OUT / "data.snbt").write_text(data, encoding="utf-8")
    print("OK data.snbt")

    groups = f"""{{
\tchapter_groups: [
\t\t{{ id: "{G_MAIN}", title: "Основная линия" }}
\t\t{{ id: "{G_SIDE}", title: "Необязательные главы" }}
\t\t{{ id: "{G_REF}", title: "Справочник" }}
\t]
}}
"""
    (OUT / "chapter_groups.snbt").write_text(groups, encoding="utf-8")
    print("OK chapter_groups.snbt")

    total = sum(len(c.quests) for c in chapters)
    print(f"Итого: {len(chapters)} глав, {total} квестов")


if __name__ == "__main__":
    main()

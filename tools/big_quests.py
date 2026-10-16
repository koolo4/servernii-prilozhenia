# -*- coding: utf-8 -*-
"""big_quests.py — огромные взаимосвязанные цепочки квестов для gen_quests.py.

Каждая эпоха получает несколько «треков» (цепочек) с плавными шагами:
  - городская застройка (MineColonies: хижины, уровни, жители) — custom-условия;
  - линии модов (Create / Thermal / Mekanism / Ars / Botania / AE2...) — item-задачи;
  - автоматизация производства (массовые партии, дубли машин, линии);
  - взаимодействие модов (одна задача = предмет И условие колонии, кросс-связи);
  - логистика и склады.

Задачи: I(item) / C(custom) / B(item+custom) — НЕ ручные галочки.
Ключи новых квестов имеют префиксы p_/e1_../e6_/s_ и не пересекаются со старыми.
"""

# ---------------------------------------------------------------------------
# Мини-DSL задач
# ---------------------------------------------------------------------------

def I(item, n=1):
    """Item-задача. item может быть 'a|b' (любой из вариантов)."""
    return ("item", item, n)


def C(cond):
    """Custom-задача: townhall:N | citizens:N | building:word:N | always."""
    return ("cus", cond, 0)


def B(item, cond, n=1):
    """Две задачи в квесте: предмет И условие колонии (взаимодействие)."""
    return ("both", item, n, cond)


def IC(item, n=1):
    """Item-задача с ПОТРЕБЛЕНИем предмета (поставка/торговля)."""
    return ("itemc", item, n)


def K(entity, n=1):
    """Kill-задача: убить n мобов entity."""
    return ("kill", entity, n)


def DIM(d):
    """Задача измерения: побывать в d."""
    return ("dim", d, 0)


def ST(stat, v):
    """Стат-задача: достигнуть значения v статистики stat."""
    return ("stat", stat, v)


def ADV(a):
    """Задача достижения a."""
    return ("adv", a, 0)


def _task_title(t):
    kind = t[0]
    if kind in ("item", "itemc"):
        item, n = t[1], t[2]
        if "|" in item:
            return "Получите: " + " / ".join(item.split("|"))
        return f"Соберите: {item} ×{n}"
    if kind == "kill":
        return f"Убить {t[1].split(':')[-1]} ×{t[2]}"
    if kind == "dim":
        return f"Побывать: {t[1].split(':')[-1]}"
    if kind == "stat":
        return f"Достичь: {t[1].split(':')[-1]} {t[2]}"
    if kind == "adv":
        return f"Достижение: {t[1].split('/')[-1]}"
    if kind == "cus":
        p = t[1].split(":")
        if p[0] == "townhall":
            return f"Ратуша {p[1]} уровня"
        if p[0] == "citizens":
            return f"Жителей: {p[1]}"
        if p[0] == "building":
            return f"Здание {p[1]} (ур. {p[2]})"
        return "Условие выполнено"
    return "Условие выполнено"


def _task_desc(t):
    kind = t[0]
    if kind in ("item", "itemc"):
        item, n = t[1], t[2]
        verb = "Поставьте (потребляется):" if kind == "itemc" else "Требуется:"
        if "|" in item:
            return verb + " любой из вариантов: " + ", ".join(f"{x} ×{n}" for x in item.split("|"))
        return f"{verb} {item} ×{n}."
    if kind == "kill":
        return f"Убить существ: {t[1]} ×{t[2]}."
    if kind == "dim":
        return f"Побывать в измерении: {t[1]}."
    if kind == "stat":
        return f"Достичь статистику {t[1]} ≥ {t[2]}."
    if kind == "adv":
        return f"Получить достижение: {t[1]}."
    if kind == "cus":
        p = t[1].split(":")
        if p[0] == "townhall":
            return f"Ратуша колонии должна достигнуть {p[1]} уровня."
        if p[0] == "citizens":
            return f"В колонии должно быть не менее {p[1]} жителей."
        if p[0] == "building":
            return f"Постройте или улучшите здание «{p[1]}» до {p[2]} уровня."
        return "Условие проверяется автоматически."
    return "Условие проверяется автоматически."


def track(x, y0, prefix, steps, dep0=None, cross=None):
    """Линейная цепочка: каждый квест зависит от предыдущего (+ кросс-связи).

    steps: [(title, task | [task, ...]), ...]
    cross: {индекс_шага: [ключи_других_квестов]}
    """
    out = []
    prev = dep0
    for i, (title, task) in enumerate(steps):
        key = f"{prefix}{i + 1:02d}"
        deps = []
        if prev:
            deps.append(prev)
        if cross and i in cross:
            deps.extend(cross[i])
        tasks = task if isinstance(task, list) else [task]
        desc = ["Задача цепочки квестов Арканополиса."]
        for t in tasks:
            desc.append(_task_desc(t))
        out.append({
            "key": key,
            "title": title,
            "x": float(x),
            "y": y0 - 1.7 * i,
            "desc": desc,
            "tasks": tasks,
            "rewards": [],
            "deps": deps,
        })
        prev = key
    return out


def extra_quest(key, title, x, y, task, deps=(), desc=None):
    tasks = task if isinstance(task, list) else [task]
    d = desc or ["Задача цепочки квестов Арканополиса."]
    if not desc:
        for t in tasks:
            d.append(_task_desc(t))
    return {"key": key, "title": title, "x": float(x), "y": float(y),
            "desc": d, "tasks": tasks, "rewards": [], "deps": list(deps)}


# ---------------------------------------------------------------------------
# ПРОЛОГ — быт, запасы, инструменты, первые взаимодействия
# ---------------------------------------------------------------------------

def _prologue():
    q = []
    q += track(-12, 4, "p_b", [
        ("Поваренная хижина", C("building:cook:1")),
        ("Первая ферма", C("building:farm:1")),
        ("Рыбацкая хижина", C("building:fish:1")),
        ("Дома для семей", C("building:residence:2")),
        ("Четверо жителей", C("citizens:4")),
        ("Шестеро жителей", C("citizens:6")),
        ("Восьмеро жителей", C("citizens:8")),
        ("Сторожевая башня", C("building:guard:1")),
        ("Кузница поселения", C("building:black:1")),
        ("Каменоломня", C("building:stone:1")),
    ], dep0="food")
    q += track(-7, 4, "p_s", [
        ("Запас дров", I("minecraft:oak_log", 64)),
        ("Строительный лес", I("minecraft:oak_planks", 128)),
        ("Каменный резерв", I("minecraft:cobblestone", 256)),
        ("Древесный уголь", I("minecraft:charcoal", 32)),
        ("Печи поселения", I("minecraft:furnace", 2)),
        ("Факелы", I("minecraft:torch", 32)),
        ("Сундуки", I("minecraft:chest", 8)),
        ("Стекло", I("minecraft:glass", 32)),
        ("Железо", I("minecraft:iron_ingot", 16)),
        ("Пшеница", I("minecraft:wheat", 32)),
    ], dep0="start")
    q += track(-2, 4, "p_t", [
        ("Каменные инструменты", [I("minecraft:stone_pickaxe", 2), C("building:builder:1")]),
        ("Каменный топор", I("minecraft:stone_axe", 2)),
        ("Железная кирка", I("minecraft:iron_pickaxe", 2)),
        ("Железный топор", I("minecraft:iron_axe", 2)),
        ("Железный меч", I("minecraft:iron_sword", 1)),
        ("Щит", I("minecraft:shield", 1)),
        ("Лук", I("minecraft:bow", 1)),
        ("Стрелы", I("minecraft:arrow", 32)),
    ], dep0="orders", cross={0: ["p_s03"]})
    q += track(3, 4, "p_i", [
        ("Еда на подходе", B("minecraft:bread", "building:farm:2", 16)),
        ("Снабжение лагеря", B("minecraft:chest", "building:warehouse:1", 4)),
        ("Инструменты для рабочих", B("minecraft:iron_pickaxe", "building:black:1", 4)),
        ("Дороги и тротуары", B("minecraft:cobblestone", "citizens:4", 64)),
        ("Городская площадь", B("minecraft:stone", "building:residence:2", 64)),
    ], cross={0: ["p_b02"], 1: ["p_s07"], 2: ["p_t03"]})
    return q


# ---------------------------------------------------------------------------
# ЭПОХА I — дерево, вода, ремесло
# ---------------------------------------------------------------------------

def _era1():
    q = []
    q += track(-15, 4, "e1_c", [
        ("Квартал жилья", C("building:residence:3")),
        ("Четыре жителя", C("citizens:4")),
        ("Шесть жителей", C("citizens:6")),
        ("Десять жителей", C("citizens:10")),
        ("Двенадцать жителей", C("citizens:12")),
        ("Лесоруб II уровня", C("building:lumberjack:2")),
        ("Шахтёр II уровня", C("building:miner:2")),
        ("Фермер II уровня", C("building:farm:2")),
        ("Повар II уровня", C("building:cook:2")),
        ("Рыболов II уровня", C("building:fish:2")),
        ("Лесопилка", C("building:saw:1")),
        ("Каменщик", C("building:stone:2")),
        ("Кузнец II уровня", C("building:black:2")),
        ("Стража II уровня", C("building:guard:2")),
        ("Склад II уровня", C("building:warehouse:2")),
        ("Почта II уровня", C("building:deliveryman:2")),
    ], dep0="hub")
    q += track(-9, 4, "e1_m", [
        ("Зубчатые колёса", I("create:cogwheel", 16)),
        ("Большие колёса", I("create:large_cogwheel", 8)),
        ("Валы", I("create:shaft", 16)),
        ("Андрезитовый корпус", I("create:andesite_casing", 8)),
        ("Редукторы", I("create:gearbox", 8)),
        ("Ремни конвейера", I("create:belt_connector", 16)),
        ("Погрузочная площадка", I("create:depot", 4)),
        ("Жёлоба", I("create:chute", 8)),
        ("Мельница", I("create:millstone", 2)),
        ("Измельчитель", I("create:crushing_wheel", 2)),
        ("Смеситель", I("create:mechanical_mixer", 2)),
        ("Чаша", I("create:basin", 4)),
        ("Разливочный кран", I("create:spout", 2)),
        ("Слив", I("create:item_drain", 2)),
        ("Механический крафтер", I("create:mechanical_crafter", 8)),
        ("Гаечный ключ", I("create:wrench", 1)),
        ("Электронные лампы", I("create:electron_tube", 8)),
        ("Суперклей", I("create:super_glue", 1)),
    ], dep0="water_wheel", cross={5: ["e1_c15"]})
    q += track(-3, 4, "e1_a", [
        ("Самоцветы источника", I("ars_nouveau:source_gem", 16)),
        ("Источниковый камень", I("ars_nouveau:sourcestone", 64)),
        ("Опыт в бутылке", I("minecraft:experience_bottle", 8)),
        ("Книжные полки", I("minecraft:bookshelf", 8)),
        ("Чародейский стол", I("minecraft:enchanting_table", 1)),
        ("Библиотека колонии", B("minecraft:book", "building:library:1", 16)),
        ("Магическая мастерская", B("ars_nouveau:source_gem", "building:saw:1", 32)),
        ("Зелья зельеварения", I("minecraft:glass_bottle", 16)),
    ], dep0="spellbook", cross={5: ["e1_c11"]})
    q += track(3, 4, "e1_p", [
        ("Массовая лесозаготовка", I("minecraft:oak_log", 256)),
        ("Массовая добыча камня", I("minecraft:cobblestone", 512)),
        ("Уголь на нужды города", I("minecraft:coal", 64)),
        ("Партия железа", I("minecraft:iron_ingot", 32)),
        ("Андрезитовый сплав", I("create:andesite_alloy", 32)),
        ("Дубли прессов", I("create:mechanical_press", 2)),
        ("Дубли пил", I("create:mechanical_saw", 2)),
        ("Дубли вентиляторов", I("create:encased_fan", 2)),
        ("Дубли измельчителей", I("create:millstone", 2)),
        ("Линия конвейеров", I("create:belt_connector", 32)),
        ("Фабрика стройматериалов", I("minecraft:stone_bricks", 128)),
        ("Стекольный цех", I("minecraft:glass", 128)),
    ], cross={0: ["e1_c06"], 4: ["e1_m04"], 11: ["e1_c11"]})
    q += track(9, 4, "e1_x", [
        ("Еда для мастеров", B("minecraft:bread", "building:cook:2", 32)),
        ("Железо из шахты", B("minecraft:iron_ingot", "building:miner:2", 16)),
        ("Лес на балансе", B("minecraft:oak_log", "building:lumberjack:2", 64)),
        ("Механика и ремесло", B("create:cogwheel", "building:black:2", 32)),
        ("Магия и стройка", B("ars_nouveau:sourcestone", "building:residence:3", 64)),
        ("Снабжение цехов", B("create:andesite_alloy", "building:warehouse:2", 16)),
    ], cross={0: ["e1_p03"], 3: ["e1_m01"], 4: ["e1_a02"]})
    return q


# ---------------------------------------------------------------------------
# ЭПОХА II — пар и логистика
# ---------------------------------------------------------------------------

def _era2():
    q = []
    q += track(-15, 4, "e2_c", [
        ("Ратуша III уровня", C("townhall:3")),
        ("Четырнадцать жителей", C("citizens:14")),
        ("Шестнадцать жителей", C("citizens:16")),
        ("Восемнадцать жителей", C("citizens:18")),
        ("Двадцать жителей", C("citizens:20")),
        ("Строитель III уровня", C("building:builder:3")),
        ("Склад III уровня", C("building:warehouse:3")),
        ("Механик", C("building:mech:1")),
        ("Университет", C("building:university:1")),
        ("Библиотека II уровня", C("building:library:2")),
        ("Школа", C("building:school:1")),
        ("Госпиталь", C("building:hospital:1")),
        ("Повар III уровня", C("building:cook:3")),
        ("Фермер III уровня", C("building:farm:3")),
        ("Стража III уровня", C("building:guard:3")),
        ("Жилой квартал III", C("building:residence:4")),
    ], dep0="hub")
    q += track(-9, 4, "e2_s", [
        ("Второй паровой двигатель", I("create:steam_engine", 2)),
        ("Свистки паровоза", I("create:steam_whistle", 4)),
        ("Железнодорожная обвязка", I("create:railway_casing", 16)),
        ("Пламенные горелки", I("create:blaze_burner", 4)),
        ("Торт из пламени", I("create:blaze_cake", 8)),
        ("Механическая рука", I("create:mechanical_arm", 2)),
        ("Контроллер скорости", I("create:rotation_speed_controller", 1)),
        ("Спидометр", I("create:speedometer", 2)),
        ("Стрессометр", I("create:stressometer", 2)),
        ("Латунные воронки", I("create:brass_funnel", 8)),
        ("Латунные тоннели", I("create:brass_tunnel", 8)),
        ("Электронные лампы", I("create:electron_tube", 16)),
        ("Суперклей впрок", I("create:super_glue", 4)),
    ], dep0="steam", cross={2: ["e2_c07"]})
    q += track(-3, 4, "e2_e", [
        ("Медная проводка", [I("minecraft:copper_ingot", 32), C("building:mech:1")]),
        ("Электрический контур", I("createaddition:copper_wire|minecraft:copper_ingot", 32)),
        ("Стальные стержни", I("createaddition:steel_rod|minecraft:iron_ingot", 16)),
        ("Ротор генератора", I("createaddition:modular_accumulator|minecraft:redstone_block", 2)),
        ("Электромотор", I("createaddition:electric_motor|minecraft:redstone", 2)),
        ("Роллинговая мельница", I("createaddition:rolling_mill|minecraft:iron_block", 1)),
        ("Зарядная станция", I("createaddition:tesla_coil|minecraft:lightning_rod", 1)),
        ("Энергия на склад", B("minecraft:redstone", "building:warehouse:3", 64)),
    ], cross={0: ["e2_c08"], 7: ["e2_c07"]})
    q += track(3, 4, "e2_l", [
        ("Паровой котёл на угле", I("minecraft:coal", 128)),
        ("Латунный запас", I("create:brass_ingot", 32)),
        ("Точная механика впрок", I("create:precision_mechanism", 16)),
        ("Андрезит на конвейеры", I("create:andesite_alloy", 64)),
        ("Стекло для теплиц", I("minecraft:glass", 128)),
        ("Сундуки складов", I("minecraft:chest", 32)),
        ("Бочки", I("minecraft:barrel", 16)),
        ("Кирпичи города", I("minecraft:brick", 128)),
        ("Автоматическая пекарня", B("minecraft:bread", "building:cook:3", 64)),
        ("Ремонтный фонд", B("minecraft:iron_ingot", "building:black:3", 32)),
    ], cross={2: ["e2_s01"], 8: ["e2_c13"]})
    q += track(9, 4, "e2_x", [
        ("Поезда снабжения", B("create:railway_casing", "building:deliveryman:2", 8)),
        ("Готовка механизмами", B("create:mechanical_mixer", "building:cook:3", 2)),
        ("Сырьё со складов", B("minecraft:raw_iron", "building:miner:3", 32)),
        ("Механика и университет", B("create:precision_mechanism", "building:university:1", 8)),
        ("Энергия и логистика", B("createaddition:copper_wire|minecraft:copper_ingot", "building:warehouse:3", 16)),
        ("Магическая автоматизация", B("ars_nouveau:source_gem", "building:mech:1", 16)),
    ], cross={0: ["e2_s03"], 3: ["e2_c09"], 5: ["e2_c10"]})
    return q


# ---------------------------------------------------------------------------
# ЭПОХА III — механизмы и индустриальный город
# ---------------------------------------------------------------------------

def _era3():
    q = []
    q += track(-15, 4, "e3_c", [
        ("Двадцать четыре жителя", C("citizens:24")),
        ("Двадцать восемь жителей", C("citizens:28")),
        ("Тридцать два жителя", C("citizens:32")),
        ("Университет II уровня", C("building:university:2")),
        ("Школа II уровня", C("building:school:2")),
        ("Госпиталь II уровня", C("building:hospital:2")),
        ("Библиотека III уровня", C("building:library:3")),
        ("Механик II уровня", C("building:mech:2")),
        ("Склад IV уровня", C("building:warehouse:4")),
        ("Шахтёр IV уровня", C("building:miner:4")),
        ("Лесоруб IV уровня", C("building:lumberjack:4")),
        ("Кузнец III уровня", C("building:black:3")),
        ("Лесопилка III уровня", C("building:saw:3")),
        ("Стража IV уровня", C("building:guard:4")),
        ("Повар IV уровня", C("building:cook:4")),
        ("Жилой квартал V", C("building:residence:5")),
    ], dep0="hub")
    q += track(-9, 4, "e3_t", [
        ("Рама машин Thermal", I("thermal:machine_frame", 4)),
        ("Железные шестерни", I("thermal:iron_gear", 16)),
        ("Золотые шестерни", I("thermal:gold_gear|minecraft:gold_ingot", 8)),
        ("Бронза Thermal", I("thermal:bronze_ingot|minecraft:iron_ingot", 32)),
        ("Сталь Thermal", I("thermal:steel_ingot", 32)),
        ("Электрум", I("thermal:electrum_ingot|minecraft:gold_ingot", 16)),
        ("Инвар", I("thermal:invar_ingot|minecraft:iron_ingot", 16)),
        ("Константан", I("thermal:constantan_ingot|minecraft:copper_ingot", 16)),
        ("Сигналум", I("thermal:signalum_ingot|minecraft:redstone", 16)),
        ("Люмий", I("thermal:lumium_ingot|minecraft:glowstone_dust", 16)),
        ("Тепловая обвязка", B("thermal:machine_frame", "building:mech:2", 2)),
    ], dep0="thermal_line")
    q += track(-3, 4, "e3_k", [
        ("Контуры управления", I("mekanism:basic_control_circuit", 32)),
        ("Сталь Mekanism", I("mekanism:ingot_steel", 64)),
        ("Осмий", I("mekanism:ingot_osmium|minecraft:iron_ingot", 32)),
        ("Обогащённый углерод", I("mekanism:enriched_carbon|minecraft:coal", 16)),
        ("Обогащённый красный камень", I("mekanism:enriched_redstone|minecraft:redstone", 16)),
        ("Обогащённый алмаз", I("mekanism:enriched_diamond|minecraft:diamond", 8)),
        ("Атомный сплав", I("mekanism:alloy_atomic", 8)),
        ("Усиленный сплав", I("mekanism:alloy_reinforced|mekanism:alloy_atomic", 8)),
        ("Энергетический планшет", I("mekanism:energy_tablet|minecraft:redstone_block", 4)),
        ("Газовая обработка", B("mekanism:basic_control_circuit", "building:mech:2", 16)),
    ], dep0="enrichment", cross={0: ["e3_t11"]})
    q += track(3, 4, "e3_p", [
        ("Партия усиленных корпусов", I("arcanopolis:reinforced_casing", 16)),
        ("Массовая сталь", I("mekanism:ingot_steel", 128)),
        ("Массовые концуры", I("mekanism:basic_control_circuit", 64)),
        ("Промышленный уголь", I("minecraft:coal", 256)),
        ("Промышленное железо", I("minecraft:iron_ingot", 256)),
        ("Промышленное золото", I("minecraft:gold_ingot", 64)),
        ("Линия переработки руд", B("mekanism:ingot_osmium|minecraft:iron_ingot", "building:miner:4", 64)),
        ("Энергия квартала", B("mekanism:energy_tablet|minecraft:redstone_block", "building:warehouse:4", 2)),
        ("Автосборка корпусов", B("arcanopolis:reinforced_casing", "building:mech:2", 8)),
    ], cross={0: ["e3_k02"], 8: ["e3_t11"]})
    q += track(9, 4, "e3_x", [
        ("Тепло и механизмы", B("thermal:machine_frame", "building:mech:2", 2)),
        ("Контуры и склад", B("mekanism:basic_control_circuit", "building:warehouse:4", 16)),
        ("Сталь и университет", B("mekanism:ingot_steel", "building:university:2", 32)),
        ("Create в индустрии", B("create:precision_mechanism", "building:mech:2", 16)),
        ("Магия и машины", B("ars_nouveau:source_gem", "building:mech:2", 32)),
        ("Паспорт производства", B("arcanopolis:technical_passport", "townhall:3", 1)),
    ], cross={5: ["passport"]})
    return q


# ---------------------------------------------------------------------------
# ЭПОХА IV — расцвет магии
# ---------------------------------------------------------------------------

def _era4():
    q = []
    q += track(-15, 4, "e4_c", [
        ("Тридцать шесть жителей", C("citizens:36")),
        ("Сорок жителей", C("citizens:40")),
        ("Библиотека IV уровня", C("building:library:4")),
        ("Университет III уровня", C("building:university:3")),
        ("Школа III уровня", C("building:school:3")),
        ("Госпиталь III уровня", C("building:hospital:3")),
        ("Механик III уровня", C("building:mech:3")),
        ("Повар V уровня", C("building:cook:5")),
        ("Стража V уровня", C("building:guard:5")),
        ("Склад V уровня", C("building:warehouse:5")),
    ], dep0="hub")
    q += track(-9, 4, "e4_n", [
        ("Самоцветы источника", I("ars_nouveau:source_gem", 64)),
        ("Источниковый камень", I("ars_nouveau:sourcestone", 128)),
        ("Опыт для чар", I("minecraft:experience_bottle", 32)),
        ("Зелья силы", I("minecraft:potion|minecraft:glass_bottle", 16)),
        ("Чародейская библиотека", B("minecraft:book", "building:library:4", 32)),
        ("Алтарь чар", I("minecraft:enchanting_table", 2)),
        ("Магические помощники", B("ars_nouveau:source_gem", "building:university:3", 32)),
        ("Мастерская заклинаний", B("minecraft:experience_bottle", "building:mech:3", 8)),
    ], dep0="ars_base")
    q += track(-3, 4, "e4_b", [
        ("Живое дерево", I("botania:livingwood|minecraft:oak_log", 64)),
        ("Живой камень", I("botania:livingrock|minecraft:stone", 64)),
        ("Манасталь", I("botania:manasteel_ingot|minecraft:iron_ingot", 32)),
        ("Мана-алмаз", I("botania:mana_diamond|minecraft:diamond", 8)),
        ("Мана-жемчуг", I("botania:mana_pearl", 16)),
        ("Мана-пул", I("botania:mana_pool", 2)),
        ("Руны", I("botania:rune|minecraft:stone", 16)),
        ("Террасталь", I("botania:terrasteel_ingot", 4)),
        ("Союз с дриадами", B("botania:terrasteel_ingot", "building:library:4", 8)),
    ], dep0="mana_pool", cross={5: ["e4_c03"]})
    q += track(3, 4, "e4_bl", [
        ("Алтарь крови", I("bloodmagic:altar", 2)),
        ("Кровавые плиты", I("bloodmagic:blankslate", 32)),
        ("Усиленные плиты", I("bloodmagic:reinforcedslate|minecraft:stone_slab", 16)),
        ("Кровавые руны", I("bloodmagic:blood_rune|minecraft:stone_bricks", 16)),
        ("Жертвенный нож", I("bloodmagic:sacrificial_dagger|minecraft:iron_sword", 1)),
        ("Ритуал крови", B("bloodmagic:blankslate", "building:library:4", 16)),
    ], dep0="altar")
    q += track(9, 4, "e4_e", [
        ("Пьютер", I("eidolon:pewter_ingot|minecraft:iron_ingot", 16)),
        ("Арканное золото", I("eidolon:arcane_gold_ingot|minecraft:gold_ingot", 16)),
        ("Котёл алхимии", I("eidolon:crucible|minecraft:cauldron", 1)),
        ("Свитки ритуалов", I("minecraft:paper", 32)),
        ("Алхимия Eidolon", B("eidolon:pewter_ingot|minecraft:iron_ingot", "building:library:4", 8)),
        ("Регулятор ритуалов", I("arcanopolis:ritual_regulator", 2)),
        ("Арканная лаборатория", B("arcanopolis:ritual_regulator", "building:library:4", 1)),
    ], cross={4: ["e4_c03"], 6: ["e4_n07"]})
    return q


# ---------------------------------------------------------------------------
# ЭПОХА V — сеть и автоматизированное производство
# ---------------------------------------------------------------------------

def _era5():
    q = []
    q += track(-15, 4, "e5_c", [
        ("Сорок четыре жителя", C("citizens:44")),
        ("Сорок восемь жителей", C("citizens:48")),
        ("Пятьдесят два жителя", C("citizens:52")),
        ("Механик IV уровня", C("building:mech:4")),
        ("Университет IV уровня", C("building:university:4")),
        ("Госпиталь IV уровня", C("building:hospital:4")),
        ("Библиотека V уровня", C("building:library:5")),
        ("Шахтёр V уровня", C("building:miner:5")),
    ], dep0="hub")
    q += track(-9, 4, "e5_a", [
        ("Кристалл цертуса", I("ae2:certus_quartz_crystal|minecraft:quartz", 32)),
        ("Флюидовый кристалл", I("ae2:fluix_crystal|minecraft:amethyst_shard", 16)),
        ("Пыль цертуса", I("ae2:certus_quartz_dust|minecraft:quartz", 32)),
        ("Процессоры сети", I("ae2:engineering_processor|mekanism:basic_control_circuit", 16)),
        ("Кабели сети", I("ae2:fluix_glass_cable|minecraft:glass_pane", 16)),
        ("Сетевой контроллер", I("ae2:controller|minecraft:redstone_block", 1)),
        ("Терминалы", I("ae2:terminal|minecraft:glass", 2)),
        ("Ячейки хранения", I("ae2:cell_component_1k|minecraft:redstone", 8)),
        ("Шаблоны заказов", I("ae2:blank_pattern|minecraft:paper", 16)),
        ("Автокрафт", B("ae2:blank_pattern|minecraft:paper", "building:mech:4", 8)),
    ], dep0="ae2_base")
    q += track(-3, 4, "e5_m", [
        ("Атомные сплавы", I("mekanism:alloy_atomic", 16)),
        ("Высшие контуры", I("mekanism:ultimate_control_circuit", 16)),
        ("Энергокуб", I("mekanism:basic_energy_cube|minecraft:redstone_block", 2)),
        ("Турбинный комплект", I("mekanism:turbine_blade|minecraft:iron_ingot", 4)),
        ("Заводские модули", I("mekanism:basic_factory|minecraft:crafting_table", 2)),
        ("Роботы-сборщики", B("mekanism:ultimate_control_circuit", "building:mech:4", 8)),
        ("Газовая фабрика", B("mekanism:alloy_atomic", "building:mech:4", 8)),
    ], dep0="mek_link", cross={0: ["e5_c04"]})
    q += track(3, 4, "e5_x", [
        ("Сеть и механизмы", [I("mekanism:ultimate_control_circuit", 8), I("ae2:fluix_crystal|minecraft:amethyst_shard", 8)]),
        ("Автозаказы склада", B("ae2:blank_pattern|minecraft:paper", "building:warehouse:5", 16)),
        ("Энергия для сети", B("mekanism:basic_energy_cube|minecraft:redstone_block", "building:mech:4", 2)),
        ("Линия «от руды до корпуса»", B("arcanopolis:reinforced_casing", "building:mech:4", 32)),
        ("Продвинутая логистика", B("minecraft:ender_pearl", "building:deliveryman:3", 16)),
        ("Ядро автоматизации", B("arcanopolis:automation_core", "townhall:5", 1)),
    ], cross={5: ["project"]})
    q += track(9, 4, "e5_p", [
        ("Массовые концуры", I("mekanism:ultimate_control_circuit", 32)),
        ("Массовый осмий", I("mekanism:ingot_osmium|minecraft:iron_ingot", 64)),
        ("Массовая сталь", I("mekanism:ingot_steel", 128)),
        ("Эндер-резерв", I("minecraft:ender_pearl", 32)),
        ("Редкие сплавы", I("thermal:enderium_ingot", 8)),
        ("Автоматическая сортировка", B("minecraft:hopper", "building:warehouse:5", 32)),
    ], cross={0: ["e5_m02"], 5: ["e5_x02"]})
    return q


# ---------------------------------------------------------------------------
# ЭПОХА VI — космический горизонт
# ---------------------------------------------------------------------------

def _era6():
    q = []
    q += track(-15, 4, "e6_c", [
        ("Пятьдесят шесть жителей", C("citizens:56")),
        ("Шестьдесят жителей", C("citizens:60")),
        ("Механик V уровня", C("building:mech:5")),
        ("Университет V уровня", C("building:university:5")),
        ("Госпиталь V уровня", C("building:hospital:5")),
        ("Кузнец V уровня", C("building:black:5")),
        ("Шахтёр и лесоруб V", [C("building:miner:5"), C("building:lumberjack:5")]),
    ], dep0="hub")
    q += track(-9, 4, "e6_k", [
        ("Поздняя переработка", I("mekanism:alloy_atomic", 32)),
        ("Высшие концуры впрок", I("mekanism:ultimate_control_circuit", 32)),
        ("Плутониевые таблетки", I("mekanism:pellet_plutonium|minecraft:nether_star", 4)),
        ("Антипротонный комплект", I("mekanism:pellet_antimatter|minecraft:dragon_breath", 2)),
        ("Космический скафандр", B("mekanism:ultimate_control_circuit", "building:mech:5", 16)),
    ], dep0="mek_late")
    q += track(-3, 4, "e6_t", [
        ("Эндерий впрок", I("thermal:enderium_ingot", 16)),
        ("Сигналум впрок", I("thermal:signalum_ingot|minecraft:redstone", 32)),
        ("Люмий впрок", I("thermal:lumium_ingot|minecraft:glowstone_dust", 32)),
        ("Рамы машин впрок", I("thermal:machine_frame", 8)),
        ("Тепловая энергетика", B("thermal:enderium_ingot", "building:mech:5", 8)),
    ], dep0="thermal_late")
    q += track(3, 4, "e6_r", [
        ("Редкие реагенты школ", I("botania:terrasteel_ingot", 8)),
        ("Звёзды Нижнего мира", I("minecraft:nether_star", 4)),
        ("Дыхание дракона", I("minecraft:dragon_breath", 8)),
        ("Ритуалы высшей магии", B("arcanopolis:ritual_regulator", "building:library:5", 4)),
        ("Пламя эфира", B("ars_nouveau:source_gem", "building:university:5", 64)),
    ], dep0="rare", cross={1: ["nether_stars"], 2: ["dragon_breath"]})
    q += track(9, 4, "e6_f", [
        ("Центральное сооружение", I("arcanopolis:arcane_converter", 16)),
        ("Ядро города", B("arcanopolis:arcane_converter", "townhall:5", 8)),
        ("Изначальный катализатор", I("arcanopolis:primal_catalyst", 2)),
        ("Сердце Арканополиса", I("arcanopolis:heart_of_arcanopolis", 1)),
        ("Первый импульс", B("arcanopolis:heart_of_arcanopolis", "citizens:60", 1)),
    ], dep0="center", cross={2: ["catalyst"], 3: ["heart"], 4: ["finale"]})
    return q


# ---------------------------------------------------------------------------
# Необязательные главы — небольшие самостоятельные цепочки
# ---------------------------------------------------------------------------

def _sides():
    out = {}
    out["70_side_architects"] = track(6, 2, "s_ar", [
        ("Каменные кварталы", I("minecraft:stone_bricks", 128)),
        ("Стеклянные фасады", I("minecraft:glass_pane", 64)),
        ("Медные крыши", I("minecraft:copper_block", 16)),
        ("Кирпичные особняки", I("minecraft:bricks", 32)),
        ("Архитектурный ансамбль", B("minecraft:quartz_block", "building:residence:3", 16)),
        ("Парк и сады", B("minecraft:oak_sapling", "building:farm:2", 32)),
    ])
    out["71_side_expeditions"] = track(6, 2, "s_ex", [
        ("Припасы экспедиции", I("minecraft:cooked_beef", 32)),
        ("Снаряжение", I("minecraft:iron_sword", 2)),
        ("Трофеи Нижнего мира", I("minecraft:blaze_rod", 8)),
        ("Трофеи Края", I("minecraft:ender_pearl", 8)),
        ("Экспедиционный отчёт", B("minecraft:map"[:6] + "p", "building:university:1", 8)),
        ("Музей экспедиций", B("minecraft:name_tag", "building:library:2", 4)),
    ])
    out["72_side_schools"] = track(6, 2, "s_sc", [
        ("Учебные материалы", I("minecraft:book", 16)),
        ("Школьные доски", I("minecraft:lectern", 2)),
        ("Студенты школы", C("building:school:2")),
        ("Магистры университета", C("building:university:2")),
        ("Научная работа", B("minecraft:writable_book"[:7] + "_book", "building:library:2", 8)),
    ])
    out["73_side_engineering"] = track(6, 2, "s_en", [
        ("Инженерный кейс", I("create:toolbox|minecraft:chest", 1)),
        ("Чертежи и схемы", I("minecraft:paper", 32)),
        ("Механическая мастерская", C("building:mech:2")),
        ("Испытательный стенд", B("create:wrench", "building:mech:2", 2)),
        ("Инженерный диплом", B("create:precision_mechanism", "building:university:1", 4)),
    ])
    out["74_side_supply"] = track(6, 2, "s_su", [
        ("Продовольственный резерв", I("minecraft:bread", 128)),
        ("Топливный резерв", I("minecraft:coal", 128)),
        ("Строительный резерв", I("minecraft:oak_planks", 256)),
        ("Резерв железа", I("minecraft:iron_ingot", 64)),
        ("Город без дефицита", B("minecraft:golden_apple", "building:warehouse:3", 2)),
        ("Логистика снабжения", B("minecraft:chest", "building:deliveryman:2", 16)),
    ])
    out["80_reference"] = [
        extra_quest("ref_sys", "Как работают цепочки", 4, -2,
                    [C("always")],
                    desc=["Новые квесты — это автоматические цепочки:",
                          "условия колонии (ратуша, жители, здания) проверяет серверный скрипт,",
                          "предметные задачи выполняются при крафте и добыче.",
                          "Ручные галочки не используются."]),
    ]
    return out


# ---------------------------------------------------------------------------
# Сборка
# ---------------------------------------------------------------------------

def build_extras():
    out = {
        "00_prologue": _prologue() + _prologue2() + _prologue3(),
        "10_epoch_wood_water": _era1(),
        "20_epoch_steam_logistics": _era2() + _era2b(),
        "30_epoch_industry": _era3() + _era3b(),
        "40_epoch_magic": _era4() + _era4b() + _era4c(),
        "50_epoch_network": _era5() + _era5b() + _era5c(),
        "60_epoch_cosmos": _era6() + _era6b() + _era6c(),
    }
    out.update(_sides())
    for _part in (_v5_puzzles(), _v5_treasure()):
        for _f, _qs in _part.items():
            out.setdefault(_f, []).extend(_qs)
    out["74_side_supply"].extend(_v5_trade())
    out["71_side_expeditions"].extend(_v5_hunt() + _v5_explore() + _v5_secrets())
    return out


# ---------------------------------------------------------------------------
# ДОЗАПОЛНЕНИЕ до 70+ квестов на каждую эпоху
# ---------------------------------------------------------------------------

def _prologue2():
    q = []
    q += track(8, 4, "p_h", [
        ("Яблоки сада", I("minecraft:apple", 16)),
        ("Морковь и картофель", [I("minecraft:carrot", 16), I("minecraft:potato", 16)]),
        ("Домашние яйца", I("minecraft:egg", 8)),
        ("Молоко", I("minecraft:milk_bucket", 4)),
        ("Кожа и перья", [I("minecraft:leather", 8), I("minecraft:feather", 8)]),
        ("Шерсть для домов", I("minecraft:white_wool", 16)),
        ("Мясо на зиму", I("minecraft:mutton|minecraft:porkchop", 16)),
    ], cross={0: ["p_b02"]})
    q += track(13, 4, "p_d", [
        ("Фонари улиц", I("minecraft:lantern", 8)),
        ("Стеклянные окна", I("minecraft:glass_pane", 32)),
        ("Ограды и заборы", I("minecraft:oak_fence", 32)),
        ("Двери домов", I("minecraft:oak_door", 4)),
        ("Лестницы", I("minecraft:ladder", 16)),
        ("Украшения", I("minecraft:painting", 4)),
        ("Костёр на площади", I("minecraft:campfire", 2)),
    ], cross={0: ["p_s08"]})
    q += track(18, 4, "p_f", [
        ("Топливный резерв", I("minecraft:charcoal", 64)),
        ("Лава для плавки", I("minecraft:lava_bucket", 2)),
        ("Коптильня", I("minecraft:smoker", 1)),
        ("Доменная печь", I("minecraft:blast_furnace", 1)),
        ("Свечи и воск", I("minecraft:candle", 8)),
        ("Сено для скота", I("minecraft:hay_block", 8)),
    ])
    return q


def _era2b():
    return track(15, 4, "e2_k", [
        ("Городская кухня", I("minecraft:golden_carrot", 16)),
        ("Печёный картофель", I("minecraft:baked_potato", 64)),
        ("Мясные запасы", I("minecraft:cooked_beef|minecraft:cooked_porkchop", 64)),
        ("Мёд и сахар", [I("minecraft:honey_bottle", 8), I("minecraft:sugar", 32)]),
        ("Торты к праздникам", I("minecraft:cake", 2)),
    ], cross={0: ["e2_c13"]})


def _era3b():
    return track(15, 4, "e3_r", [
        ("Промышленные рельсы", I("minecraft:rail", 32)),
        ("Вагонетки", I("minecraft:minecart", 4)),
        ("Электрифицированный путь", I("minecraft:powered_rail", 8)),
        ("Транспортёры-хопперы", I("minecraft:hopper", 16)),
    ], cross={0: ["e3_p04"]})


def _era4b():
    q = []
    q += track(-15, -22, "e4_i", [
        ("Магическая индустрия", I("minecraft:glowstone_dust", 64)),
        ("Красный камень ритуалов", I("minecraft:redstone", 128)),
        ("Кварц порталов", I("minecraft:quartz", 64)),
        ("Аметист кристаллов", I("minecraft:amethyst_shard", 32)),
        ("Порох для алхимии", I("minecraft:gunpowder", 32)),
        ("Слизь компонентов", I("minecraft:slime_ball", 16)),
        ("Паучьи глаза", I("minecraft:spider_eye", 16)),
        ("Плод хоруса", I("minecraft:chorus_fruit", 32)),
    ], cross={0: ["e4_n02"]})
    q += track(-9, -22, "e4_z", [
        ("Зельеварение: основа", I("minecraft:nether_wart", 16)),
        ("Зелья лечения", I("minecraft:potion|minecraft:glass_bottle", 8)),
        ("Зелья силы", I("minecraft:blaze_powder", 16)),
        ("Слеза гаста", I("minecraft:ghast_tear", 4)),
        ("Лавовый крем", I("minecraft:magma_cream", 8)),
        ("Светящийся арбуз", I("minecraft:glistering_melon_slice", 8)),
        ("Мастерская зелий", B("minecraft:nether_wart", "building:hospital:3", 8)),
    ], cross={0: ["e4_bl01"]})
    return q


def _era5b():
    q = []
    q += track(15, 4, "e5_h", [
        ("Эндер-сундуки", I("minecraft:ender_chest", 2)),
        ("Шалкеры", I("minecraft:shulker_box", 8)),
        ("Хопперы сортировки", I("minecraft:hopper", 32)),
        ("Дропперы", I("minecraft:dropper", 16)),
        ("Диспенсеры", I("minecraft:dispenser", 8)),
        ("Наблюдатели", I("minecraft:observer", 8)),
        ("Поршневые приводы", I("minecraft:piston", 16)),
        ("Липкие поршни", I("minecraft:sticky_piston", 8)),
    ], cross={0: ["e5_x02"]})
    q += track(15, -12, "e5_r", [
        ("Редстоун-логистика", I("minecraft:redstone_block", 8)),
        ("Повторители", I("minecraft:repeater", 16)),
        ("Компараторы", I("minecraft:comparator", 16)),
        ("Датчики дня", I("minecraft:daylight_detector", 4)),
        ("Сигнальные лампы", I("minecraft:redstone_lamp", 8)),
        ("Автоматические ворота", B("minecraft:iron_door", "building:warehouse:5", 2)),
    ], cross={2: ["e5_h03"]})
    q += track(-15, -22, "e5_b", [
        ("Сеть и университет", B("minecraft:quartz", "building:university:4", 32)),
        ("Контуры и госпиталь", B("mekanism:basic_control_circuit", "building:hospital:4", 16)),
        ("Сплавы и библиотека", B("mekanism:alloy_atomic", "building:library:5", 8)),
        ("Энергия и школа", B("minecraft:redstone_block", "building:school:3", 8)),
        ("Ячейки и склад", B("minecraft:ender_chest", "building:warehouse:5", 2)),
        ("Шаблоны и механик", B("ae2:blank_pattern|minecraft:paper", "building:mech:4", 16)),
        ("Пространство и почта", B("minecraft:ender_pearl", "building:deliveryman:3", 32)),
    ], cross={0: ["e5_c05"]})
    return q


def _era6b():
    q = []
    q += track(-15, -22, "e6_s", [
        ("Камень Края", I("minecraft:end_stone", 64)),
        ("Пурпур", I("minecraft:purpur_block", 32)),
        ("Стержни Края", I("minecraft:end_rod", 16)),
        ("Панцири шалкеров", I("minecraft:shulker_shell", 8)),
        ("Кристаллы Края", I("minecraft:end_crystal", 4)),
        ("Элитры", I("minecraft:elytra|minecraft:firework_rocket", 1)),
        ("Фейерверки полёта", I("minecraft:firework_rocket", 32)),
    ], cross={0: ["e6_c02"]})
    q += track(-9, -22, "e6_n", [
        ("Незеритовый резерв", I("minecraft:netherite_ingot", 4)),
        ("Незеритовый блок", I("minecraft:netherite_block", 1)),
        ("Маяк города", I("minecraft:beacon", 2)),
        ("Тотемы бессмертия", I("minecraft:totem_of_undying", 2)),
        ("Черепа визера", I("minecraft:wither_skeleton_skull", 3)),
        ("Зачарованное золотое яблоко", I("minecraft:enchanted_golden_apple", 1)),
    ], cross={2: ["e6_f02"]})
    q += track(-3, -22, "e6_m", [
        ("Промышленный запас железа", I("minecraft:iron_ingot", 512)),
        ("Промышленное золото", I("minecraft:gold_ingot", 128)),
        ("Алмазный фонд", I("minecraft:diamond", 16)),
        ("Изумрудный фонд", I("minecraft:emerald", 16)),
        ("Лазуритовый фонд", I("minecraft:lapis_lazuli", 64)),
        ("Медный фонд", I("minecraft:copper_ingot", 256)),
    ], cross={0: ["e6_k01"]})
    q += track(3, -22, "e6_l", [
        ("Наследие ремесла", B("arcanopolis:reinforced_casing", "building:black:5", 32)),
        ("Наследие магии", B("botania:terrasteel_ingot", "building:library:5", 8)),
        ("Наследие индустрии", B("mekanism:ultimate_control_circuit", "building:mech:5", 16)),
        ("Наследие сети", B("minecraft:ender_pearl", "building:warehouse:5", 64)),
        ("Город Арканополиса", B("arcanopolis:arcane_converter", "citizens:60", 16)),
    ], cross={4: ["e6_f02"]})
    return q


def _prologue3():
    return track(23, 4, "p_g", [
        ("Скотный двор", B("minecraft:wheat", "building:farm:2", 64)),
        ("Пасека", I("minecraft:honeycomb", 8)),
        ("Фруктовый сад", I("minecraft:apple", 32)),
        ("Свёкла", I("minecraft:beetroot", 32)),
        ("Сахарный тростник", I("minecraft:sugar_cane", 32)),
        ("Угольный склад", I("minecraft:coal", 64)),
    ])


def _era4c():
    return track(-15, -34, "e4_g", [
        ("Ящик алхимии", B("minecraft:glass_bottle", "building:hospital:3", 32)),
        ("Склад зелья", I("minecraft:nether_wart", 32)),
        ("Алхимический портал", B("minecraft:quartz", "building:library:4", 32)),
    ], cross={0: ["e4_z07"]})


def _era5c():
    return track(-9, -34, "e5_g", [
        ("Око Края", I("minecraft:ender_eye", 8)),
        ("Кристаллы энергии", I("minecraft:end_crystal", 2)),
        ("Маяк района", I("minecraft:beacon", 1)),
        ("Портативные терминалы", B("minecraft:ender_chest", "building:mech:4", 4)),
    ], cross={0: ["e5_b07"]})


def _era6c():
    return track(9, -22, "e6_g", [
        ("Торговый квартал", B("minecraft:emerald", "building:warehouse:5", 32)),
        ("Академия наук", B("minecraft:book", "building:university:5", 64)),
        ("Больница мегаполиса", B("minecraft:golden_apple", "building:hospital:5", 4)),
        ("Промышленная академия", B("mekanism:alloy_atomic", "building:mech:5", 16)),
        ("Стража мегаполиса", B("minecraft:iron_sword", "building:guard:5", 8)),
        ("Портовые склады", B("minecraft:chest", "building:warehouse:5", 32)),
        ("Зелёный город", B("minecraft:oak_sapling", "building:farm:5", 64)),
        ("Архивы библиотеки", B("minecraft:book", "building:library:5", 128)),
        ("Финальный салют", B("minecraft:firework_rocket", "citizens:60", 64)),
    ], cross={8: ["e6_f05"]})


def STRUCT(sid):
    """Задача структуры: найти сооружение."""
    return ("struct", sid, 0)


# ---------------------------------------------------------------------------
# v0.5: пазлы автоматизации, торговля, охота, исследования, сокровищницы
# ---------------------------------------------------------------------------

def _v5_puzzles():
    out = {}
    out["10_epoch_wood_water"] = track(15, 4, "e1pz", [
        ("Линия пиления", [I("create:mechanical_saw", 2), I("create:belt_connector", 32), C("building:saw:2")]),
        ("Дробильный комплекс", [I("create:millstone", 2), I("minecraft:cobblestone", 512)]),
        ("Веерный цех", [I("create:encased_fan", 2), I("minecraft:iron_ingot", 64), C("building:black:2")]),
        ("Склад готовой продукции", [I("minecraft:chest", 16), C("building:warehouse:2")]),
    ])
    out["20_epoch_steam_logistics"] = track(15, -12, "e2pz", [
        ("Паровой каскад", [I("create:steam_engine", 2), I("minecraft:coal", 256)]),
        ("Конвейерный узел", [I("create:depot", 4), I("create:belt_connector", 32), C("building:warehouse:3")]),
        ("Автоматическая пекарня", [I("minecraft:bread", 256), C("building:cook:3")]),
        ("Механическая сборка", [I("create:mechanical_crafter", 8), I("create:precision_mechanism", 8)]),
    ])
    out["30_epoch_industry"] = track(15, -12, "e3pz", [
        ("Рамочный цех", [I("thermal:machine_frame", 4), C("building:mech:2")]),
        ("Линия обогащения", [I("mekanism:enrichment_chamber", 2), I("mekanism:basic_control_circuit", 32)]),
        ("Сталеплавильный двор", I("mekanism:ingot_steel", 256)),
        ("Энергетический контур", [I("mekanism:energy_tablet|minecraft:redstone_block", 4), C("building:mech:2")]),
    ])
    out["40_epoch_magic"] = track(15, -12, "e4pz", [
        ("Магическая фабрика", [I("ars_nouveau:source_gem", 256), C("building:library:4")]),
        ("Ритуальный конвейер", [I("arcanopolis:ritual_regulator", 3), C("building:mech:3")]),
        ("Алхимическое производство", [I("minecraft:glass_bottle", 256), C("building:hospital:3")]),
    ])
    out["50_epoch_network"] = track(-15, -34, "e5pz", [
        ("Сетевая фабрика", I("mekanism:ultimate_control_circuit", 64)),
        ("Автокрафт-кластер", [I("ae2:blank_pattern|minecraft:paper", 64), C("building:mech:4")]),
        ("Сортировочный хаб", [I("minecraft:hopper", 32), I("minecraft:ender_chest", 4), C("building:warehouse:5")]),
    ])
    out["60_epoch_cosmos"] = track(-15, -34, "e6pz", [
        ("Завод предела", [I("mekanism:alloy_atomic", 128), C("building:mech:5")]),
        ("Сердце производства", [I("arcanopolis:reinforced_casing", 64), I("arcanopolis:arcane_converter", 16)]),
    ])
    return out


def _v5_trade():
    """Повторяемые торговые квесты: поставки в колонию за изумруды и алмазы."""
    steps = [
        ("Поставка хлеба", IC("minecraft:bread", 64), ("item", "minecraft:emerald", 2)),
        ("Поставка древесины", IC("minecraft:oak_log", 256), ("item", "minecraft:emerald", 2)),
        ("Поставка камня", IC("minecraft:cobblestone", 256), ("item", "minecraft:emerald", 1)),
        ("Поставка железа", IC("minecraft:iron_ingot", 32), ("item", "minecraft:emerald", 3)),
        ("Поставка золота", IC("minecraft:gold_ingot", 16), ("item", "minecraft:emerald", 4)),
        ("Поставка алмазов", IC("minecraft:diamond", 4), ("item", "minecraft:emerald", 6)),
        ("Поставка стали", IC("mekanism:ingot_steel", 16), ("item", "minecraft:emerald", 5)),
        ("Поставка механизмов", IC("create:precision_mechanism", 4), ("item", "minecraft:diamond", 2)),
        ("Деликатесы для знати", IC("minecraft:golden_carrot", 16), ("item", "minecraft:diamond", 1)),
        ("Редкие реагенты", IC("botania:mana_pearl", 4), ("item", "minecraft:diamond", 3)),
    ]
    q = []
    y = -12.0
    for i, (title, task, rew) in enumerate(steps):
        spec = extra_quest(f"s_tr{i+1:02d}", title, 12, y - 1.7 * i, task,
                           deps=["s_su06"] if i else ["s_su05"],
                           desc=["Регулярные поставки в колонию.",
                                 "Квест ПОВТОРЯЕМЫЙ: выполняйте снова и снова.",
                                 "Предметы потребляются при сдаче."])
        spec["repeatable"] = True
        spec["rewards"] = [rew, ("xp", 100)]
        q.append(spec)
    return q


def _v5_hunt():
    q = track(12, -10, "s_hu", [
        ("Очистить окрестности", K("minecraft:zombie", 16)),
        ("Костяная угроза", K("minecraft:skeleton", 16)),
        ("Паучья напасть", K("minecraft:spider", 8)),
        ("Криперская опасность", K("minecraft:creeper", 8)),
        ("Огненные твари", K("minecraft:blaze", 8)),
        ("Охота на эндерменов", K("minecraft:enderman", 6)),
        ("Стражи крепости", K("minecraft:wither_skeleton", 6)),
    ], cross={4: ["s_ex03"]})
    q += track(-6, -10, "s_rd", [
        ("Рейдеры у стен", K("minecraft:pillager", 10)),
        ("Палачи рейдов", K("minecraft:vindicator", 4)),
        ("Захватчики отступили", K("minecraft:ravager", 2)),
    ])
    return q


def _v5_explore():
    q = track(6, -10, "s_dx", [
        ("Портал в Нижний мир", DIM("minecraft:the_nether")),
        ("Алмазная лихорадка", ADV("minecraft:story/mine_diamond")),
        ("Око Эндера", ADV("minecraft:story/enter_the_nether")),
        ("Край света", DIM("minecraft:the_end")),
    ])
    q += track(0, -10, "s_st", [
        ("Оплот древних", STRUCT("minecraft:stronghold")),
        ("Оплот свинолюдей", STRUCT("minecraft:bastion_remnant")),
        ("Город Края", STRUCT("minecraft:end_city")),
        ("Древний город", STRUCT("minecraft:ancient_city")),
    ])
    q += track(-12, -22, "s_ww", [
        ("Дальний путь", ST("minecraft:walk_one_cm", 500000)),
    ])
    return q


def _v5_secrets():
    q = []
    q.append(extra_quest("s_sec1", "???", 18, -22,
                         ADV("minecraft:adventure/hero_of_the_village"),
                         deps=["s_rd03"],
                         desc=["Ходят слухи, что герой, спасший деревню",
                               "от нашествия рейдеров, получает дар..."]))
    q[-1]["optional"] = True
    q.append(extra_quest("s_sec2", "???", -18, -22,
                         ADV("minecraft:end/kill_dragon"),
                         deps=["s_dx04"],
                         desc=["Древние хроники говорят о змееподобном",
                               "твари, чья смерть откроет тайну Края..."]))
    q[-1]["optional"] = True
    return q


def _v5_treasure():
    """Сокровищницы эпох: лут-награды (vanilla /loot) + опыт на вехах."""
    loot_tables = [
        "minecraft:chests/simple_dungeon",
        "minecraft:chests/abandoned_mineshaft",
        "minecraft:chests/desert_pyramid",
        "minecraft:chests/buried_treasure",
    ]
    specs = [
        ("00_prologue", "p_tr", "Сокровищница пролога", "charter", 0),
        ("10_epoch_wood_water", "e1_tr", "Сокровищница эпохи I", "project", 0),
        ("20_epoch_steam_logistics", "e2_tr", "Сокровищница эпохи II", "project", 1),
        ("30_epoch_industry", "e3_tr", "Сокровищница эпохи III", "passport", 2),
        ("40_epoch_magic", "e4_tr", "Сокровищница эпохи IV", "lab", 3),
        ("50_epoch_network", "e5_tr", "Сокровищница эпохи V", "project", 0),
        ("60_epoch_cosmos", "e6_tr", "Сокровищница эпохи VI", "finale", 1),
    ]
    out = {k: [] for k in ["00_prologue", "10_epoch_wood_water", "20_epoch_steam_logistics",
                           "30_epoch_industry", "40_epoch_magic", "50_epoch_network", "60_epoch_cosmos"]}
    for file, key, title, dep, li in specs:
        spec = extra_quest(key, title, -20, -12, C("always"), deps=[dep],
                           desc=["Веха эпохи пройдена — заберите награду:",
                                 "сундук с сокровищами и опыт мастера."])
        spec["rewards"] = [
            ("cmd", f"/loot give @p loot {loot_tables[li]}"),
            ("xp", 500),
            ("item", "minecraft:emerald", 8),
        ]
        out[file].append(spec)
    return out

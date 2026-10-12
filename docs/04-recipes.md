# Кастомные рецепты: дизайн и реализация

Все рецепты реализованы на KubeJS (`kubejs/server_scripts/`). Каждый файл скриптов привязан к эпохе. Принципы:

1. **Дорогой рецепт = сложная организация**, а не куча одинаковых слитков.
2. **Переходные крафты расходуют эпохальную печать** — без квеста их не сделать.
3. **Bulk-компоненты** требуют материалы своей эпохи (естественная блокировка).
4. **Стройматериалы MineColonies не трогаем.**

## Кастомные предметы (`arcanopolis:`)

| ID | Название | Тип | Источник |
|---|---|---|---|
| `city_charter` | Городская хартия | ключ | награда квеста |
| `seal_craftsmen` | Печать ремесленников | ключ | награда квеста |
| `seal_steam` | Печать пара | ключ | награда квеста |
| `technical_passport` | Технический паспорт | ключ | 🗝 крафт (расходует `seal_steam`) |
| `seal_arcana` | Печать расцвета | ключ | награда квеста (за арканную лабораторию) |
| `seal_network` | Печать сети | ключ | награда квеста (за AE2-проект) |
| `reinforced_casing` | Усиленный корпус | компонент | крафт (эпоха III) |
| `arcane_converter` | Арканный преобразователь | компонент | крафт (эпоха IV) |
| `ritual_regulator` | Ритуальный регулятор | компонент | крафт (эпоха IV) |
| `automation_core` | Ядро автоматизации | компонент | 🗝 крафт (расходует `seal_arcana`) |
| `primal_catalyst` | Изначальный катализатор | компонент | крафт (эпоха VI) |
| `heart_of_arcanopolis` | Сердце Арканополиса | артефакт | 🗝 механическая сборка (расходует `seal_network`) |

## Рецепты по эпохам

### Эпоха III — промышленные компоненты

**Усиленный корпус** (`reinforced_casing`) — сталь, латунь Create, машинная рама Thermal:
```
S B S        S = #forge:ingots/steel   (Mekanism/Thermal)
B M B   →    B = create:brass_casing
S B S        M = thermal:machine_frame
```

**Технический паспорт** (`technical_passport`) — контрольный крафт допуска к эпохе IV (расходует Печать пара):
```
S B S        S = #forge:ingots/steel
G P G   →    G = thermal:iron_gear, P = arcanopolis:seal_steam (расходуется!)
B T B        B = create:brass_ingot, T = minecraft:book
```

### Эпоха IV — мосты «техника + магия»

**Арканный преобразователь** (`arcane_converter`):
```
A R A        A = ars_nouveau:source_gem, R = botania:mana_pearl
C M C   →    C = arcanopolis:reinforced_casing
A R A        M = create:precision_mechanism
```

**Ритуальный регулятор** (`ritual_regulator`) — промышленность + Eidolon + Blood Magic:
```
E S E        E = eidolon:pewter_ingot  (сверить ID в JEI)
M C M   →    M = mekanism:basic_control_circuit
E S E        S = bloodmagic:blankslate, C = arcanopolis:reinforced_casing
```

### Эпоха V — управляющий слой

**Ядро автоматизации** (`automation_core`) — расширенный крафт, расходует Печать расцвета:
```
L F L        L = ae2:logic_processor
C A C   →    F = ae2:fluix_crystal, A = arcanopolis:arcane_converter
X P X        P = arcanopolis:seal_arcana (расходуется!), X = arcanopolis:ritual_regulator
```

### Эпоха VI — эндгейм

**Изначальный катализатор** (`primal_catalyst`) — сборка на верстаке механизмов (`create:mechanical_crafting`):
```
G T G        G = eidolon:arcane_gold_ingot  (сверить ID в JEI)
E M E   →    E = thermal:enderium_ingot, T = botania:terrasteel_ingot
G T G        M = mekanism:alloy_atomic
```

**Сердце Арканополиса** (`heart_of_arcanopolis`) — финальная механическая сборка:
```
V U V        V = arcanopolis:automation_core, U = mekanism:ultimate_control_circuit
L S L   →    L = ae2:engineering_processor, S = arcanopolis:seal_network (расходуется!)
R K R        R = arcanopolis:ritual_regulator, K = arcanopolis:primal_catalyst
```

## Блокировка обходных путей

- `kubejs/server_scripts/80_removals.js` — точечное отключение рецептов, обходящих прогрессию (сейчас — заготовка с примерами).
- `kubejs/client_scripts/jei_hide.js` — скрытие отключённых рецептов/предметов из JEI.
- Перед публикацией проверьте в JEI каждый кастомный рецепт и убедитесь, что «старый» путь к предмету не даёт обхода (например, дублирующий рецепт из другого мода).

## Сверка идентификаторов

Это балансировочные концепты, зафиксированные в скриптах. Перед релизом обязательно сверьте ID по JEI/дампу предметов (`/kubejs dump`):

| Группа | Статус |
|---|---|
| create:*, mekanism:*, ae2:*, thermal:machine_frame, thermal:*, botania:*, ars_nouveau:source_gem, bloodmagic:blankslate | высокая уверенность |
| `eidolon:pewter_ingot`, `eidolon:arcane_gold_ingot` | **сверить в JEI** — возможны отличия в ID у Repraised |
| Теги `forge:ingots/steel` | работают при наличии Mekanism/Thermal; проверить унификацию через Almost Unified |

Если ID отличается — правьте соответствующий файл в `kubejs/server_scripts/` и `kubejs/startup_scripts/10_items.js` (для своих предметов).

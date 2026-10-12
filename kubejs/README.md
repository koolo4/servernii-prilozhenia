# KubeJS-скрипты «Арканополиса»

Структура:

```
kubejs/
├── startup_scripts/
│   └── 10_items.js          — регистрация 12 предметов arcanopolis:
├── server_scripts/
│   ├── 00_tags.js           — теги (seals, forge:ingots/steel)
│   ├── 20_epoch1_wood_water.js — интеграция Create × Ars Nouveau
│   ├── 30_epoch2_steam.js   — точка расширения эпохи пара
│   ├── 40_epoch3_industry.js— усиленный корпус, технический паспорт
│   ├── 50_epoch4_magic.js   — арканный преобразователь, ритуальный регулятор
│   ├── 60_epoch5_network.js — ядро автоматизации
│   ├── 70_epoch6_endgame.js — изначальный катализатор, Сердце Арканополиса
│   └── 80_removals.js       — отключение обходных рецептов
├── client_scripts/
│   └── jei_hide.js          — скрытие в JEI + подсказки предметов
└── assets/arcanopolis/textures/item/ — текстуры предметов (16×16)
```

## Правила редактирования

1. **Проверяйте ID** через JEI или `/kubejs dump`. Особенно `eidolon:*` (см. `docs/04-recipes.md`).
2. После правок перезапустите мир и выполните `/kubejs errors` — там видны все ошибки скриптов.
3. Имена файлов с числовыми префиксами задают порядок загрузки — сохраняйте их.
4. Каждый рецепт имеет `.id('arcanopolis:...')` — не убирайте id, иначе сломаются обновления.
5. Кастомные предметы регистрируются при старте (`startup_scripts`): изменение ID требует пересоздания мира или миграции.

## Как добавить рецепт эпохи

```js
ServerEvents.recipes((event) => {
  event.shaped('modid:item', ['AB', 'BA'], { A: 'minecraft:iron_ingot', B: 'create:cogwheel' })
    .id('arcanopolis:my_recipe')
})
```

Механическая сборка Create:

```js
event.custom({
  type: 'create:mechanical_crafting',
  pattern: ['A', 'B'],
  key: { A: { item: 'minecraft:iron_ingot' }, B: { item: 'create:precision_mechanism' } },
  result: { item: 'modid:item' }
}).id('arcanopolis:mechanical_crafting/my_item')
```

## Баланс

Не усложняйте рецепты обязательных материалов колонии и базовых машин Create/Thermal/Mekanism. Кастомные крафты — для предметов прогрессии, мостов «магия × техника» и эндгейма.

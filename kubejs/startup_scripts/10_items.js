// ============================================================
// Арканополис: Хартия нового мира
// Кастомные предметы прогрессии (пространство имён arcanopolis)
// Текстуры: kubejs/assets/arcanopolis/textures/item/*.png
// ============================================================

StartupEvents.registry('item', (event) => {
  // --- Ключевые предметы (награды квестов, расходуются в переходных крафтах) ---

  event.create('arcanopolis:city_charter')
    .displayName('Городская хартия')
    .maxStackSize(1)

  event.create('arcanopolis:seal_craftsmen')
    .displayName('Печать ремесленников')
    .maxStackSize(1)
    .glow(true)

  event.create('arcanopolis:seal_steam')
    .displayName('Печать пара')
    .maxStackSize(1)
    .glow(true)

  event.create('arcanopolis:seal_arcana')
    .displayName('Печать расцвета')
    .maxStackSize(1)
    .glow(true)

  event.create('arcanopolis:seal_network')
    .displayName('Печать сети')
    .maxStackSize(1)
    .glow(true)

  // --- Контрольный крафт эпохи III ---

  event.create('arcanopolis:technical_passport')
    .displayName('Технический паспорт')
    .maxStackSize(1)

  // --- Компоненты (bulk-рецепты поздних эпох) ---

  event.create('arcanopolis:reinforced_casing')
    .displayName('Усиленный корпус')
    .maxStackSize(64)

  event.create('arcanopolis:arcane_converter')
    .displayName('Арканный преобразователь')
    .maxStackSize(16)

  event.create('arcanopolis:ritual_regulator')
    .displayName('Ритуальный регулятор')
    .maxStackSize(16)

  event.create('arcanopolis:automation_core')
    .displayName('Ядро автоматизации')
    .maxStackSize(1)

  event.create('arcanopolis:primal_catalyst')
    .displayName('Изначальный катализатор')
    .maxStackSize(1)
    .glow(true)

  // --- Финальный артефакт ---

  event.create('arcanopolis:heart_of_arcanopolis')
    .displayName('Сердце Арканополиса')
    .maxStackSize(1)
    .glow(true)
})

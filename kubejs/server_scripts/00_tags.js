// ============================================================
// Теги предметов сборки
// ============================================================

ServerEvents.tags('item', (event) => {
  // Группа ключевых предметов — удобно для рецептов и поиска
  event.add('arcanopolis:seals', [
    'arcanopolis:city_charter',
    'arcanopolis:seal_craftsmen',
    'arcanopolis:seal_steam',
    'arcanopolis:seal_arcana',
    'arcanopolis:seal_network'
  ])

  // Унификация стали: Mekanism и Thermal оба дают steel.
  // Основной слиток — mekanism:ingot_steel (Almost Unified при желании доведёт до конца).
  event.add('forge:ingots/steel', 'mekanism:ingot_steel')
  event.add('forge:ingots/steel', 'thermal:steel_ingot')
})

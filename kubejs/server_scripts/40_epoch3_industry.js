// ============================================================
// Эпоха III. «Механизмы и индустриальный город»
// Промышленные компоненты и контрольный крафт допуска в эпоху IV.
// ============================================================

ServerEvents.recipes((event) => {
  // --- Усиленный корпус -------------------------------------------------
  // Сталь Mekanism/Thermal + латунные корпуса Create + машинная рама Thermal.
  // Bulk-компонент: не требует печати, требует материалов своей эпохи.
  //
  //   S B S        S = #forge:ingots/steel
  //   B M B        B = create:brass_casing
  //   S B S        M = thermal:machine_frame
  event.shaped('arcanopolis:reinforced_casing', [
    'SBS',
    'BMB',
    'SBS'
  ], {
    S: '#forge:ingots/steel',
    B: 'create:brass_casing',
    M: 'thermal:machine_frame'
  }).id('arcanopolis:reinforced_casing')

  // --- Технический паспорт ---------------------------------------------
  // Контрольный крафт эпохи III. РАСХОДУЕТ Печать пара (награда квеста II→III):
  // без прохождения квестовой цепочки крафт недоступен.
  //
  //   S B S        S = #forge:ingots/steel
  //   G P G        G = thermal:iron_gear, P = arcanopolis:seal_steam (расходуется)
  //   B T B        B = create:brass_ingot, T = minecraft:book
  event.shaped('arcanopolis:technical_passport', [
    'SBS',
    'GPG',
    'BTB'
  ], {
    S: '#forge:ingots/steel',
    B: 'create:brass_ingot',
    G: 'thermal:iron_gear',
    P: 'arcanopolis:seal_steam',
    T: 'minecraft:book'
  }).id('arcanopolis:technical_passport')
})

// ============================================================
// Эпоха V. «Сеть и автоматизированное производство»
// Ядро автоматизации — управляющий компонент AE2-производства.
// ============================================================

ServerEvents.recipes((event) => {
  // --- Ядро автоматизации ----------------------------------------------
  // Процессоры AE2 + флюикс + арканный преобразователь + ритуальный регулятор.
  // РАСХОДУЕТ Печать расцвета (награда за арканную лабораторию, эпоха IV):
  // без магической главы сеть AE2 не собрать.
  //
  //   L F L        L = ae2:logic_processor, F = ae2:fluix_crystal
  //   C A C        C = arcanopolis:reinforced_casing, A = arcanopolis:arcane_converter
  //   X P X        X = arcanopolis:ritual_regulator, P = arcanopolis:seal_arcana (расходуется)
  event.shaped('arcanopolis:automation_core', [
    'LFL',
    'CAC',
    'XPX'
  ], {
    L: 'ae2:logic_processor',
    F: 'ae2:fluix_crystal',
    C: 'arcanopolis:reinforced_casing',
    A: 'arcanopolis:arcane_converter',
    X: 'arcanopolis:ritual_regulator',
    P: 'arcanopolis:seal_arcana'
  }).id('arcanopolis:automation_core')
})

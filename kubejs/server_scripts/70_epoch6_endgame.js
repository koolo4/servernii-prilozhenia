// ============================================================
// Эпоха VI. «Космический горизонт» — эндгейм
// Изначальный катализатор и Сердце Арканополиса.
// Механическая сборка (create:mechanical_crafting) — верстак механизмов Create.
// ============================================================

ServerEvents.recipes((event) => {
  // --- Изначальный катализатор -----------------------------------------
  // Редкий энергетический реагент: алхимия Eidolon + термальный эндерий +
  // террасталь Botania + атомарный сплав Mekanism.
  //
  //   G T G        G = eidolon:arcane_gold_ingot  (сверить ID в JEI!)
  //   E M E        E = thermal:enderium_ingot, T = botania:terrasteel_ingot
  //   G T G        M = mekanism:alloy_atomic
  event.custom({
    type: 'create:mechanical_crafting',
    pattern: [
      'GTG',
      'EME',
      'GTG'
    ],
    key: {
      G: { item: 'eidolon:arcane_gold_ingot' },
      T: { item: 'botania:terrasteel_ingot' },
      E: { item: 'thermal:enderium_ingot' },
      M: { item: 'mekanism:alloy_atomic' }
    },
    result: { item: 'arcanopolis:primal_catalyst' }
  }).id('arcanopolis:mechanical_crafting/primal_catalyst')

  // --- Сердце Арканополиса ---------------------------------------------
  // Финальная механическая сборка. РАСХОДУЕТ Печать сети (допуск эпохи VI).
  //
  //   V U V        V = arcanopolis:automation_core, U = mekanism:ultimate_control_circuit
  //   L S L        L = ae2:engineering_processor, S = arcanopolis:seal_network (расходуется)
  //   R K R        R = arcanopolis:ritual_regulator, K = arcanopolis:primal_catalyst
  event.custom({
    type: 'create:mechanical_crafting',
    pattern: [
      'VUV',
      'LSL',
      'RKR'
    ],
    key: {
      V: { item: 'arcanopolis:automation_core' },
      U: { item: 'mekanism:ultimate_control_circuit' },
      L: { item: 'ae2:engineering_processor' },
      S: { item: 'arcanopolis:seal_network' },
      R: { item: 'arcanopolis:ritual_regulator' },
      K: { item: 'arcanopolis:primal_catalyst' }
    },
    result: { item: 'arcanopolis:heart_of_arcanopolis' }
  }).id('arcanopolis:mechanical_crafting/heart_of_arcanopolis')
})

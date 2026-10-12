// ============================================================
// Эпоха IV. «Расцвет магии»
// Мосты «техника + магия». ID Eidolon сверить в JEI (docs/04-recipes.md).
// ============================================================

ServerEvents.recipes((event) => {
  // --- Арканный преобразователь ----------------------------------------
  // Источник Ars Nouveau + мана Botania + точная механика Create + корпус.
  //
  //   A R A        A = ars_nouveau:source_gem
  //   C M C        C = arcanopolis:reinforced_casing
  //   A R A        R = botania:mana_pearl, M = create:precision_mechanism
  event.shaped('arcanopolis:arcane_converter', [
    'ARA',
    'CMC',
    'ARA'
  ], {
    A: 'ars_nouveau:source_gem',
    R: 'botania:mana_pearl',
    C: 'arcanopolis:reinforced_casing',
    M: 'create:precision_mechanism'
  }).id('arcanopolis:arcane_converter')

  // --- Ритуальный регулятор --------------------------------------------
  // Промышленная деталь Mekanism + алхимия Eidolon + прогрессия Blood Magic.
  //
  //   E S E        E = eidolon:pewter_ingot   (сверить ID в JEI!)
  //   M C M        M = mekanism:basic_control_circuit
  //   E S E        S = bloodmagic:blankslate, C = arcanopolis:reinforced_casing
  event.shaped('arcanopolis:ritual_regulator', [
    'ESE',
    'MCM',
    'ESE'
  ], {
    E: 'eidolon:pewter_ingot',
    S: 'bloodmagic:blankslate',
    M: 'mekanism:basic_control_circuit',
    C: 'arcanopolis:reinforced_casing'
  }).id('arcanopolis:ritual_regulator')
})

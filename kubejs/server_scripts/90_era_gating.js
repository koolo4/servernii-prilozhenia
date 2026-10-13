// 90_era_gating.js — гейтинг механизмов по эпохам + восстановление печатей
// Принцип: механизм эпохи N+1 требует ключевой компонент эпохи N.
// Эпоха I/II  -> create:precision_mechanism (точная механика, эпоха II)
// Эпоха III   -> mekanism:basic_control_circuit (промышленные контуры)
// Эпоха V+    -> arcanopolis:arcane_converter (арканные технологии, эпоха IV)
// Печати расходуются в переходных крафтах (см. 30-70 скрипты) — здесь
// добавлены дорогие рецепты восстановления, чтобы не было потери навсегда.

onEvent('recipes', event => {
  // ---------------------------------------------------------- ЭПОХА III ---
  // Thermal: рама машин — сердце линии Thermal. Нужна точная механика (II).
  event.remove({ output: 'thermal:machine_frame' })
  event.shaped('thermal:machine_frame', [
    'igi',
    'gpg',
    'igi'
  ], {
    i: 'minecraft:iron_ingot',
    g: 'thermal:iron_gear',
    p: 'create:precision_mechanism'
  }).id('arcanopolis:gating/machine_frame')

  // Mekanism: базовый контур управления — открывает всю ветку Mekanism.
  event.remove({ output: 'mekanism:basic_control_circuit' })
  event.shaped('mekanism:basic_control_circuit 2', [
    'isi',
    'sps',
    'isi'
  ], {
    i: 'mekanism:ingot_steel',
    s: 'minecraft:redstone',
    p: 'create:precision_mechanism'
  }).id('arcanopolis:gating/basic_control_circuit')

  // ----------------------------------------------------------- ЭПОХА V ---
  // Высший контур управления — только после арканного преобразователя (IV).
  event.remove({ output: 'mekanism:ultimate_control_circuit' })
  event.shaped('mekanism:ultimate_control_circuit 2', [
    'ccc',
    'cac',
    'ccc'
  ], {
    c: 'mekanism:basic_control_circuit',
    a: 'arcanopolis:arcane_converter'
  }).id('arcanopolis:gating/ultimate_control_circuit')

  // --------------------------------------- ВОССТАНОВЛЕНИЕ ПЕЧАТЕЙ ---------
  // Печати расходуются в переходных крафтах (Паспорт, Ядро, Сердце).
  // Цепочка восстановления: ремесленники -> пар -> аркана -> сеть.

  event.shaped('arcanopolis:seal_craftsmen', [
    'geg',
    'eEe',
    'geg'
  ], {
    g: 'minecraft:gold_ingot',
    e: 'minecraft:emerald',
    E: 'minecraft:emerald_block'
  }).id('arcanopolis:gating/seal_craftsmen')

  event.shaped('arcanopolis:seal_steam', [
    'bpb',
    'pSp',
    'bpb'
  ], {
    b: 'create:brass_ingot',
    p: 'create:precision_mechanism',
    S: 'arcanopolis:seal_craftsmen'
  }).id('arcanopolis:gating/seal_steam')

  event.shaped('arcanopolis:seal_arcana', [
    'sss',
    'mSm',
    'sss'
  ], {
    s: 'ars_nouveau:source_gem',
    m: 'botania:mana_pearl',
    S: 'arcanopolis:seal_steam'
  }).id('arcanopolis:gating/seal_arcana')

  event.shaped('arcanopolis:seal_network', [
    'ccc',
    'eSe',
    'ccc'
  ], {
    c: 'mekanism:basic_control_circuit',
    e: 'minecraft:ender_pearl',
    S: 'arcanopolis:seal_arcana'
  }).id('arcanopolis:gating/seal_network')
})

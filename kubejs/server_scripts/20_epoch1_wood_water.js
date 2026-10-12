// ============================================================
// Эпоха I. «Дерево, вода и ремесло»
// Интеграционные рецепты раннего этапа.
// Здесь НЕ переписываются рецепты MineColonies и базовый Create.
// ============================================================

ServerEvents.recipes((event) => {
  // Create: дробление исходного камня Ars Nouveau → самоцветы источника.
  // Дробилка/жернова Create позволяют автоматизировать производство
  // источника уже в эпохе I — магия входит в сборку как производство.
  event.custom({
    type: 'create:crushing',
    ingredients: [{ item: 'ars_nouveau:sourcestone' }],
    processingTime: 200,
    results: [
      { item: 'ars_nouveau:source_gem', count: 1 },
      { item: 'ars_nouveau:source_gem', chance: 0.25, count: 1 }
    ]
  }).id('arcanopolis:crushing/sourcestone')

  // Точка расширения: добавляйте сюда рецепты, которые развивают идею
  // «магия = производство» (например, переработку реагентов Ars Nouveau
  // механизмами Create). ID предметов сверяйте через JEI.
})

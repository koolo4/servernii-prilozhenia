// ============================================================
// Клиент: скрытие отключённых рецептов/предметов из JEI.
// Дополняйте списками из 80_removals.js, чтобы игрок не видел мёртвых путей.
// ============================================================

JEIEvents.hide((event) => {
  // Пример: скрыть предмет, если его рецепты полностью отключены
  // event.hide('modid:disabled_item')

  // Пример: скрыть категорию рецептов целиком
  // event.hideCategory('modid:recipe_category')
})

// --- Подсказки предметов прогрессии ------------------------------------
ItemEvents.tooltip((tooltip) => {
  tooltip.add('arcanopolis:city_charter', 'Ключевой предмет пролога: право на основание колонии.')
  tooltip.add('arcanopolis:seal_craftsmen', 'Допуск к эпохе II: «Пар и логистика»')
  tooltip.add('arcanopolis:seal_steam', 'Допуск к эпохе III: «Механизмы и индустриальный город»')
  tooltip.add('arcanopolis:seal_steam', 'Расходуется при крафте Технического паспорта.')
  tooltip.add('arcanopolis:technical_passport', 'Городской контрольный документ эпохи III.')
  tooltip.add('arcanopolis:technical_passport', 'Даёт право перехода к эпохе магии.')
  tooltip.add('arcanopolis:seal_arcana', 'Допуск к эпохе V: «Сеть и автоматизация»')
  tooltip.add('arcanopolis:seal_arcana', 'Расходуется при крафте Ядра автоматизации.')
  tooltip.add('arcanopolis:seal_network', 'Допуск к эпохе VI: «Космический горизонт»')
  tooltip.add('arcanopolis:seal_network', 'Расходуется при сборке Сердца Арканополиса.')
  tooltip.add('arcanopolis:reinforced_casing', 'Сталь, латунь Create и машинная рама Thermal.')
  tooltip.add('arcanopolis:arcane_converter', 'Мост между техникой и магией источника.')
  tooltip.add('arcanopolis:ritual_regulator', 'Мост между промышленностью и ритуалами.')
  tooltip.add('arcanopolis:automation_core', 'Управляющий компонент автоматизированного производства.')
  tooltip.add('arcanopolis:primal_catalyst', 'Редкий энергетический реагент эндгейма.')
  tooltip.add('arcanopolis:heart_of_arcanopolis', 'Финальный городской артефакт Арканополиса.')
  tooltip.add('arcanopolis:heart_of_arcanopolis', 'Собирается на верстаке механизмов Create.')
})

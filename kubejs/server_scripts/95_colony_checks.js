// 95_colony_checks.js — СГЕНЕРИРОВАНО tools/gen_quests.py, НЕ редактировать вручную!
// Граф зависимостей эпохи: строка условия несёт deps — id задач квестов,
// от которых зависит её квест. Строка срабатывает только когда выполнены
// все deps (фронт графа вместо линейной цепочки). Независимые квесты
// (ключи глав с суффиксом #free) зависимостей не имеют.
// Условия MineColonies и наличие предметов проверяются сервером раз в секунду.

console.info('[Arcanopolis] 95_colony_checks: проверка условий колонии активна (граф)')

const CHAPTER_CHAINS = {
  "main": [
    {"task": "0A11010200000001", "kind": "skip", "q": "start", "f": "00_prologue", "deps": []},
    {"task": "0A11010200000002", "kind": "townhall", "n": 1, "q": "town_hall", "f": "00_prologue", "deps": []},
    {"task": "0A11010200000003", "kind": "building", "word": "builder", "n": 1, "q": "orders", "f": "00_prologue", "deps": ["0A11010200000002"]},
    {"task": "0A11010200000004", "kind": "building", "word": "builder", "n": 2, "q": "builder", "f": "00_prologue", "deps": ["0A11010200000003"]},
    {"task": "0A11010200000005", "kind": "building", "word": "residence", "n": 1, "q": "home", "f": "00_prologue", "deps": ["0A11010200000004"]},
    {"task": "0A11010200000006", "kind": "item_any", "items": "minecraft:bread", "n": 16, "q": "food", "f": "00_prologue", "deps": []},
    {"task": "0A11010200000007", "kind": "citizens", "n": 3, "q": "workers", "f": "00_prologue", "deps": ["0A11010200000002"]},
    {"task": "0A11010200000009", "kind": "citizens", "n": 5, "q": "charter", "f": "00_prologue", "deps": ["0A11010200000002", "0A11010200000004", "0A11010200000005", "0A11010200000006", "0A11010200000007", "0A1101020000000A", "0A1101020000000B", "0A11010200000015", "0A1101020000001F", "0A11010200000028", "0A11010200000031", "0A11010200000032", "0A1101020000003B", "0A11010200000042", "0A11010200000048", "0A1101020000004F"]},
    {"task": "0A1101020000000A", "kind": "item_any", "items": "minecraft:oak_log", "n": 64, "q": "timber", "f": "00_prologue", "deps": ["0A11010200000006"]},
    {"task": "0A1101020000000B", "kind": "item_any", "items": "minecraft:cobblestone", "n": 256, "q": "stone_reserve", "f": "00_prologue", "deps": ["0A11010200000006"]},
    {"task": "0A1101020000000C", "kind": "building", "word": "cook", "n": 1, "q": "p_b01", "f": "00_prologue", "deps": ["0A11010200000006"]},
    {"task": "0A1101020000000D", "kind": "building", "word": "farm", "n": 1, "q": "p_b02", "f": "00_prologue", "deps": ["0A1101020000000C"]},
    {"task": "0A1101020000000E", "kind": "building", "word": "fish", "n": 1, "q": "p_b03", "f": "00_prologue", "deps": ["0A1101020000000D"]},
    {"task": "0A1101020000000F", "kind": "building", "word": "residence", "n": 2, "q": "p_b04", "f": "00_prologue", "deps": ["0A1101020000000E"]},
    {"task": "0A11010200000010", "kind": "citizens", "n": 4, "q": "p_b05", "f": "00_prologue", "deps": ["0A1101020000000F"]},
    {"task": "0A11010200000011", "kind": "citizens", "n": 6, "q": "p_b06", "f": "00_prologue", "deps": ["0A11010200000010"]},
    {"task": "0A11010200000012", "kind": "citizens", "n": 8, "q": "p_b07", "f": "00_prologue", "deps": ["0A11010200000011"]},
    {"task": "0A11010200000013", "kind": "building", "word": "guard", "n": 1, "q": "p_b08", "f": "00_prologue", "deps": ["0A11010200000012"]},
    {"task": "0A11010200000014", "kind": "building", "word": "black", "n": 1, "q": "p_b09", "f": "00_prologue", "deps": ["0A11010200000013"]},
    {"task": "0A11010200000015", "kind": "building", "word": "stone", "n": 1, "q": "p_b10", "f": "00_prologue", "deps": ["0A11010200000014"]},
    {"task": "0A11010200000016", "kind": "item_any", "items": "minecraft:oak_log", "n": 64, "q": "p_s01", "f": "00_prologue", "deps": []},
    {"task": "0A11010200000017", "kind": "item_any", "items": "minecraft:oak_planks", "n": 128, "q": "p_s02", "f": "00_prologue", "deps": ["0A11010200000016"]},
    {"task": "0A11010200000018", "kind": "item_any", "items": "minecraft:cobblestone", "n": 256, "q": "p_s03", "f": "00_prologue", "deps": ["0A11010200000017"]},
    {"task": "0A11010200000019", "kind": "item_any", "items": "minecraft:charcoal", "n": 32, "q": "p_s04", "f": "00_prologue", "deps": ["0A11010200000018"]},
    {"task": "0A1101020000001A", "kind": "item_any", "items": "minecraft:furnace", "n": 2, "q": "p_s05", "f": "00_prologue", "deps": ["0A11010200000019"]},
    {"task": "0A1101020000001B", "kind": "item_any", "items": "minecraft:torch", "n": 32, "q": "p_s06", "f": "00_prologue", "deps": ["0A1101020000001A"]},
    {"task": "0A1101020000001C", "kind": "item_any", "items": "minecraft:chest", "n": 8, "q": "p_s07", "f": "00_prologue", "deps": ["0A1101020000001B"]},
    {"task": "0A1101020000001D", "kind": "item_any", "items": "minecraft:glass", "n": 32, "q": "p_s08", "f": "00_prologue", "deps": ["0A1101020000001C"]},
    {"task": "0A1101020000001E", "kind": "item_any", "items": "minecraft:iron_ingot", "n": 16, "q": "p_s09", "f": "00_prologue", "deps": ["0A1101020000001D"]},
    {"task": "0A1101020000001F", "kind": "item_any", "items": "minecraft:wheat", "n": 32, "q": "p_s10", "f": "00_prologue", "deps": ["0A1101020000001E"]},
    {"task": "0A11010200000020", "kind": "item_any", "items": "minecraft:stone_pickaxe", "n": 2, "q": "p_t01", "f": "00_prologue", "deps": ["0A11010200000003", "0A11010200000018"]},
    {"task": "0A11010200000021", "kind": "building", "word": "builder", "n": 1, "q": "p_t01", "f": "00_prologue", "deps": ["0A11010200000003", "0A11010200000018"]},
    {"task": "0A11010200000022", "kind": "item_any", "items": "minecraft:stone_axe", "n": 2, "q": "p_t02", "f": "00_prologue", "deps": ["0A11010200000020", "0A11010200000021"]},
    {"task": "0A11010200000023", "kind": "item_any", "items": "minecraft:iron_pickaxe", "n": 2, "q": "p_t03", "f": "00_prologue", "deps": ["0A11010200000022"]},
    {"task": "0A11010200000024", "kind": "item_any", "items": "minecraft:iron_axe", "n": 2, "q": "p_t04", "f": "00_prologue", "deps": ["0A11010200000023"]},
    {"task": "0A11010200000025", "kind": "item_any", "items": "minecraft:iron_sword", "n": 1, "q": "p_t05", "f": "00_prologue", "deps": ["0A11010200000024"]},
    {"task": "0A11010200000026", "kind": "item_any", "items": "minecraft:shield", "n": 1, "q": "p_t06", "f": "00_prologue", "deps": ["0A11010200000025"]},
    {"task": "0A11010200000027", "kind": "item_any", "items": "minecraft:bow", "n": 1, "q": "p_t07", "f": "00_prologue", "deps": ["0A11010200000026"]},
    {"task": "0A11010200000028", "kind": "item_any", "items": "minecraft:arrow", "n": 32, "q": "p_t08", "f": "00_prologue", "deps": ["0A11010200000027"]},
    {"task": "0A11010200000029", "kind": "item_any", "items": "minecraft:bread", "n": 16, "q": "p_i01", "f": "00_prologue", "deps": ["0A1101020000000D"]},
    {"task": "0A1101020000002A", "kind": "building", "word": "farm", "n": 2, "q": "p_i01", "f": "00_prologue", "deps": ["0A1101020000000D"]},
    {"task": "0A1101020000002B", "kind": "item_any", "items": "minecraft:chest", "n": 4, "q": "p_i02", "f": "00_prologue", "deps": ["0A1101020000001C", "0A11010200000029", "0A1101020000002A"]},
    {"task": "0A1101020000002C", "kind": "building", "word": "warehouse", "n": 1, "q": "p_i02", "f": "00_prologue", "deps": ["0A1101020000001C", "0A11010200000029", "0A1101020000002A"]},
    {"task": "0A1101020000002D", "kind": "item_any", "items": "minecraft:iron_pickaxe", "n": 4, "q": "p_i03", "f": "00_prologue", "deps": ["0A11010200000023", "0A1101020000002B", "0A1101020000002C"]},
    {"task": "0A1101020000002E", "kind": "building", "word": "black", "n": 1, "q": "p_i03", "f": "00_prologue", "deps": ["0A11010200000023", "0A1101020000002B", "0A1101020000002C"]},
    {"task": "0A1101020000002F", "kind": "item_any", "items": "minecraft:cobblestone", "n": 64, "q": "p_i04", "f": "00_prologue", "deps": ["0A1101020000002D", "0A1101020000002E"]},
    {"task": "0A11010200000030", "kind": "citizens", "n": 4, "q": "p_i04", "f": "00_prologue", "deps": ["0A1101020000002D", "0A1101020000002E"]},
    {"task": "0A11010200000031", "kind": "item_any", "items": "minecraft:stone", "n": 64, "q": "p_i05", "f": "00_prologue", "deps": ["0A1101020000002F", "0A11010200000030"]},
    {"task": "0A11010200000032", "kind": "building", "word": "residence", "n": 2, "q": "p_i05", "f": "00_prologue", "deps": ["0A1101020000002F", "0A11010200000030"]},
    {"task": "0A11010200000033", "kind": "item_any", "items": "minecraft:apple", "n": 16, "q": "p_h01", "f": "00_prologue", "deps": ["0A1101020000000D"]},
    {"task": "0A11010200000034", "kind": "item_any", "items": "minecraft:carrot", "n": 16, "q": "p_h02", "f": "00_prologue", "deps": ["0A11010200000033"]},
    {"task": "0A11010200000035", "kind": "item_any", "items": "minecraft:potato", "n": 16, "q": "p_h02", "f": "00_prologue", "deps": ["0A11010200000033"]},
    {"task": "0A11010200000036", "kind": "item_any", "items": "minecraft:egg", "n": 8, "q": "p_h03", "f": "00_prologue", "deps": ["0A11010200000034", "0A11010200000035"]},
    {"task": "0A11010200000037", "kind": "item_any", "items": "minecraft:milk_bucket", "n": 4, "q": "p_h04", "f": "00_prologue", "deps": ["0A11010200000036"]},
    {"task": "0A11010200000038", "kind": "item_any", "items": "minecraft:leather", "n": 8, "q": "p_h05", "f": "00_prologue", "deps": ["0A11010200000037"]},
    {"task": "0A11010200000039", "kind": "item_any", "items": "minecraft:feather", "n": 8, "q": "p_h05", "f": "00_prologue", "deps": ["0A11010200000037"]},
    {"task": "0A1101020000003A", "kind": "item_any", "items": "minecraft:white_wool", "n": 16, "q": "p_h06", "f": "00_prologue", "deps": ["0A11010200000038", "0A11010200000039"]},
    {"task": "0A1101020000003B", "kind": "item_any", "items": "minecraft:mutton|minecraft:porkchop", "n": 16, "q": "p_h07", "f": "00_prologue", "deps": ["0A1101020000003A"]},
    {"task": "0A1101020000003C", "kind": "item_any", "items": "minecraft:lantern", "n": 8, "q": "p_d01", "f": "00_prologue", "deps": ["0A1101020000001D"]},
    {"task": "0A1101020000003D", "kind": "item_any", "items": "minecraft:glass_pane", "n": 32, "q": "p_d02", "f": "00_prologue", "deps": ["0A1101020000003C"]},
    {"task": "0A1101020000003E", "kind": "item_any", "items": "minecraft:oak_fence", "n": 32, "q": "p_d03", "f": "00_prologue", "deps": ["0A1101020000003D"]},
    {"task": "0A1101020000003F", "kind": "item_any", "items": "minecraft:oak_door", "n": 4, "q": "p_d04", "f": "00_prologue", "deps": ["0A1101020000003E"]},
    {"task": "0A11010200000040", "kind": "item_any", "items": "minecraft:ladder", "n": 16, "q": "p_d05", "f": "00_prologue", "deps": ["0A1101020000003F"]},
    {"task": "0A11010200000041", "kind": "item_any", "items": "minecraft:painting", "n": 4, "q": "p_d06", "f": "00_prologue", "deps": ["0A11010200000040"]},
    {"task": "0A11010200000042", "kind": "item_any", "items": "minecraft:campfire", "n": 2, "q": "p_d07", "f": "00_prologue", "deps": ["0A11010200000041"]},
    {"task": "0A11010200000043", "kind": "item_any", "items": "minecraft:charcoal", "n": 64, "q": "p_f01", "f": "00_prologue", "deps": []},
    {"task": "0A11010200000044", "kind": "item_any", "items": "minecraft:lava_bucket", "n": 2, "q": "p_f02", "f": "00_prologue", "deps": ["0A11010200000043"]},
    {"task": "0A11010200000045", "kind": "item_any", "items": "minecraft:smoker", "n": 1, "q": "p_f03", "f": "00_prologue", "deps": ["0A11010200000044"]},
    {"task": "0A11010200000046", "kind": "item_any", "items": "minecraft:blast_furnace", "n": 1, "q": "p_f04", "f": "00_prologue", "deps": ["0A11010200000045"]},
    {"task": "0A11010200000047", "kind": "item_any", "items": "minecraft:candle", "n": 8, "q": "p_f05", "f": "00_prologue", "deps": ["0A11010200000046"]},
    {"task": "0A11010200000048", "kind": "item_any", "items": "minecraft:hay_block", "n": 8, "q": "p_f06", "f": "00_prologue", "deps": ["0A11010200000047"]},
    {"task": "0A11010200000049", "kind": "item_any", "items": "minecraft:wheat", "n": 64, "q": "p_g01", "f": "00_prologue", "deps": []},
    {"task": "0A1101020000004A", "kind": "building", "word": "farm", "n": 2, "q": "p_g01", "f": "00_prologue", "deps": []},
    {"task": "0A1101020000004B", "kind": "item_any", "items": "minecraft:honeycomb", "n": 8, "q": "p_g02", "f": "00_prologue", "deps": ["0A11010200000049", "0A1101020000004A"]},
    {"task": "0A1101020000004C", "kind": "item_any", "items": "minecraft:apple", "n": 32, "q": "p_g03", "f": "00_prologue", "deps": ["0A1101020000004B"]},
    {"task": "0A1101020000004D", "kind": "item_any", "items": "minecraft:beetroot", "n": 32, "q": "p_g04", "f": "00_prologue", "deps": ["0A1101020000004C"]},
    {"task": "0A1101020000004E", "kind": "item_any", "items": "minecraft:sugar_cane", "n": 32, "q": "p_g05", "f": "00_prologue", "deps": ["0A1101020000004D"]},
    {"task": "0A1101020000004F", "kind": "item_any", "items": "minecraft:coal", "n": 64, "q": "p_g06", "f": "00_prologue", "deps": ["0A1101020000004E"]},
    {"task": "0A11010200000050", "kind": "always", "q": "p_tr", "f": "00_prologue", "deps": ["0A11010200000009"]},
    {"task": "0A11020200000001", "kind": "townhall", "n": 2, "q": "hub", "f": "10_epoch_wood_water", "deps": ["0A11010200000009"]},
    {"task": "0A11020200000002", "kind": "townhall", "n": 2, "q": "town2", "f": "10_epoch_wood_water", "deps": ["0A11020200000001"]},
    {"task": "0A11020200000003", "kind": "citizens", "n": 8, "q": "pop8", "f": "10_epoch_wood_water", "deps": ["0A11020200000002"]},
    {"task": "0A11020200000004", "kind": "building", "word": "lumberjack", "n": 1, "q": "forester", "f": "10_epoch_wood_water", "deps": ["0A11020200000002"]},
    {"task": "0A11020200000005", "kind": "building", "word": "miner", "n": 1, "q": "miner", "f": "10_epoch_wood_water", "deps": ["0A11020200000002"]},
    {"task": "0A11020200000006", "kind": "building", "word": "warehouse", "n": 1, "q": "warehouse", "f": "10_epoch_wood_water", "deps": ["0A11020200000002"]},
    {"task": "0A11020200000007", "kind": "building", "word": "deliveryman", "n": 1, "q": "courier", "f": "10_epoch_wood_water", "deps": ["0A11020200000006"]},
    {"task": "0A11020200000008", "kind": "building", "word": "farm", "n": 1, "q": "food_prod", "f": "10_epoch_wood_water", "deps": ["0A11020200000001"]},
    {"task": "0A11020200000009", "kind": "item_any", "items": "create:water_wheel", "n": 1, "q": "water_wheel", "f": "10_epoch_wood_water", "deps": ["0A11020200000001"]},
    {"task": "0A1102020000000A", "kind": "item_any", "items": "create:shaft", "n": 16, "q": "shaft", "f": "10_epoch_wood_water", "deps": ["0A11020200000009"]},
    {"task": "0A1102020000000B", "kind": "item_any", "items": "create:mechanical_press", "n": 1, "q": "press", "f": "10_epoch_wood_water", "deps": ["0A1102020000000A"]},
    {"task": "0A1102020000000C", "kind": "item_any", "items": "create:mechanical_saw", "n": 1, "q": "saw", "f": "10_epoch_wood_water", "deps": ["0A1102020000000A"]},
    {"task": "0A1102020000000D", "kind": "item_any", "items": "create:encased_fan", "n": 1, "q": "fan", "f": "10_epoch_wood_water", "deps": ["0A11020200000009"]},
    {"task": "0A1102020000000E", "kind": "item_any", "items": "create:belt_connector", "n": 8, "q": "conveyor", "f": "10_epoch_wood_water", "deps": ["0A1102020000000B", "0A1102020000000C"]},
    {"task": "0A1102020000000F", "kind": "always", "q": "spellbook", "f": "10_epoch_wood_water", "deps": ["0A11020200000001"]},
    {"task": "0A11020200000010", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 8, "q": "source", "f": "10_epoch_wood_water", "deps": ["0A1102020000000F"]},
    {"task": "0A11020200000011", "kind": "building", "word": "sawmill", "n": 1, "q": "project", "f": "10_epoch_wood_water", "deps": ["0A11020200000003", "0A11020200000007", "0A11020200000008", "0A1102020000000D", "0A1102020000000E", "0A11020200000010", "0A11020200000013", "0A11020200000014", "0A11020200000024", "0A11020200000036", "0A11020200000040", "0A1102020000004C", "0A11020200000057", "0A11020200000058", "0A11020200000061", "0A11020200000062"]},
    {"task": "0A11020200000012", "kind": "item_any", "items": "create:iron_sheet", "n": 16, "q": "project", "f": "10_epoch_wood_water", "deps": ["0A11020200000003", "0A11020200000007", "0A11020200000008", "0A1102020000000D", "0A1102020000000E", "0A11020200000010", "0A11020200000013", "0A11020200000014", "0A11020200000024", "0A11020200000036", "0A11020200000040", "0A1102020000004C", "0A11020200000057", "0A11020200000058", "0A11020200000061", "0A11020200000062"]},
    {"task": "0A11020200000013", "kind": "item_any", "items": "minecraft:iron_pickaxe", "n": 4, "q": "ir_tools", "f": "10_epoch_wood_water", "deps": ["0A11020200000005"]},
    {"task": "0A11020200000014", "kind": "item_any", "items": "minecraft:oak_sapling", "n": 16, "q": "saplings", "f": "10_epoch_wood_water", "deps": ["0A11020200000004"]},
    {"task": "0A11020200000015", "kind": "building", "word": "residence", "n": 3, "q": "e1_c01", "f": "10_epoch_wood_water", "deps": ["0A11020200000001"]},
    {"task": "0A11020200000016", "kind": "citizens", "n": 4, "q": "e1_c02", "f": "10_epoch_wood_water", "deps": ["0A11020200000015"]},
    {"task": "0A11020200000017", "kind": "citizens", "n": 6, "q": "e1_c03", "f": "10_epoch_wood_water", "deps": ["0A11020200000016"]},
    {"task": "0A11020200000018", "kind": "citizens", "n": 10, "q": "e1_c04", "f": "10_epoch_wood_water", "deps": ["0A11020200000017"]},
    {"task": "0A11020200000019", "kind": "citizens", "n": 12, "q": "e1_c05", "f": "10_epoch_wood_water", "deps": ["0A11020200000018"]},
    {"task": "0A1102020000001A", "kind": "building", "word": "lumberjack", "n": 2, "q": "e1_c06", "f": "10_epoch_wood_water", "deps": ["0A11020200000019"]},
    {"task": "0A1102020000001B", "kind": "building", "word": "miner", "n": 2, "q": "e1_c07", "f": "10_epoch_wood_water", "deps": ["0A1102020000001A"]},
    {"task": "0A1102020000001C", "kind": "building", "word": "farm", "n": 2, "q": "e1_c08", "f": "10_epoch_wood_water", "deps": ["0A1102020000001B"]},
    {"task": "0A1102020000001D", "kind": "building", "word": "cook", "n": 2, "q": "e1_c09", "f": "10_epoch_wood_water", "deps": ["0A1102020000001C"]},
    {"task": "0A1102020000001E", "kind": "building", "word": "fish", "n": 2, "q": "e1_c10", "f": "10_epoch_wood_water", "deps": ["0A1102020000001D"]},
    {"task": "0A1102020000001F", "kind": "building", "word": "saw", "n": 1, "q": "e1_c11", "f": "10_epoch_wood_water", "deps": ["0A1102020000001E"]},
    {"task": "0A11020200000020", "kind": "building", "word": "stone", "n": 2, "q": "e1_c12", "f": "10_epoch_wood_water", "deps": ["0A1102020000001F"]},
    {"task": "0A11020200000021", "kind": "building", "word": "black", "n": 2, "q": "e1_c13", "f": "10_epoch_wood_water", "deps": ["0A11020200000020"]},
    {"task": "0A11020200000022", "kind": "building", "word": "guard", "n": 2, "q": "e1_c14", "f": "10_epoch_wood_water", "deps": ["0A11020200000021"]},
    {"task": "0A11020200000023", "kind": "building", "word": "warehouse", "n": 2, "q": "e1_c15", "f": "10_epoch_wood_water", "deps": ["0A11020200000022"]},
    {"task": "0A11020200000024", "kind": "building", "word": "deliveryman", "n": 2, "q": "e1_c16", "f": "10_epoch_wood_water", "deps": ["0A11020200000023"]},
    {"task": "0A11020200000025", "kind": "item_any", "items": "create:cogwheel", "n": 16, "q": "e1_m01", "f": "10_epoch_wood_water", "deps": ["0A11020200000009"]},
    {"task": "0A11020200000026", "kind": "item_any", "items": "create:large_cogwheel", "n": 8, "q": "e1_m02", "f": "10_epoch_wood_water", "deps": ["0A11020200000025"]},
    {"task": "0A11020200000027", "kind": "item_any", "items": "create:shaft", "n": 16, "q": "e1_m03", "f": "10_epoch_wood_water", "deps": ["0A11020200000026"]},
    {"task": "0A11020200000028", "kind": "item_any", "items": "create:andesite_casing", "n": 8, "q": "e1_m04", "f": "10_epoch_wood_water", "deps": ["0A11020200000027"]},
    {"task": "0A11020200000029", "kind": "item_any", "items": "create:gearbox", "n": 8, "q": "e1_m05", "f": "10_epoch_wood_water", "deps": ["0A11020200000028"]},
    {"task": "0A1102020000002A", "kind": "item_any", "items": "create:belt_connector", "n": 16, "q": "e1_m06", "f": "10_epoch_wood_water", "deps": ["0A11020200000023", "0A11020200000029"]},
    {"task": "0A1102020000002B", "kind": "item_any", "items": "create:depot", "n": 4, "q": "e1_m07", "f": "10_epoch_wood_water", "deps": ["0A1102020000002A"]},
    {"task": "0A1102020000002C", "kind": "item_any", "items": "create:chute", "n": 8, "q": "e1_m08", "f": "10_epoch_wood_water", "deps": ["0A1102020000002B"]},
    {"task": "0A1102020000002D", "kind": "item_any", "items": "create:millstone", "n": 2, "q": "e1_m09", "f": "10_epoch_wood_water", "deps": ["0A1102020000002C"]},
    {"task": "0A1102020000002E", "kind": "item_any", "items": "create:crushing_wheel", "n": 2, "q": "e1_m10", "f": "10_epoch_wood_water", "deps": ["0A1102020000002D"]},
    {"task": "0A1102020000002F", "kind": "item_any", "items": "create:mechanical_mixer", "n": 2, "q": "e1_m11", "f": "10_epoch_wood_water", "deps": ["0A1102020000002E"]},
    {"task": "0A11020200000030", "kind": "item_any", "items": "create:basin", "n": 4, "q": "e1_m12", "f": "10_epoch_wood_water", "deps": ["0A1102020000002F"]},
    {"task": "0A11020200000031", "kind": "item_any", "items": "create:spout", "n": 2, "q": "e1_m13", "f": "10_epoch_wood_water", "deps": ["0A11020200000030"]},
    {"task": "0A11020200000032", "kind": "item_any", "items": "create:item_drain", "n": 2, "q": "e1_m14", "f": "10_epoch_wood_water", "deps": ["0A11020200000031"]},
    {"task": "0A11020200000033", "kind": "item_any", "items": "create:mechanical_crafter", "n": 8, "q": "e1_m15", "f": "10_epoch_wood_water", "deps": ["0A11020200000032"]},
    {"task": "0A11020200000034", "kind": "item_any", "items": "create:wrench", "n": 1, "q": "e1_m16", "f": "10_epoch_wood_water", "deps": ["0A11020200000033"]},
    {"task": "0A11020200000035", "kind": "item_any", "items": "create:electron_tube", "n": 8, "q": "e1_m17", "f": "10_epoch_wood_water", "deps": ["0A11020200000034"]},
    {"task": "0A11020200000036", "kind": "item_any", "items": "create:super_glue", "n": 1, "q": "e1_m18", "f": "10_epoch_wood_water", "deps": ["0A11020200000035"]},
    {"task": "0A11020200000037", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 16, "q": "e1_a01", "f": "10_epoch_wood_water", "deps": ["0A1102020000000F"]},
    {"task": "0A11020200000038", "kind": "item_any", "items": "ars_nouveau:sourcestone", "n": 64, "q": "e1_a02", "f": "10_epoch_wood_water", "deps": ["0A11020200000037"]},
    {"task": "0A11020200000039", "kind": "item_any", "items": "minecraft:experience_bottle", "n": 8, "q": "e1_a03", "f": "10_epoch_wood_water", "deps": ["0A11020200000038"]},
    {"task": "0A1102020000003A", "kind": "item_any", "items": "minecraft:bookshelf", "n": 8, "q": "e1_a04", "f": "10_epoch_wood_water", "deps": ["0A11020200000039"]},
    {"task": "0A1102020000003B", "kind": "item_any", "items": "minecraft:enchanting_table", "n": 1, "q": "e1_a05", "f": "10_epoch_wood_water", "deps": ["0A1102020000003A"]},
    {"task": "0A1102020000003C", "kind": "item_any", "items": "minecraft:book", "n": 16, "q": "e1_a06", "f": "10_epoch_wood_water", "deps": ["0A1102020000001F", "0A1102020000003B"]},
    {"task": "0A1102020000003D", "kind": "building", "word": "library", "n": 1, "q": "e1_a06", "f": "10_epoch_wood_water", "deps": ["0A1102020000001F", "0A1102020000003B"]},
    {"task": "0A1102020000003E", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 32, "q": "e1_a07", "f": "10_epoch_wood_water", "deps": ["0A1102020000003C", "0A1102020000003D"]},
    {"task": "0A1102020000003F", "kind": "building", "word": "saw", "n": 1, "q": "e1_a07", "f": "10_epoch_wood_water", "deps": ["0A1102020000003C", "0A1102020000003D"]},
    {"task": "0A11020200000040", "kind": "item_any", "items": "minecraft:glass_bottle", "n": 16, "q": "e1_a08", "f": "10_epoch_wood_water", "deps": ["0A1102020000003E", "0A1102020000003F"]},
    {"task": "0A11020200000041", "kind": "item_any", "items": "minecraft:oak_log", "n": 256, "q": "e1_p01", "f": "10_epoch_wood_water", "deps": ["0A1102020000001A"]},
    {"task": "0A11020200000042", "kind": "item_any", "items": "minecraft:cobblestone", "n": 512, "q": "e1_p02", "f": "10_epoch_wood_water", "deps": ["0A11020200000041"]},
    {"task": "0A11020200000043", "kind": "item_any", "items": "minecraft:coal", "n": 64, "q": "e1_p03", "f": "10_epoch_wood_water", "deps": ["0A11020200000042"]},
    {"task": "0A11020200000044", "kind": "item_any", "items": "minecraft:iron_ingot", "n": 32, "q": "e1_p04", "f": "10_epoch_wood_water", "deps": ["0A11020200000043"]},
    {"task": "0A11020200000045", "kind": "item_any", "items": "create:andesite_alloy", "n": 32, "q": "e1_p05", "f": "10_epoch_wood_water", "deps": ["0A11020200000028", "0A11020200000044"]},
    {"task": "0A11020200000046", "kind": "item_any", "items": "create:mechanical_press", "n": 2, "q": "e1_p06", "f": "10_epoch_wood_water", "deps": ["0A11020200000045"]},
    {"task": "0A11020200000047", "kind": "item_any", "items": "create:mechanical_saw", "n": 2, "q": "e1_p07", "f": "10_epoch_wood_water", "deps": ["0A11020200000046"]},
    {"task": "0A11020200000048", "kind": "item_any", "items": "create:encased_fan", "n": 2, "q": "e1_p08", "f": "10_epoch_wood_water", "deps": ["0A11020200000047"]},
    {"task": "0A11020200000049", "kind": "item_any", "items": "create:millstone", "n": 2, "q": "e1_p09", "f": "10_epoch_wood_water", "deps": ["0A11020200000048"]},
    {"task": "0A1102020000004A", "kind": "item_any", "items": "create:belt_connector", "n": 32, "q": "e1_p10", "f": "10_epoch_wood_water", "deps": ["0A11020200000049"]},
    {"task": "0A1102020000004B", "kind": "item_any", "items": "minecraft:stone_bricks", "n": 128, "q": "e1_p11", "f": "10_epoch_wood_water", "deps": ["0A1102020000004A"]},
    {"task": "0A1102020000004C", "kind": "item_any", "items": "minecraft:glass", "n": 128, "q": "e1_p12", "f": "10_epoch_wood_water", "deps": ["0A1102020000001F", "0A1102020000004B"]},
    {"task": "0A1102020000004D", "kind": "item_any", "items": "minecraft:bread", "n": 32, "q": "e1_x01", "f": "10_epoch_wood_water", "deps": ["0A11020200000043"]},
    {"task": "0A1102020000004E", "kind": "building", "word": "cook", "n": 2, "q": "e1_x01", "f": "10_epoch_wood_water", "deps": ["0A11020200000043"]},
    {"task": "0A1102020000004F", "kind": "item_any", "items": "minecraft:iron_ingot", "n": 16, "q": "e1_x02", "f": "10_epoch_wood_water", "deps": ["0A1102020000004D", "0A1102020000004E"]},
    {"task": "0A11020200000050", "kind": "building", "word": "miner", "n": 2, "q": "e1_x02", "f": "10_epoch_wood_water", "deps": ["0A1102020000004D", "0A1102020000004E"]},
    {"task": "0A11020200000051", "kind": "item_any", "items": "minecraft:oak_log", "n": 64, "q": "e1_x03", "f": "10_epoch_wood_water", "deps": ["0A1102020000004F", "0A11020200000050"]},
    {"task": "0A11020200000052", "kind": "building", "word": "lumberjack", "n": 2, "q": "e1_x03", "f": "10_epoch_wood_water", "deps": ["0A1102020000004F", "0A11020200000050"]},
    {"task": "0A11020200000053", "kind": "item_any", "items": "create:cogwheel", "n": 32, "q": "e1_x04", "f": "10_epoch_wood_water", "deps": ["0A11020200000025", "0A11020200000051", "0A11020200000052"]},
    {"task": "0A11020200000054", "kind": "building", "word": "black", "n": 2, "q": "e1_x04", "f": "10_epoch_wood_water", "deps": ["0A11020200000025", "0A11020200000051", "0A11020200000052"]},
    {"task": "0A11020200000055", "kind": "item_any", "items": "ars_nouveau:sourcestone", "n": 64, "q": "e1_x05", "f": "10_epoch_wood_water", "deps": ["0A11020200000038", "0A11020200000053", "0A11020200000054"]},
    {"task": "0A11020200000056", "kind": "building", "word": "residence", "n": 3, "q": "e1_x05", "f": "10_epoch_wood_water", "deps": ["0A11020200000038", "0A11020200000053", "0A11020200000054"]},
    {"task": "0A11020200000057", "kind": "item_any", "items": "create:andesite_alloy", "n": 16, "q": "e1_x06", "f": "10_epoch_wood_water", "deps": ["0A11020200000055", "0A11020200000056"]},
    {"task": "0A11020200000058", "kind": "building", "word": "warehouse", "n": 2, "q": "e1_x06", "f": "10_epoch_wood_water", "deps": ["0A11020200000055", "0A11020200000056"]},
    {"task": "0A11020200000059", "kind": "item_any", "items": "create:mechanical_saw", "n": 2, "q": "e1pz01", "f": "10_epoch_wood_water", "deps": ["0A11020200000001"]},
    {"task": "0A1102020000005A", "kind": "item_any", "items": "create:belt_connector", "n": 32, "q": "e1pz01", "f": "10_epoch_wood_water", "deps": ["0A11020200000001"]},
    {"task": "0A1102020000005B", "kind": "building", "word": "saw", "n": 2, "q": "e1pz01", "f": "10_epoch_wood_water", "deps": ["0A11020200000001"]},
    {"task": "0A1102020000005C", "kind": "item_any", "items": "create:millstone", "n": 2, "q": "e1pz02", "f": "10_epoch_wood_water", "deps": ["0A11020200000059", "0A1102020000005A", "0A1102020000005B"]},
    {"task": "0A1102020000005D", "kind": "item_any", "items": "minecraft:cobblestone", "n": 512, "q": "e1pz02", "f": "10_epoch_wood_water", "deps": ["0A11020200000059", "0A1102020000005A", "0A1102020000005B"]},
    {"task": "0A1102020000005E", "kind": "item_any", "items": "create:encased_fan", "n": 2, "q": "e1pz03", "f": "10_epoch_wood_water", "deps": ["0A1102020000005C", "0A1102020000005D"]},
    {"task": "0A1102020000005F", "kind": "item_any", "items": "minecraft:iron_ingot", "n": 64, "q": "e1pz03", "f": "10_epoch_wood_water", "deps": ["0A1102020000005C", "0A1102020000005D"]},
    {"task": "0A11020200000060", "kind": "building", "word": "black", "n": 2, "q": "e1pz03", "f": "10_epoch_wood_water", "deps": ["0A1102020000005C", "0A1102020000005D"]},
    {"task": "0A11020200000061", "kind": "item_any", "items": "minecraft:chest", "n": 16, "q": "e1pz04", "f": "10_epoch_wood_water", "deps": ["0A1102020000005E", "0A1102020000005F", "0A11020200000060"]},
    {"task": "0A11020200000062", "kind": "building", "word": "warehouse", "n": 2, "q": "e1pz04", "f": "10_epoch_wood_water", "deps": ["0A1102020000005E", "0A1102020000005F", "0A11020200000060"]},
    {"task": "0A11020200000063", "kind": "always", "q": "e1_tr", "f": "10_epoch_wood_water", "deps": ["0A11020200000011", "0A11020200000012"]},
    {"task": "0A11030200000001", "kind": "townhall", "n": 3, "q": "hub", "f": "20_epoch_steam_logistics", "deps": ["0A11020200000011", "0A11020200000012"]},
    {"task": "0A11030200000002", "kind": "townhall", "n": 3, "q": "town23", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000001"]},
    {"task": "0A11030200000003", "kind": "building", "word": "builder", "n": 3, "q": "builder3", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000002"]},
    {"task": "0A11030200000004", "kind": "building", "word": "warehouse", "n": 2, "q": "wh2", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000002"]},
    {"task": "0A11030200000005", "kind": "citizens", "n": 12, "q": "pop12", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000002"]},
    {"task": "0A11030200000006", "kind": "building", "word": "university", "n": 1, "q": "university", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000002"]},
    {"task": "0A11030200000007", "kind": "building", "word": "cook", "n": 1, "q": "food2", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000001"]},
    {"task": "0A11030200000008", "kind": "item_any", "items": "create:brass_ingot", "n": 16, "q": "brass", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000001"]},
    {"task": "0A11030200000009", "kind": "item_any", "items": "create:steam_engine", "n": 1, "q": "steam", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000008"]},
    {"task": "0A1103020000000A", "kind": "item_any", "items": "create:precision_mechanism", "n": 4, "q": "precision", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000009"]},
    {"task": "0A1103020000000C", "kind": "always", "q": "ars_auto", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000008"]},
    {"task": "0A1103020000000D", "kind": "building", "word": "mechanic", "n": 1, "q": "project", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000003", "0A11030200000004", "0A11030200000005", "0A11030200000006", "0A11030200000007", "0A1103020000000A", "0A1103020000000C", "0A1103020000000F", "0A11030200000010", "0A11030200000020", "0A1103020000002D", "0A11030200000036", "0A11030200000037", "0A11030200000042", "0A11030200000043", "0A1103020000004E", "0A1103020000004F", "0A11030200000055", "0A1103020000005D", "0A1103020000005E"]},
    {"task": "0A1103020000000E", "kind": "item_any", "items": "create:brass_casing", "n": 8, "q": "project", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000003", "0A11030200000004", "0A11030200000005", "0A11030200000006", "0A11030200000007", "0A1103020000000A", "0A1103020000000C", "0A1103020000000F", "0A11030200000010", "0A11030200000020", "0A1103020000002D", "0A11030200000036", "0A11030200000037", "0A11030200000042", "0A11030200000043", "0A1103020000004E", "0A1103020000004F", "0A11030200000055", "0A1103020000005D", "0A1103020000005E"]},
    {"task": "0A1103020000000F", "kind": "item_any", "items": "create:brass_ingot", "n": 16, "q": "brass_reserve", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000008"]},
    {"task": "0A11030200000010", "kind": "item_any", "items": "create:cogwheel", "n": 32, "q": "cogs", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000000A"]},
    {"task": "0A11030200000011", "kind": "townhall", "n": 3, "q": "e2_c01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000001"]},
    {"task": "0A11030200000012", "kind": "citizens", "n": 14, "q": "e2_c02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000011"]},
    {"task": "0A11030200000013", "kind": "citizens", "n": 16, "q": "e2_c03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000012"]},
    {"task": "0A11030200000014", "kind": "citizens", "n": 18, "q": "e2_c04", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000013"]},
    {"task": "0A11030200000015", "kind": "citizens", "n": 20, "q": "e2_c05", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000014"]},
    {"task": "0A11030200000016", "kind": "building", "word": "builder", "n": 3, "q": "e2_c06", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000015"]},
    {"task": "0A11030200000017", "kind": "building", "word": "warehouse", "n": 3, "q": "e2_c07", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000016"]},
    {"task": "0A11030200000018", "kind": "building", "word": "mech", "n": 1, "q": "e2_c08", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000017"]},
    {"task": "0A11030200000019", "kind": "building", "word": "university", "n": 1, "q": "e2_c09", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000018"]},
    {"task": "0A1103020000001A", "kind": "building", "word": "library", "n": 2, "q": "e2_c10", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000019"]},
    {"task": "0A1103020000001B", "kind": "building", "word": "school", "n": 1, "q": "e2_c11", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001A"]},
    {"task": "0A1103020000001C", "kind": "building", "word": "hospital", "n": 1, "q": "e2_c12", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001B"]},
    {"task": "0A1103020000001D", "kind": "building", "word": "cook", "n": 3, "q": "e2_c13", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001C"]},
    {"task": "0A1103020000001E", "kind": "building", "word": "farm", "n": 3, "q": "e2_c14", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001D"]},
    {"task": "0A1103020000001F", "kind": "building", "word": "guard", "n": 3, "q": "e2_c15", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001E"]},
    {"task": "0A11030200000020", "kind": "building", "word": "residence", "n": 4, "q": "e2_c16", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001F"]},
    {"task": "0A11030200000021", "kind": "item_any", "items": "create:steam_engine", "n": 2, "q": "e2_s01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000009"]},
    {"task": "0A11030200000022", "kind": "item_any", "items": "create:steam_whistle", "n": 4, "q": "e2_s02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000021"]},
    {"task": "0A11030200000023", "kind": "item_any", "items": "create:railway_casing", "n": 16, "q": "e2_s03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000017", "0A11030200000022"]},
    {"task": "0A11030200000024", "kind": "item_any", "items": "create:blaze_burner", "n": 4, "q": "e2_s04", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000023"]},
    {"task": "0A11030200000025", "kind": "item_any", "items": "create:blaze_cake", "n": 8, "q": "e2_s05", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000024"]},
    {"task": "0A11030200000026", "kind": "item_any", "items": "create:mechanical_arm", "n": 2, "q": "e2_s06", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000025"]},
    {"task": "0A11030200000027", "kind": "item_any", "items": "create:rotation_speed_controller", "n": 1, "q": "e2_s07", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000026"]},
    {"task": "0A11030200000028", "kind": "item_any", "items": "create:speedometer", "n": 2, "q": "e2_s08", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000027"]},
    {"task": "0A11030200000029", "kind": "item_any", "items": "create:stressometer", "n": 2, "q": "e2_s09", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000028"]},
    {"task": "0A1103020000002A", "kind": "item_any", "items": "create:brass_funnel", "n": 8, "q": "e2_s10", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000029"]},
    {"task": "0A1103020000002B", "kind": "item_any", "items": "create:brass_tunnel", "n": 8, "q": "e2_s11", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000002A"]},
    {"task": "0A1103020000002C", "kind": "item_any", "items": "create:electron_tube", "n": 16, "q": "e2_s12", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000002B"]},
    {"task": "0A1103020000002D", "kind": "item_any", "items": "create:super_glue", "n": 4, "q": "e2_s13", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000002C"]},
    {"task": "0A1103020000002E", "kind": "item_any", "items": "minecraft:copper_ingot", "n": 32, "q": "e2_e01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000018"]},
    {"task": "0A1103020000002F", "kind": "building", "word": "mech", "n": 1, "q": "e2_e01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000018"]},
    {"task": "0A11030200000030", "kind": "item_any", "items": "createaddition:copper_wire|minecraft:copper_ingot", "n": 32, "q": "e2_e02", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000002E", "0A1103020000002F"]},
    {"task": "0A11030200000031", "kind": "item_any", "items": "createaddition:steel_rod|minecraft:iron_ingot", "n": 16, "q": "e2_e03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000030"]},
    {"task": "0A11030200000032", "kind": "item_any", "items": "createaddition:modular_accumulator|minecraft:redstone_block", "n": 2, "q": "e2_e04", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000031"]},
    {"task": "0A11030200000033", "kind": "item_any", "items": "createaddition:electric_motor|minecraft:redstone", "n": 2, "q": "e2_e05", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000032"]},
    {"task": "0A11030200000034", "kind": "item_any", "items": "createaddition:rolling_mill|minecraft:iron_block", "n": 1, "q": "e2_e06", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000033"]},
    {"task": "0A11030200000035", "kind": "item_any", "items": "createaddition:tesla_coil|minecraft:lightning_rod", "n": 1, "q": "e2_e07", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000034"]},
    {"task": "0A11030200000036", "kind": "item_any", "items": "minecraft:redstone", "n": 64, "q": "e2_e08", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000017", "0A11030200000035"]},
    {"task": "0A11030200000037", "kind": "building", "word": "warehouse", "n": 3, "q": "e2_e08", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000017", "0A11030200000035"]},
    {"task": "0A11030200000038", "kind": "item_any", "items": "minecraft:coal", "n": 128, "q": "e2_l01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000001"]},
    {"task": "0A11030200000039", "kind": "item_any", "items": "create:brass_ingot", "n": 32, "q": "e2_l02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000038"]},
    {"task": "0A1103020000003A", "kind": "item_any", "items": "create:precision_mechanism", "n": 16, "q": "e2_l03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000021", "0A11030200000039"]},
    {"task": "0A1103020000003B", "kind": "item_any", "items": "create:andesite_alloy", "n": 64, "q": "e2_l04", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000003A"]},
    {"task": "0A1103020000003C", "kind": "item_any", "items": "minecraft:glass", "n": 128, "q": "e2_l05", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000003B"]},
    {"task": "0A1103020000003D", "kind": "item_any", "items": "minecraft:chest", "n": 32, "q": "e2_l06", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000003C"]},
    {"task": "0A1103020000003E", "kind": "item_any", "items": "minecraft:barrel", "n": 16, "q": "e2_l07", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000003D"]},
    {"task": "0A1103020000003F", "kind": "item_any", "items": "minecraft:brick", "n": 128, "q": "e2_l08", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000003E"]},
    {"task": "0A11030200000040", "kind": "item_any", "items": "minecraft:bread", "n": 64, "q": "e2_l09", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001D", "0A1103020000003F"]},
    {"task": "0A11030200000041", "kind": "building", "word": "cook", "n": 3, "q": "e2_l09", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001D", "0A1103020000003F"]},
    {"task": "0A11030200000042", "kind": "item_any", "items": "minecraft:iron_ingot", "n": 32, "q": "e2_l10", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000040", "0A11030200000041"]},
    {"task": "0A11030200000043", "kind": "building", "word": "black", "n": 3, "q": "e2_l10", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000040", "0A11030200000041"]},
    {"task": "0A11030200000044", "kind": "item_any", "items": "create:railway_casing", "n": 8, "q": "e2_x01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000023"]},
    {"task": "0A11030200000045", "kind": "building", "word": "deliveryman", "n": 2, "q": "e2_x01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000023"]},
    {"task": "0A11030200000046", "kind": "item_any", "items": "create:mechanical_mixer", "n": 2, "q": "e2_x02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000044", "0A11030200000045"]},
    {"task": "0A11030200000047", "kind": "building", "word": "cook", "n": 3, "q": "e2_x02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000044", "0A11030200000045"]},
    {"task": "0A11030200000048", "kind": "item_any", "items": "minecraft:raw_iron", "n": 32, "q": "e2_x03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000046", "0A11030200000047"]},
    {"task": "0A11030200000049", "kind": "building", "word": "miner", "n": 3, "q": "e2_x03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000046", "0A11030200000047"]},
    {"task": "0A1103020000004A", "kind": "item_any", "items": "create:precision_mechanism", "n": 8, "q": "e2_x04", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000019", "0A11030200000048", "0A11030200000049"]},
    {"task": "0A1103020000004B", "kind": "building", "word": "university", "n": 1, "q": "e2_x04", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000019", "0A11030200000048", "0A11030200000049"]},
    {"task": "0A1103020000004C", "kind": "item_any", "items": "createaddition:copper_wire|minecraft:copper_ingot", "n": 16, "q": "e2_x05", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000004A", "0A1103020000004B"]},
    {"task": "0A1103020000004D", "kind": "building", "word": "warehouse", "n": 3, "q": "e2_x05", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000004A", "0A1103020000004B"]},
    {"task": "0A1103020000004E", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 16, "q": "e2_x06", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001A", "0A1103020000004C", "0A1103020000004D"]},
    {"task": "0A1103020000004F", "kind": "building", "word": "mech", "n": 1, "q": "e2_x06", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001A", "0A1103020000004C", "0A1103020000004D"]},
    {"task": "0A11030200000050", "kind": "item_any", "items": "minecraft:golden_carrot", "n": 16, "q": "e2_k01", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000001D"]},
    {"task": "0A11030200000051", "kind": "item_any", "items": "minecraft:baked_potato", "n": 64, "q": "e2_k02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000050"]},
    {"task": "0A11030200000052", "kind": "item_any", "items": "minecraft:cooked_beef|minecraft:cooked_porkchop", "n": 64, "q": "e2_k03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000051"]},
    {"task": "0A11030200000053", "kind": "item_any", "items": "minecraft:honey_bottle", "n": 8, "q": "e2_k04", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000052"]},
    {"task": "0A11030200000054", "kind": "item_any", "items": "minecraft:sugar", "n": 32, "q": "e2_k04", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000052"]},
    {"task": "0A11030200000055", "kind": "item_any", "items": "minecraft:cake", "n": 2, "q": "e2_k05", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000053", "0A11030200000054"]},
    {"task": "0A11030200000056", "kind": "item_any", "items": "create:steam_engine", "n": 2, "q": "e2pz01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000001"]},
    {"task": "0A11030200000057", "kind": "item_any", "items": "minecraft:coal", "n": 256, "q": "e2pz01", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000001"]},
    {"task": "0A11030200000058", "kind": "item_any", "items": "create:depot", "n": 4, "q": "e2pz02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000056", "0A11030200000057"]},
    {"task": "0A11030200000059", "kind": "item_any", "items": "create:belt_connector", "n": 32, "q": "e2pz02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000056", "0A11030200000057"]},
    {"task": "0A1103020000005A", "kind": "building", "word": "warehouse", "n": 3, "q": "e2pz02", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000056", "0A11030200000057"]},
    {"task": "0A1103020000005B", "kind": "item_any", "items": "minecraft:bread", "n": 256, "q": "e2pz03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000058", "0A11030200000059", "0A1103020000005A"]},
    {"task": "0A1103020000005C", "kind": "building", "word": "cook", "n": 3, "q": "e2pz03", "f": "20_epoch_steam_logistics", "deps": ["0A11030200000058", "0A11030200000059", "0A1103020000005A"]},
    {"task": "0A1103020000005D", "kind": "item_any", "items": "create:mechanical_crafter", "n": 8, "q": "e2pz04", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000005B", "0A1103020000005C"]},
    {"task": "0A1103020000005E", "kind": "item_any", "items": "create:precision_mechanism", "n": 8, "q": "e2pz04", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000005B", "0A1103020000005C"]},
    {"task": "0A1103020000005F", "kind": "always", "q": "e2_tr", "f": "20_epoch_steam_logistics", "deps": ["0A1103020000000D", "0A1103020000000E"]},
    {"task": "0A11040200000001", "kind": "townhall", "n": 3, "q": "hub", "f": "30_epoch_industry", "deps": ["0A1103020000000D", "0A1103020000000E"]},
    {"task": "0A11040200000002", "kind": "townhall", "n": 3, "q": "town3", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A11040200000003", "kind": "citizens", "n": 20, "q": "pop20", "f": "30_epoch_industry", "deps": ["0A11040200000002"]},
    {"task": "0A11040200000004", "kind": "building", "word": "warehouse", "n": 3, "q": "wh3", "f": "30_epoch_industry", "deps": ["0A11040200000002"]},
    {"task": "0A11040200000005", "kind": "building", "word": "university", "n": 2, "q": "research", "f": "30_epoch_industry", "deps": ["0A11040200000002"]},
    {"task": "0A11040200000006", "kind": "building", "word": "cook", "n": 2, "q": "food_fuel", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A11040200000007", "kind": "item_any", "items": "thermal:machine_frame", "n": 2, "q": "thermal_line", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A11040200000008", "kind": "always", "q": "energy", "f": "30_epoch_industry", "deps": ["0A11040200000007"]},
    {"task": "0A11040200000009", "kind": "item_any", "items": "mekanism:enrichment_chamber", "n": 1, "q": "enrichment", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A1104020000000A", "kind": "item_any", "items": "mekanism:ingot_steel", "n": 16, "q": "steel", "f": "30_epoch_industry", "deps": ["0A11040200000009"]},
    {"task": "0A1104020000000B", "kind": "always", "q": "chain", "f": "30_epoch_industry", "deps": ["0A1104020000000A"]},
    {"task": "0A1104020000000C", "kind": "item_any", "items": "arcanopolis:reinforced_casing", "n": 4, "q": "casing", "f": "30_epoch_industry", "deps": ["0A1104020000000A"]},
    {"task": "0A1104020000000D", "kind": "building", "word": "mechanic", "n": 2, "q": "warehouse_link", "f": "30_epoch_industry", "deps": ["0A1104020000000B"]},
    {"task": "0A1104020000000E", "kind": "item_any", "items": "arcanopolis:technical_passport", "n": 1, "q": "passport", "f": "30_epoch_industry", "deps": ["0A11040200000003", "0A11040200000004", "0A11040200000005", "0A11040200000006", "0A11040200000008", "0A1104020000000C", "0A1104020000000D", "0A1104020000000F", "0A11040200000010", "0A11040200000020", "0A11040200000036", "0A11040200000037", "0A11040200000042", "0A11040200000043", "0A1104020000004C", "0A1104020000004D", "0A11040200000053", "0A11040200000059", "0A1104020000005A"]},
    {"task": "0A1104020000000F", "kind": "item_any", "items": "mekanism:ingot_steel", "n": 32, "q": "steel_reserve", "f": "30_epoch_industry", "deps": ["0A1104020000000A"]},
    {"task": "0A11040200000010", "kind": "item_any", "items": "mekanism:basic_control_circuit", "n": 16, "q": "circuit_stock", "f": "30_epoch_industry", "deps": ["0A11040200000009"]},
    {"task": "0A11040200000011", "kind": "citizens", "n": 24, "q": "e3_c01", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A11040200000012", "kind": "citizens", "n": 28, "q": "e3_c02", "f": "30_epoch_industry", "deps": ["0A11040200000011"]},
    {"task": "0A11040200000013", "kind": "citizens", "n": 32, "q": "e3_c03", "f": "30_epoch_industry", "deps": ["0A11040200000012"]},
    {"task": "0A11040200000014", "kind": "building", "word": "university", "n": 2, "q": "e3_c04", "f": "30_epoch_industry", "deps": ["0A11040200000013"]},
    {"task": "0A11040200000015", "kind": "building", "word": "school", "n": 2, "q": "e3_c05", "f": "30_epoch_industry", "deps": ["0A11040200000014"]},
    {"task": "0A11040200000016", "kind": "building", "word": "hospital", "n": 2, "q": "e3_c06", "f": "30_epoch_industry", "deps": ["0A11040200000015"]},
    {"task": "0A11040200000017", "kind": "building", "word": "library", "n": 3, "q": "e3_c07", "f": "30_epoch_industry", "deps": ["0A11040200000016"]},
    {"task": "0A11040200000018", "kind": "building", "word": "mech", "n": 2, "q": "e3_c08", "f": "30_epoch_industry", "deps": ["0A11040200000017"]},
    {"task": "0A11040200000019", "kind": "building", "word": "warehouse", "n": 4, "q": "e3_c09", "f": "30_epoch_industry", "deps": ["0A11040200000018"]},
    {"task": "0A1104020000001A", "kind": "building", "word": "miner", "n": 4, "q": "e3_c10", "f": "30_epoch_industry", "deps": ["0A11040200000019"]},
    {"task": "0A1104020000001B", "kind": "building", "word": "lumberjack", "n": 4, "q": "e3_c11", "f": "30_epoch_industry", "deps": ["0A1104020000001A"]},
    {"task": "0A1104020000001C", "kind": "building", "word": "black", "n": 3, "q": "e3_c12", "f": "30_epoch_industry", "deps": ["0A1104020000001B"]},
    {"task": "0A1104020000001D", "kind": "building", "word": "saw", "n": 3, "q": "e3_c13", "f": "30_epoch_industry", "deps": ["0A1104020000001C"]},
    {"task": "0A1104020000001E", "kind": "building", "word": "guard", "n": 4, "q": "e3_c14", "f": "30_epoch_industry", "deps": ["0A1104020000001D"]},
    {"task": "0A1104020000001F", "kind": "building", "word": "cook", "n": 4, "q": "e3_c15", "f": "30_epoch_industry", "deps": ["0A1104020000001E"]},
    {"task": "0A11040200000020", "kind": "building", "word": "residence", "n": 5, "q": "e3_c16", "f": "30_epoch_industry", "deps": ["0A1104020000001F"]},
    {"task": "0A11040200000021", "kind": "item_any", "items": "thermal:machine_frame", "n": 4, "q": "e3_t01", "f": "30_epoch_industry", "deps": ["0A11040200000007"]},
    {"task": "0A11040200000022", "kind": "item_any", "items": "thermal:iron_gear", "n": 16, "q": "e3_t02", "f": "30_epoch_industry", "deps": ["0A11040200000021"]},
    {"task": "0A11040200000023", "kind": "item_any", "items": "thermal:gold_gear|minecraft:gold_ingot", "n": 8, "q": "e3_t03", "f": "30_epoch_industry", "deps": ["0A11040200000022"]},
    {"task": "0A11040200000024", "kind": "item_any", "items": "thermal:bronze_ingot|minecraft:iron_ingot", "n": 32, "q": "e3_t04", "f": "30_epoch_industry", "deps": ["0A11040200000023"]},
    {"task": "0A11040200000025", "kind": "item_any", "items": "thermal:steel_ingot", "n": 32, "q": "e3_t05", "f": "30_epoch_industry", "deps": ["0A11040200000024"]},
    {"task": "0A11040200000026", "kind": "item_any", "items": "thermal:electrum_ingot|minecraft:gold_ingot", "n": 16, "q": "e3_t06", "f": "30_epoch_industry", "deps": ["0A11040200000025"]},
    {"task": "0A11040200000027", "kind": "item_any", "items": "thermal:invar_ingot|minecraft:iron_ingot", "n": 16, "q": "e3_t07", "f": "30_epoch_industry", "deps": ["0A11040200000026"]},
    {"task": "0A11040200000028", "kind": "item_any", "items": "thermal:constantan_ingot|minecraft:copper_ingot", "n": 16, "q": "e3_t08", "f": "30_epoch_industry", "deps": ["0A11040200000027"]},
    {"task": "0A11040200000029", "kind": "item_any", "items": "thermal:signalum_ingot|minecraft:redstone", "n": 16, "q": "e3_t09", "f": "30_epoch_industry", "deps": ["0A11040200000028"]},
    {"task": "0A1104020000002A", "kind": "item_any", "items": "thermal:lumium_ingot|minecraft:glowstone_dust", "n": 16, "q": "e3_t10", "f": "30_epoch_industry", "deps": ["0A11040200000029"]},
    {"task": "0A1104020000002B", "kind": "item_any", "items": "thermal:machine_frame", "n": 2, "q": "e3_t11", "f": "30_epoch_industry", "deps": ["0A1104020000002A"]},
    {"task": "0A1104020000002C", "kind": "building", "word": "mech", "n": 2, "q": "e3_t11", "f": "30_epoch_industry", "deps": ["0A1104020000002A"]},
    {"task": "0A1104020000002D", "kind": "item_any", "items": "mekanism:basic_control_circuit", "n": 32, "q": "e3_k01", "f": "30_epoch_industry", "deps": ["0A11040200000009", "0A1104020000002B", "0A1104020000002C"]},
    {"task": "0A1104020000002E", "kind": "item_any", "items": "mekanism:ingot_steel", "n": 64, "q": "e3_k02", "f": "30_epoch_industry", "deps": ["0A1104020000002D"]},
    {"task": "0A1104020000002F", "kind": "item_any", "items": "mekanism:ingot_osmium|minecraft:iron_ingot", "n": 32, "q": "e3_k03", "f": "30_epoch_industry", "deps": ["0A1104020000002E"]},
    {"task": "0A11040200000030", "kind": "item_any", "items": "mekanism:enriched_carbon|minecraft:coal", "n": 16, "q": "e3_k04", "f": "30_epoch_industry", "deps": ["0A1104020000002F"]},
    {"task": "0A11040200000031", "kind": "item_any", "items": "mekanism:enriched_redstone|minecraft:redstone", "n": 16, "q": "e3_k05", "f": "30_epoch_industry", "deps": ["0A11040200000030"]},
    {"task": "0A11040200000032", "kind": "item_any", "items": "mekanism:enriched_diamond|minecraft:diamond", "n": 8, "q": "e3_k06", "f": "30_epoch_industry", "deps": ["0A11040200000031"]},
    {"task": "0A11040200000033", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 8, "q": "e3_k07", "f": "30_epoch_industry", "deps": ["0A11040200000032"]},
    {"task": "0A11040200000034", "kind": "item_any", "items": "mekanism:alloy_reinforced|mekanism:alloy_atomic", "n": 8, "q": "e3_k08", "f": "30_epoch_industry", "deps": ["0A11040200000033"]},
    {"task": "0A11040200000035", "kind": "item_any", "items": "mekanism:energy_tablet|minecraft:redstone_block", "n": 4, "q": "e3_k09", "f": "30_epoch_industry", "deps": ["0A11040200000034"]},
    {"task": "0A11040200000036", "kind": "item_any", "items": "mekanism:basic_control_circuit", "n": 16, "q": "e3_k10", "f": "30_epoch_industry", "deps": ["0A11040200000035"]},
    {"task": "0A11040200000037", "kind": "building", "word": "mech", "n": 2, "q": "e3_k10", "f": "30_epoch_industry", "deps": ["0A11040200000035"]},
    {"task": "0A11040200000038", "kind": "item_any", "items": "arcanopolis:reinforced_casing", "n": 16, "q": "e3_p01", "f": "30_epoch_industry", "deps": ["0A1104020000002E"]},
    {"task": "0A11040200000039", "kind": "item_any", "items": "mekanism:ingot_steel", "n": 128, "q": "e3_p02", "f": "30_epoch_industry", "deps": ["0A11040200000038"]},
    {"task": "0A1104020000003A", "kind": "item_any", "items": "mekanism:basic_control_circuit", "n": 64, "q": "e3_p03", "f": "30_epoch_industry", "deps": ["0A11040200000039"]},
    {"task": "0A1104020000003B", "kind": "item_any", "items": "minecraft:coal", "n": 256, "q": "e3_p04", "f": "30_epoch_industry", "deps": ["0A1104020000003A"]},
    {"task": "0A1104020000003C", "kind": "item_any", "items": "minecraft:iron_ingot", "n": 256, "q": "e3_p05", "f": "30_epoch_industry", "deps": ["0A1104020000003B"]},
    {"task": "0A1104020000003D", "kind": "item_any", "items": "minecraft:gold_ingot", "n": 64, "q": "e3_p06", "f": "30_epoch_industry", "deps": ["0A1104020000003C"]},
    {"task": "0A1104020000003E", "kind": "item_any", "items": "mekanism:ingot_osmium|minecraft:iron_ingot", "n": 64, "q": "e3_p07", "f": "30_epoch_industry", "deps": ["0A1104020000003D"]},
    {"task": "0A1104020000003F", "kind": "building", "word": "miner", "n": 4, "q": "e3_p07", "f": "30_epoch_industry", "deps": ["0A1104020000003D"]},
    {"task": "0A11040200000040", "kind": "item_any", "items": "mekanism:energy_tablet|minecraft:redstone_block", "n": 2, "q": "e3_p08", "f": "30_epoch_industry", "deps": ["0A1104020000003E", "0A1104020000003F"]},
    {"task": "0A11040200000041", "kind": "building", "word": "warehouse", "n": 4, "q": "e3_p08", "f": "30_epoch_industry", "deps": ["0A1104020000003E", "0A1104020000003F"]},
    {"task": "0A11040200000042", "kind": "item_any", "items": "arcanopolis:reinforced_casing", "n": 8, "q": "e3_p09", "f": "30_epoch_industry", "deps": ["0A1104020000002B", "0A1104020000002C", "0A11040200000040", "0A11040200000041"]},
    {"task": "0A11040200000043", "kind": "building", "word": "mech", "n": 2, "q": "e3_p09", "f": "30_epoch_industry", "deps": ["0A1104020000002B", "0A1104020000002C", "0A11040200000040", "0A11040200000041"]},
    {"task": "0A11040200000044", "kind": "item_any", "items": "thermal:machine_frame", "n": 2, "q": "e3_x01", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A11040200000045", "kind": "building", "word": "mech", "n": 2, "q": "e3_x01", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A11040200000046", "kind": "item_any", "items": "mekanism:basic_control_circuit", "n": 16, "q": "e3_x02", "f": "30_epoch_industry", "deps": ["0A11040200000044", "0A11040200000045"]},
    {"task": "0A11040200000047", "kind": "building", "word": "warehouse", "n": 4, "q": "e3_x02", "f": "30_epoch_industry", "deps": ["0A11040200000044", "0A11040200000045"]},
    {"task": "0A11040200000048", "kind": "item_any", "items": "mekanism:ingot_steel", "n": 32, "q": "e3_x03", "f": "30_epoch_industry", "deps": ["0A11040200000046", "0A11040200000047"]},
    {"task": "0A11040200000049", "kind": "building", "word": "university", "n": 2, "q": "e3_x03", "f": "30_epoch_industry", "deps": ["0A11040200000046", "0A11040200000047"]},
    {"task": "0A1104020000004A", "kind": "item_any", "items": "create:precision_mechanism", "n": 16, "q": "e3_x04", "f": "30_epoch_industry", "deps": ["0A11040200000048", "0A11040200000049"]},
    {"task": "0A1104020000004B", "kind": "building", "word": "mech", "n": 2, "q": "e3_x04", "f": "30_epoch_industry", "deps": ["0A11040200000048", "0A11040200000049"]},
    {"task": "0A1104020000004C", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 32, "q": "e3_x05", "f": "30_epoch_industry", "deps": ["0A1104020000004A", "0A1104020000004B"]},
    {"task": "0A1104020000004D", "kind": "building", "word": "mech", "n": 2, "q": "e3_x05", "f": "30_epoch_industry", "deps": ["0A1104020000004A", "0A1104020000004B"]},
    {"task": "0A1104020000004E", "kind": "item_any", "items": "arcanopolis:technical_passport", "n": 1, "q": "e3_x06", "f": "30_epoch_industry", "deps": ["0A1104020000000E", "0A1104020000004C", "0A1104020000004D"]},
    {"task": "0A1104020000004F", "kind": "townhall", "n": 3, "q": "e3_x06", "f": "30_epoch_industry", "deps": ["0A1104020000000E", "0A1104020000004C", "0A1104020000004D"]},
    {"task": "0A11040200000050", "kind": "item_any", "items": "minecraft:rail", "n": 32, "q": "e3_r01", "f": "30_epoch_industry", "deps": ["0A1104020000003B"]},
    {"task": "0A11040200000051", "kind": "item_any", "items": "minecraft:minecart", "n": 4, "q": "e3_r02", "f": "30_epoch_industry", "deps": ["0A11040200000050"]},
    {"task": "0A11040200000052", "kind": "item_any", "items": "minecraft:powered_rail", "n": 8, "q": "e3_r03", "f": "30_epoch_industry", "deps": ["0A11040200000051"]},
    {"task": "0A11040200000053", "kind": "item_any", "items": "minecraft:hopper", "n": 16, "q": "e3_r04", "f": "30_epoch_industry", "deps": ["0A11040200000052"]},
    {"task": "0A11040200000054", "kind": "item_any", "items": "thermal:machine_frame", "n": 4, "q": "e3pz01", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A11040200000055", "kind": "building", "word": "mech", "n": 2, "q": "e3pz01", "f": "30_epoch_industry", "deps": ["0A11040200000001"]},
    {"task": "0A11040200000056", "kind": "item_any", "items": "mekanism:enrichment_chamber", "n": 2, "q": "e3pz02", "f": "30_epoch_industry", "deps": ["0A11040200000054", "0A11040200000055"]},
    {"task": "0A11040200000057", "kind": "item_any", "items": "mekanism:basic_control_circuit", "n": 32, "q": "e3pz02", "f": "30_epoch_industry", "deps": ["0A11040200000054", "0A11040200000055"]},
    {"task": "0A11040200000058", "kind": "item_any", "items": "mekanism:ingot_steel", "n": 256, "q": "e3pz03", "f": "30_epoch_industry", "deps": ["0A11040200000056", "0A11040200000057"]},
    {"task": "0A11040200000059", "kind": "item_any", "items": "mekanism:energy_tablet|minecraft:redstone_block", "n": 4, "q": "e3pz04", "f": "30_epoch_industry", "deps": ["0A11040200000058"]},
    {"task": "0A1104020000005A", "kind": "building", "word": "mech", "n": 2, "q": "e3pz04", "f": "30_epoch_industry", "deps": ["0A11040200000058"]},
    {"task": "0A1104020000005B", "kind": "always", "q": "e3_tr", "f": "30_epoch_industry", "deps": ["0A1104020000000E"]},
    {"task": "0A11050200000001", "kind": "townhall", "n": 4, "q": "hub", "f": "40_epoch_magic", "deps": ["0A1104020000000E"]},
    {"task": "0A11050200000002", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 32, "q": "ars_base", "f": "40_epoch_magic", "deps": ["0A11050200000001"]},
    {"task": "0A11050200000003", "kind": "always", "q": "ars_helper", "f": "40_epoch_magic", "deps": ["0A11050200000002"]},
    {"task": "0A11050200000005", "kind": "item_any", "items": "botania:mana_pool", "n": 1, "q": "mana_pool", "f": "40_epoch_magic", "deps": ["0A11050200000001"]},
    {"task": "0A11050200000006", "kind": "item_any", "items": "botania:terrasteel_ingot", "n": 2, "q": "mana_auto", "f": "40_epoch_magic", "deps": ["0A11050200000005"]},
    {"task": "0A11050200000007", "kind": "item_any", "items": "bloodmagic:altar", "n": 1, "q": "altar", "f": "40_epoch_magic", "deps": ["0A11050200000001"]},
    {"task": "0A11050200000008", "kind": "item_any", "items": "bloodmagic:blankslate", "n": 4, "q": "slates", "f": "40_epoch_magic", "deps": ["0A11050200000007"]},
    {"task": "0A1105020000000A", "kind": "always", "q": "alchemy", "f": "40_epoch_magic", "deps": ["0A11050200000001"]},
    {"task": "0A1105020000000B", "kind": "always", "q": "pewter", "f": "40_epoch_magic", "deps": ["0A1105020000000A"]},
    {"task": "0A1105020000000C", "kind": "building", "word": "library", "n": 2, "q": "lab", "f": "40_epoch_magic", "deps": ["0A11050200000003", "0A11050200000006", "0A11050200000008", "0A1105020000000B", "0A1105020000000E", "0A1105020000000F", "0A11050200000019", "0A11050200000023", "0A11050200000024", "0A1105020000002D", "0A1105020000002E", "0A11050200000034", "0A11050200000035", "0A1105020000003D", "0A1105020000003E", "0A11050200000046", "0A11050200000052", "0A11050200000053", "0A11050200000058", "0A11050200000059"]},
    {"task": "0A1105020000000D", "kind": "building", "word": "library", "n": 2, "q": "lab", "f": "40_epoch_magic", "deps": ["0A11050200000003", "0A11050200000006", "0A11050200000008", "0A1105020000000B", "0A1105020000000E", "0A1105020000000F", "0A11050200000019", "0A11050200000023", "0A11050200000024", "0A1105020000002D", "0A1105020000002E", "0A11050200000034", "0A11050200000035", "0A1105020000003D", "0A1105020000003E", "0A11050200000046", "0A11050200000052", "0A11050200000053", "0A11050200000058", "0A11050200000059"]},
    {"task": "0A1105020000000E", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 32, "q": "source_stock", "f": "40_epoch_magic", "deps": ["0A11050200000002"]},
    {"task": "0A1105020000000F", "kind": "item_any", "items": "botania:terrasteel_ingot", "n": 4, "q": "terrasteel_pact", "f": "40_epoch_magic", "deps": ["0A11050200000006"]},
    {"task": "0A11050200000010", "kind": "citizens", "n": 36, "q": "e4_c01", "f": "40_epoch_magic", "deps": ["0A11050200000001"]},
    {"task": "0A11050200000011", "kind": "citizens", "n": 40, "q": "e4_c02", "f": "40_epoch_magic", "deps": ["0A11050200000010"]},
    {"task": "0A11050200000012", "kind": "building", "word": "library", "n": 4, "q": "e4_c03", "f": "40_epoch_magic", "deps": ["0A11050200000011"]},
    {"task": "0A11050200000013", "kind": "building", "word": "university", "n": 3, "q": "e4_c04", "f": "40_epoch_magic", "deps": ["0A11050200000012"]},
    {"task": "0A11050200000014", "kind": "building", "word": "school", "n": 3, "q": "e4_c05", "f": "40_epoch_magic", "deps": ["0A11050200000013"]},
    {"task": "0A11050200000015", "kind": "building", "word": "hospital", "n": 3, "q": "e4_c06", "f": "40_epoch_magic", "deps": ["0A11050200000014"]},
    {"task": "0A11050200000016", "kind": "building", "word": "mech", "n": 3, "q": "e4_c07", "f": "40_epoch_magic", "deps": ["0A11050200000015"]},
    {"task": "0A11050200000017", "kind": "building", "word": "cook", "n": 5, "q": "e4_c08", "f": "40_epoch_magic", "deps": ["0A11050200000016"]},
    {"task": "0A11050200000018", "kind": "building", "word": "guard", "n": 5, "q": "e4_c09", "f": "40_epoch_magic", "deps": ["0A11050200000017"]},
    {"task": "0A11050200000019", "kind": "building", "word": "warehouse", "n": 5, "q": "e4_c10", "f": "40_epoch_magic", "deps": ["0A11050200000018"]},
    {"task": "0A1105020000001A", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 64, "q": "e4_n01", "f": "40_epoch_magic", "deps": ["0A11050200000002"]},
    {"task": "0A1105020000001B", "kind": "item_any", "items": "ars_nouveau:sourcestone", "n": 128, "q": "e4_n02", "f": "40_epoch_magic", "deps": ["0A1105020000001A"]},
    {"task": "0A1105020000001C", "kind": "item_any", "items": "minecraft:experience_bottle", "n": 32, "q": "e4_n03", "f": "40_epoch_magic", "deps": ["0A1105020000001B"]},
    {"task": "0A1105020000001D", "kind": "item_any", "items": "minecraft:potion|minecraft:glass_bottle", "n": 16, "q": "e4_n04", "f": "40_epoch_magic", "deps": ["0A1105020000001C"]},
    {"task": "0A1105020000001E", "kind": "item_any", "items": "minecraft:book", "n": 32, "q": "e4_n05", "f": "40_epoch_magic", "deps": ["0A1105020000001D"]},
    {"task": "0A1105020000001F", "kind": "building", "word": "library", "n": 4, "q": "e4_n05", "f": "40_epoch_magic", "deps": ["0A1105020000001D"]},
    {"task": "0A11050200000020", "kind": "item_any", "items": "minecraft:enchanting_table", "n": 2, "q": "e4_n06", "f": "40_epoch_magic", "deps": ["0A1105020000001E", "0A1105020000001F"]},
    {"task": "0A11050200000021", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 32, "q": "e4_n07", "f": "40_epoch_magic", "deps": ["0A11050200000020"]},
    {"task": "0A11050200000022", "kind": "building", "word": "university", "n": 3, "q": "e4_n07", "f": "40_epoch_magic", "deps": ["0A11050200000020"]},
    {"task": "0A11050200000023", "kind": "item_any", "items": "minecraft:experience_bottle", "n": 8, "q": "e4_n08", "f": "40_epoch_magic", "deps": ["0A11050200000021", "0A11050200000022"]},
    {"task": "0A11050200000024", "kind": "building", "word": "mech", "n": 3, "q": "e4_n08", "f": "40_epoch_magic", "deps": ["0A11050200000021", "0A11050200000022"]},
    {"task": "0A11050200000025", "kind": "item_any", "items": "botania:livingwood|minecraft:oak_log", "n": 64, "q": "e4_b01", "f": "40_epoch_magic", "deps": ["0A11050200000005"]},
    {"task": "0A11050200000026", "kind": "item_any", "items": "botania:livingrock|minecraft:stone", "n": 64, "q": "e4_b02", "f": "40_epoch_magic", "deps": ["0A11050200000025"]},
    {"task": "0A11050200000027", "kind": "item_any", "items": "botania:manasteel_ingot|minecraft:iron_ingot", "n": 32, "q": "e4_b03", "f": "40_epoch_magic", "deps": ["0A11050200000026"]},
    {"task": "0A11050200000028", "kind": "item_any", "items": "botania:mana_diamond|minecraft:diamond", "n": 8, "q": "e4_b04", "f": "40_epoch_magic", "deps": ["0A11050200000027"]},
    {"task": "0A11050200000029", "kind": "item_any", "items": "botania:mana_pearl", "n": 16, "q": "e4_b05", "f": "40_epoch_magic", "deps": ["0A11050200000028"]},
    {"task": "0A1105020000002A", "kind": "item_any", "items": "botania:mana_pool", "n": 2, "q": "e4_b06", "f": "40_epoch_magic", "deps": ["0A11050200000012", "0A11050200000029"]},
    {"task": "0A1105020000002B", "kind": "item_any", "items": "botania:rune|minecraft:stone", "n": 16, "q": "e4_b07", "f": "40_epoch_magic", "deps": ["0A1105020000002A"]},
    {"task": "0A1105020000002C", "kind": "item_any", "items": "botania:terrasteel_ingot", "n": 4, "q": "e4_b08", "f": "40_epoch_magic", "deps": ["0A1105020000002B"]},
    {"task": "0A1105020000002D", "kind": "item_any", "items": "botania:terrasteel_ingot", "n": 8, "q": "e4_b09", "f": "40_epoch_magic", "deps": ["0A1105020000002C"]},
    {"task": "0A1105020000002E", "kind": "building", "word": "library", "n": 4, "q": "e4_b09", "f": "40_epoch_magic", "deps": ["0A1105020000002C"]},
    {"task": "0A1105020000002F", "kind": "item_any", "items": "bloodmagic:altar", "n": 2, "q": "e4_bl01", "f": "40_epoch_magic", "deps": ["0A11050200000007"]},
    {"task": "0A11050200000030", "kind": "item_any", "items": "bloodmagic:blankslate", "n": 32, "q": "e4_bl02", "f": "40_epoch_magic", "deps": ["0A1105020000002F"]},
    {"task": "0A11050200000031", "kind": "item_any", "items": "bloodmagic:reinforcedslate|minecraft:stone_slab", "n": 16, "q": "e4_bl03", "f": "40_epoch_magic", "deps": ["0A11050200000030"]},
    {"task": "0A11050200000032", "kind": "item_any", "items": "bloodmagic:blood_rune|minecraft:stone_bricks", "n": 16, "q": "e4_bl04", "f": "40_epoch_magic", "deps": ["0A11050200000031"]},
    {"task": "0A11050200000033", "kind": "item_any", "items": "bloodmagic:sacrificial_dagger|minecraft:iron_sword", "n": 1, "q": "e4_bl05", "f": "40_epoch_magic", "deps": ["0A11050200000032"]},
    {"task": "0A11050200000034", "kind": "item_any", "items": "bloodmagic:blankslate", "n": 16, "q": "e4_bl06", "f": "40_epoch_magic", "deps": ["0A11050200000033"]},
    {"task": "0A11050200000035", "kind": "building", "word": "library", "n": 4, "q": "e4_bl06", "f": "40_epoch_magic", "deps": ["0A11050200000033"]},
    {"task": "0A11050200000036", "kind": "item_any", "items": "eidolon:pewter_ingot|minecraft:iron_ingot", "n": 16, "q": "e4_e01", "f": "40_epoch_magic", "deps": ["0A11050200000001"]},
    {"task": "0A11050200000037", "kind": "item_any", "items": "eidolon:arcane_gold_ingot|minecraft:gold_ingot", "n": 16, "q": "e4_e02", "f": "40_epoch_magic", "deps": ["0A11050200000036"]},
    {"task": "0A11050200000038", "kind": "item_any", "items": "eidolon:crucible|minecraft:cauldron", "n": 1, "q": "e4_e03", "f": "40_epoch_magic", "deps": ["0A11050200000037"]},
    {"task": "0A11050200000039", "kind": "item_any", "items": "minecraft:paper", "n": 32, "q": "e4_e04", "f": "40_epoch_magic", "deps": ["0A11050200000038"]},
    {"task": "0A1105020000003A", "kind": "item_any", "items": "eidolon:pewter_ingot|minecraft:iron_ingot", "n": 8, "q": "e4_e05", "f": "40_epoch_magic", "deps": ["0A11050200000012", "0A11050200000039"]},
    {"task": "0A1105020000003B", "kind": "building", "word": "library", "n": 4, "q": "e4_e05", "f": "40_epoch_magic", "deps": ["0A11050200000012", "0A11050200000039"]},
    {"task": "0A1105020000003C", "kind": "item_any", "items": "arcanopolis:ritual_regulator", "n": 2, "q": "e4_e06", "f": "40_epoch_magic", "deps": ["0A1105020000003A", "0A1105020000003B"]},
    {"task": "0A1105020000003D", "kind": "item_any", "items": "arcanopolis:ritual_regulator", "n": 1, "q": "e4_e07", "f": "40_epoch_magic", "deps": ["0A11050200000021", "0A11050200000022", "0A1105020000003C"]},
    {"task": "0A1105020000003E", "kind": "building", "word": "library", "n": 4, "q": "e4_e07", "f": "40_epoch_magic", "deps": ["0A11050200000021", "0A11050200000022", "0A1105020000003C"]},
    {"task": "0A1105020000003F", "kind": "item_any", "items": "minecraft:glowstone_dust", "n": 64, "q": "e4_i01", "f": "40_epoch_magic", "deps": ["0A1105020000001B"]},
    {"task": "0A11050200000040", "kind": "item_any", "items": "minecraft:redstone", "n": 128, "q": "e4_i02", "f": "40_epoch_magic", "deps": ["0A1105020000003F"]},
    {"task": "0A11050200000041", "kind": "item_any", "items": "minecraft:quartz", "n": 64, "q": "e4_i03", "f": "40_epoch_magic", "deps": ["0A11050200000040"]},
    {"task": "0A11050200000042", "kind": "item_any", "items": "minecraft:amethyst_shard", "n": 32, "q": "e4_i04", "f": "40_epoch_magic", "deps": ["0A11050200000041"]},
    {"task": "0A11050200000043", "kind": "item_any", "items": "minecraft:gunpowder", "n": 32, "q": "e4_i05", "f": "40_epoch_magic", "deps": ["0A11050200000042"]},
    {"task": "0A11050200000044", "kind": "item_any", "items": "minecraft:slime_ball", "n": 16, "q": "e4_i06", "f": "40_epoch_magic", "deps": ["0A11050200000043"]},
    {"task": "0A11050200000045", "kind": "item_any", "items": "minecraft:spider_eye", "n": 16, "q": "e4_i07", "f": "40_epoch_magic", "deps": ["0A11050200000044"]},
    {"task": "0A11050200000046", "kind": "item_any", "items": "minecraft:chorus_fruit", "n": 32, "q": "e4_i08", "f": "40_epoch_magic", "deps": ["0A11050200000045"]},
    {"task": "0A11050200000047", "kind": "item_any", "items": "minecraft:nether_wart", "n": 16, "q": "e4_z01", "f": "40_epoch_magic", "deps": ["0A1105020000002F"]},
    {"task": "0A11050200000048", "kind": "item_any", "items": "minecraft:potion|minecraft:glass_bottle", "n": 8, "q": "e4_z02", "f": "40_epoch_magic", "deps": ["0A11050200000047"]},
    {"task": "0A11050200000049", "kind": "item_any", "items": "minecraft:blaze_powder", "n": 16, "q": "e4_z03", "f": "40_epoch_magic", "deps": ["0A11050200000048"]},
    {"task": "0A1105020000004A", "kind": "item_any", "items": "minecraft:ghast_tear", "n": 4, "q": "e4_z04", "f": "40_epoch_magic", "deps": ["0A11050200000049"]},
    {"task": "0A1105020000004B", "kind": "item_any", "items": "minecraft:magma_cream", "n": 8, "q": "e4_z05", "f": "40_epoch_magic", "deps": ["0A1105020000004A"]},
    {"task": "0A1105020000004C", "kind": "item_any", "items": "minecraft:glistering_melon_slice", "n": 8, "q": "e4_z06", "f": "40_epoch_magic", "deps": ["0A1105020000004B"]},
    {"task": "0A1105020000004D", "kind": "item_any", "items": "minecraft:nether_wart", "n": 8, "q": "e4_z07", "f": "40_epoch_magic", "deps": ["0A1105020000004C"]},
    {"task": "0A1105020000004E", "kind": "building", "word": "hospital", "n": 3, "q": "e4_z07", "f": "40_epoch_magic", "deps": ["0A1105020000004C"]},
    {"task": "0A1105020000004F", "kind": "item_any", "items": "minecraft:glass_bottle", "n": 32, "q": "e4_g01", "f": "40_epoch_magic", "deps": ["0A1105020000004D", "0A1105020000004E"]},
    {"task": "0A11050200000050", "kind": "building", "word": "hospital", "n": 3, "q": "e4_g01", "f": "40_epoch_magic", "deps": ["0A1105020000004D", "0A1105020000004E"]},
    {"task": "0A11050200000051", "kind": "item_any", "items": "minecraft:nether_wart", "n": 32, "q": "e4_g02", "f": "40_epoch_magic", "deps": ["0A1105020000004F", "0A11050200000050"]},
    {"task": "0A11050200000052", "kind": "item_any", "items": "minecraft:quartz", "n": 32, "q": "e4_g03", "f": "40_epoch_magic", "deps": ["0A11050200000051"]},
    {"task": "0A11050200000053", "kind": "building", "word": "library", "n": 4, "q": "e4_g03", "f": "40_epoch_magic", "deps": ["0A11050200000051"]},
    {"task": "0A11050200000054", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 256, "q": "e4pz01", "f": "40_epoch_magic", "deps": ["0A11050200000001"]},
    {"task": "0A11050200000055", "kind": "building", "word": "library", "n": 4, "q": "e4pz01", "f": "40_epoch_magic", "deps": ["0A11050200000001"]},
    {"task": "0A11050200000056", "kind": "item_any", "items": "arcanopolis:ritual_regulator", "n": 3, "q": "e4pz02", "f": "40_epoch_magic", "deps": ["0A11050200000054", "0A11050200000055"]},
    {"task": "0A11050200000057", "kind": "building", "word": "mech", "n": 3, "q": "e4pz02", "f": "40_epoch_magic", "deps": ["0A11050200000054", "0A11050200000055"]},
    {"task": "0A11050200000058", "kind": "item_any", "items": "minecraft:glass_bottle", "n": 256, "q": "e4pz03", "f": "40_epoch_magic", "deps": ["0A11050200000056", "0A11050200000057"]},
    {"task": "0A11050200000059", "kind": "building", "word": "hospital", "n": 3, "q": "e4pz03", "f": "40_epoch_magic", "deps": ["0A11050200000056", "0A11050200000057"]},
    {"task": "0A1105020000005A", "kind": "always", "q": "e4_tr", "f": "40_epoch_magic", "deps": ["0A1105020000000C", "0A1105020000000D"]},
    {"task": "0A11060200000001", "kind": "townhall", "n": 5, "q": "hub", "f": "50_epoch_network", "deps": ["0A1105020000000C", "0A1105020000000D"]},
    {"task": "0A11060200000002", "kind": "item_any", "items": "ae2:controller", "n": 1, "q": "ae2_base", "f": "50_epoch_network", "deps": ["0A11060200000001"]},
    {"task": "0A11060200000003", "kind": "always", "q": "cells", "f": "50_epoch_network", "deps": ["0A11060200000002"]},
    {"task": "0A11060200000004", "kind": "always", "q": "patterns", "f": "50_epoch_network", "deps": ["0A11060200000003"]},
    {"task": "0A11060200000006", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 4, "q": "lines", "f": "50_epoch_network", "deps": ["0A11060200000002"]},
    {"task": "0A11060200000007", "kind": "building", "word": "mechanic", "n": 3, "q": "project", "f": "50_epoch_network", "deps": ["0A11060200000004", "0A11060200000006", "0A11060200000009", "0A1106020000000A", "0A11060200000012", "0A1106020000001C", "0A1106020000001D", "0A11060200000025", "0A11060200000026", "0A1106020000002F", "0A11060200000030", "0A11060200000038", "0A11060200000039", "0A11060200000041", "0A11060200000047", "0A11060200000048", "0A1106020000005A", "0A1106020000005B", "0A1106020000005F", "0A11060200000060", "0A11060200000061"]},
    {"task": "0A11060200000008", "kind": "item_any", "items": "arcanopolis:automation_core", "n": 1, "q": "project", "f": "50_epoch_network", "deps": ["0A11060200000004", "0A11060200000006", "0A11060200000009", "0A1106020000000A", "0A11060200000012", "0A1106020000001C", "0A1106020000001D", "0A11060200000025", "0A11060200000026", "0A1106020000002F", "0A11060200000030", "0A11060200000038", "0A11060200000039", "0A11060200000041", "0A11060200000047", "0A11060200000048", "0A1106020000005A", "0A1106020000005B", "0A1106020000005F", "0A11060200000060", "0A11060200000061"]},
    {"task": "0A11060200000009", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 8, "q": "circuits_ultimate", "f": "50_epoch_network", "deps": ["0A11060200000006"]},
    {"task": "0A1106020000000A", "kind": "item_any", "items": "minecraft:ender_pearl", "n": 16, "q": "pearl_stock", "f": "50_epoch_network", "deps": ["0A11060200000002"]},
    {"task": "0A1106020000000B", "kind": "citizens", "n": 44, "q": "e5_c01", "f": "50_epoch_network", "deps": ["0A11060200000001"]},
    {"task": "0A1106020000000C", "kind": "citizens", "n": 48, "q": "e5_c02", "f": "50_epoch_network", "deps": ["0A1106020000000B"]},
    {"task": "0A1106020000000D", "kind": "citizens", "n": 52, "q": "e5_c03", "f": "50_epoch_network", "deps": ["0A1106020000000C"]},
    {"task": "0A1106020000000E", "kind": "building", "word": "mech", "n": 4, "q": "e5_c04", "f": "50_epoch_network", "deps": ["0A1106020000000D"]},
    {"task": "0A1106020000000F", "kind": "building", "word": "university", "n": 4, "q": "e5_c05", "f": "50_epoch_network", "deps": ["0A1106020000000E"]},
    {"task": "0A11060200000010", "kind": "building", "word": "hospital", "n": 4, "q": "e5_c06", "f": "50_epoch_network", "deps": ["0A1106020000000F"]},
    {"task": "0A11060200000011", "kind": "building", "word": "library", "n": 5, "q": "e5_c07", "f": "50_epoch_network", "deps": ["0A11060200000010"]},
    {"task": "0A11060200000012", "kind": "building", "word": "miner", "n": 5, "q": "e5_c08", "f": "50_epoch_network", "deps": ["0A11060200000011"]},
    {"task": "0A11060200000013", "kind": "item_any", "items": "ae2:certus_quartz_crystal|minecraft:quartz", "n": 32, "q": "e5_a01", "f": "50_epoch_network", "deps": ["0A11060200000002"]},
    {"task": "0A11060200000014", "kind": "item_any", "items": "ae2:fluix_crystal|minecraft:amethyst_shard", "n": 16, "q": "e5_a02", "f": "50_epoch_network", "deps": ["0A11060200000013"]},
    {"task": "0A11060200000015", "kind": "item_any", "items": "ae2:certus_quartz_dust|minecraft:quartz", "n": 32, "q": "e5_a03", "f": "50_epoch_network", "deps": ["0A11060200000014"]},
    {"task": "0A11060200000016", "kind": "item_any", "items": "ae2:engineering_processor|mekanism:basic_control_circuit", "n": 16, "q": "e5_a04", "f": "50_epoch_network", "deps": ["0A11060200000015"]},
    {"task": "0A11060200000017", "kind": "item_any", "items": "ae2:fluix_glass_cable|minecraft:glass_pane", "n": 16, "q": "e5_a05", "f": "50_epoch_network", "deps": ["0A11060200000016"]},
    {"task": "0A11060200000018", "kind": "item_any", "items": "ae2:controller|minecraft:redstone_block", "n": 1, "q": "e5_a06", "f": "50_epoch_network", "deps": ["0A11060200000017"]},
    {"task": "0A11060200000019", "kind": "item_any", "items": "ae2:terminal|minecraft:glass", "n": 2, "q": "e5_a07", "f": "50_epoch_network", "deps": ["0A11060200000018"]},
    {"task": "0A1106020000001A", "kind": "item_any", "items": "ae2:cell_component_1k|minecraft:redstone", "n": 8, "q": "e5_a08", "f": "50_epoch_network", "deps": ["0A11060200000019"]},
    {"task": "0A1106020000001B", "kind": "item_any", "items": "ae2:blank_pattern|minecraft:paper", "n": 16, "q": "e5_a09", "f": "50_epoch_network", "deps": ["0A1106020000001A"]},
    {"task": "0A1106020000001C", "kind": "item_any", "items": "ae2:blank_pattern|minecraft:paper", "n": 8, "q": "e5_a10", "f": "50_epoch_network", "deps": ["0A1106020000001B"]},
    {"task": "0A1106020000001D", "kind": "building", "word": "mech", "n": 4, "q": "e5_a10", "f": "50_epoch_network", "deps": ["0A1106020000001B"]},
    {"task": "0A1106020000001E", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 16, "q": "e5_m01", "f": "50_epoch_network", "deps": ["0A1106020000000E"]},
    {"task": "0A1106020000001F", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 16, "q": "e5_m02", "f": "50_epoch_network", "deps": ["0A1106020000001E"]},
    {"task": "0A11060200000020", "kind": "item_any", "items": "mekanism:basic_energy_cube|minecraft:redstone_block", "n": 2, "q": "e5_m03", "f": "50_epoch_network", "deps": ["0A1106020000001F"]},
    {"task": "0A11060200000021", "kind": "item_any", "items": "mekanism:turbine_blade|minecraft:iron_ingot", "n": 4, "q": "e5_m04", "f": "50_epoch_network", "deps": ["0A11060200000020"]},
    {"task": "0A11060200000022", "kind": "item_any", "items": "mekanism:basic_factory|minecraft:crafting_table", "n": 2, "q": "e5_m05", "f": "50_epoch_network", "deps": ["0A11060200000021"]},
    {"task": "0A11060200000023", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 8, "q": "e5_m06", "f": "50_epoch_network", "deps": ["0A11060200000022"]},
    {"task": "0A11060200000024", "kind": "building", "word": "mech", "n": 4, "q": "e5_m06", "f": "50_epoch_network", "deps": ["0A11060200000022"]},
    {"task": "0A11060200000025", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 8, "q": "e5_m07", "f": "50_epoch_network", "deps": ["0A11060200000023", "0A11060200000024"]},
    {"task": "0A11060200000026", "kind": "building", "word": "mech", "n": 4, "q": "e5_m07", "f": "50_epoch_network", "deps": ["0A11060200000023", "0A11060200000024"]},
    {"task": "0A11060200000027", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 8, "q": "e5_x01", "f": "50_epoch_network", "deps": ["0A11060200000001"]},
    {"task": "0A11060200000028", "kind": "item_any", "items": "ae2:fluix_crystal|minecraft:amethyst_shard", "n": 8, "q": "e5_x01", "f": "50_epoch_network", "deps": ["0A11060200000001"]},
    {"task": "0A11060200000029", "kind": "item_any", "items": "ae2:blank_pattern|minecraft:paper", "n": 16, "q": "e5_x02", "f": "50_epoch_network", "deps": ["0A11060200000027", "0A11060200000028"]},
    {"task": "0A1106020000002A", "kind": "building", "word": "warehouse", "n": 5, "q": "e5_x02", "f": "50_epoch_network", "deps": ["0A11060200000027", "0A11060200000028"]},
    {"task": "0A1106020000002B", "kind": "item_any", "items": "mekanism:basic_energy_cube|minecraft:redstone_block", "n": 2, "q": "e5_x03", "f": "50_epoch_network", "deps": ["0A11060200000029", "0A1106020000002A"]},
    {"task": "0A1106020000002C", "kind": "building", "word": "mech", "n": 4, "q": "e5_x03", "f": "50_epoch_network", "deps": ["0A11060200000029", "0A1106020000002A"]},
    {"task": "0A1106020000002D", "kind": "item_any", "items": "arcanopolis:reinforced_casing", "n": 32, "q": "e5_x04", "f": "50_epoch_network", "deps": ["0A1106020000002B", "0A1106020000002C"]},
    {"task": "0A1106020000002E", "kind": "building", "word": "mech", "n": 4, "q": "e5_x04", "f": "50_epoch_network", "deps": ["0A1106020000002B", "0A1106020000002C"]},
    {"task": "0A1106020000002F", "kind": "item_any", "items": "minecraft:ender_pearl", "n": 16, "q": "e5_x05", "f": "50_epoch_network", "deps": ["0A1106020000002D", "0A1106020000002E"]},
    {"task": "0A11060200000030", "kind": "building", "word": "deliveryman", "n": 3, "q": "e5_x05", "f": "50_epoch_network", "deps": ["0A1106020000002D", "0A1106020000002E"]},
    {"task": "0A11060200000031", "kind": "item_any", "items": "arcanopolis:automation_core", "n": 1, "q": "e5_x06", "f": "50_epoch_network", "deps": ["0A11060200000007", "0A11060200000008", "0A1106020000002F", "0A11060200000030"]},
    {"task": "0A11060200000032", "kind": "townhall", "n": 5, "q": "e5_x06", "f": "50_epoch_network", "deps": ["0A11060200000007", "0A11060200000008", "0A1106020000002F", "0A11060200000030"]},
    {"task": "0A11060200000033", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 32, "q": "e5_p01", "f": "50_epoch_network", "deps": ["0A1106020000001F"]},
    {"task": "0A11060200000034", "kind": "item_any", "items": "mekanism:ingot_osmium|minecraft:iron_ingot", "n": 64, "q": "e5_p02", "f": "50_epoch_network", "deps": ["0A11060200000033"]},
    {"task": "0A11060200000035", "kind": "item_any", "items": "mekanism:ingot_steel", "n": 128, "q": "e5_p03", "f": "50_epoch_network", "deps": ["0A11060200000034"]},
    {"task": "0A11060200000036", "kind": "item_any", "items": "minecraft:ender_pearl", "n": 32, "q": "e5_p04", "f": "50_epoch_network", "deps": ["0A11060200000035"]},
    {"task": "0A11060200000037", "kind": "item_any", "items": "thermal:enderium_ingot", "n": 8, "q": "e5_p05", "f": "50_epoch_network", "deps": ["0A11060200000036"]},
    {"task": "0A11060200000038", "kind": "item_any", "items": "minecraft:hopper", "n": 32, "q": "e5_p06", "f": "50_epoch_network", "deps": ["0A11060200000029", "0A1106020000002A", "0A11060200000037"]},
    {"task": "0A11060200000039", "kind": "building", "word": "warehouse", "n": 5, "q": "e5_p06", "f": "50_epoch_network", "deps": ["0A11060200000029", "0A1106020000002A", "0A11060200000037"]},
    {"task": "0A1106020000003A", "kind": "item_any", "items": "minecraft:ender_chest", "n": 2, "q": "e5_h01", "f": "50_epoch_network", "deps": ["0A11060200000029", "0A1106020000002A"]},
    {"task": "0A1106020000003B", "kind": "item_any", "items": "minecraft:shulker_box", "n": 8, "q": "e5_h02", "f": "50_epoch_network", "deps": ["0A1106020000003A"]},
    {"task": "0A1106020000003C", "kind": "item_any", "items": "minecraft:hopper", "n": 32, "q": "e5_h03", "f": "50_epoch_network", "deps": ["0A1106020000003B"]},
    {"task": "0A1106020000003D", "kind": "item_any", "items": "minecraft:dropper", "n": 16, "q": "e5_h04", "f": "50_epoch_network", "deps": ["0A1106020000003C"]},
    {"task": "0A1106020000003E", "kind": "item_any", "items": "minecraft:dispenser", "n": 8, "q": "e5_h05", "f": "50_epoch_network", "deps": ["0A1106020000003D"]},
    {"task": "0A1106020000003F", "kind": "item_any", "items": "minecraft:observer", "n": 8, "q": "e5_h06", "f": "50_epoch_network", "deps": ["0A1106020000003E"]},
    {"task": "0A11060200000040", "kind": "item_any", "items": "minecraft:piston", "n": 16, "q": "e5_h07", "f": "50_epoch_network", "deps": ["0A1106020000003F"]},
    {"task": "0A11060200000041", "kind": "item_any", "items": "minecraft:sticky_piston", "n": 8, "q": "e5_h08", "f": "50_epoch_network", "deps": ["0A11060200000040"]},
    {"task": "0A11060200000042", "kind": "item_any", "items": "minecraft:redstone_block", "n": 8, "q": "e5_r01", "f": "50_epoch_network", "deps": ["0A11060200000001"]},
    {"task": "0A11060200000043", "kind": "item_any", "items": "minecraft:repeater", "n": 16, "q": "e5_r02", "f": "50_epoch_network", "deps": ["0A11060200000042"]},
    {"task": "0A11060200000044", "kind": "item_any", "items": "minecraft:comparator", "n": 16, "q": "e5_r03", "f": "50_epoch_network", "deps": ["0A1106020000003C", "0A11060200000043"]},
    {"task": "0A11060200000045", "kind": "item_any", "items": "minecraft:daylight_detector", "n": 4, "q": "e5_r04", "f": "50_epoch_network", "deps": ["0A11060200000044"]},
    {"task": "0A11060200000046", "kind": "item_any", "items": "minecraft:redstone_lamp", "n": 8, "q": "e5_r05", "f": "50_epoch_network", "deps": ["0A11060200000045"]},
    {"task": "0A11060200000047", "kind": "item_any", "items": "minecraft:iron_door", "n": 2, "q": "e5_r06", "f": "50_epoch_network", "deps": ["0A11060200000046"]},
    {"task": "0A11060200000048", "kind": "building", "word": "warehouse", "n": 5, "q": "e5_r06", "f": "50_epoch_network", "deps": ["0A11060200000046"]},
    {"task": "0A11060200000049", "kind": "item_any", "items": "minecraft:quartz", "n": 32, "q": "e5_b01", "f": "50_epoch_network", "deps": ["0A1106020000000F"]},
    {"task": "0A1106020000004A", "kind": "building", "word": "university", "n": 4, "q": "e5_b01", "f": "50_epoch_network", "deps": ["0A1106020000000F"]},
    {"task": "0A1106020000004B", "kind": "item_any", "items": "mekanism:basic_control_circuit", "n": 16, "q": "e5_b02", "f": "50_epoch_network", "deps": ["0A11060200000049", "0A1106020000004A"]},
    {"task": "0A1106020000004C", "kind": "building", "word": "hospital", "n": 4, "q": "e5_b02", "f": "50_epoch_network", "deps": ["0A11060200000049", "0A1106020000004A"]},
    {"task": "0A1106020000004D", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 8, "q": "e5_b03", "f": "50_epoch_network", "deps": ["0A1106020000004B", "0A1106020000004C"]},
    {"task": "0A1106020000004E", "kind": "building", "word": "library", "n": 5, "q": "e5_b03", "f": "50_epoch_network", "deps": ["0A1106020000004B", "0A1106020000004C"]},
    {"task": "0A1106020000004F", "kind": "item_any", "items": "minecraft:redstone_block", "n": 8, "q": "e5_b04", "f": "50_epoch_network", "deps": ["0A1106020000004D", "0A1106020000004E"]},
    {"task": "0A11060200000050", "kind": "building", "word": "school", "n": 3, "q": "e5_b04", "f": "50_epoch_network", "deps": ["0A1106020000004D", "0A1106020000004E"]},
    {"task": "0A11060200000051", "kind": "item_any", "items": "minecraft:ender_chest", "n": 2, "q": "e5_b05", "f": "50_epoch_network", "deps": ["0A1106020000004F", "0A11060200000050"]},
    {"task": "0A11060200000052", "kind": "building", "word": "warehouse", "n": 5, "q": "e5_b05", "f": "50_epoch_network", "deps": ["0A1106020000004F", "0A11060200000050"]},
    {"task": "0A11060200000053", "kind": "item_any", "items": "ae2:blank_pattern|minecraft:paper", "n": 16, "q": "e5_b06", "f": "50_epoch_network", "deps": ["0A11060200000051", "0A11060200000052"]},
    {"task": "0A11060200000054", "kind": "building", "word": "mech", "n": 4, "q": "e5_b06", "f": "50_epoch_network", "deps": ["0A11060200000051", "0A11060200000052"]},
    {"task": "0A11060200000055", "kind": "item_any", "items": "minecraft:ender_pearl", "n": 32, "q": "e5_b07", "f": "50_epoch_network", "deps": ["0A11060200000053", "0A11060200000054"]},
    {"task": "0A11060200000056", "kind": "building", "word": "deliveryman", "n": 3, "q": "e5_b07", "f": "50_epoch_network", "deps": ["0A11060200000053", "0A11060200000054"]},
    {"task": "0A11060200000057", "kind": "item_any", "items": "minecraft:ender_eye", "n": 8, "q": "e5_g01", "f": "50_epoch_network", "deps": ["0A11060200000055", "0A11060200000056"]},
    {"task": "0A11060200000058", "kind": "item_any", "items": "minecraft:end_crystal", "n": 2, "q": "e5_g02", "f": "50_epoch_network", "deps": ["0A11060200000057"]},
    {"task": "0A11060200000059", "kind": "item_any", "items": "minecraft:beacon", "n": 1, "q": "e5_g03", "f": "50_epoch_network", "deps": ["0A11060200000058"]},
    {"task": "0A1106020000005A", "kind": "item_any", "items": "minecraft:ender_chest", "n": 4, "q": "e5_g04", "f": "50_epoch_network", "deps": ["0A11060200000059"]},
    {"task": "0A1106020000005B", "kind": "building", "word": "mech", "n": 4, "q": "e5_g04", "f": "50_epoch_network", "deps": ["0A11060200000059"]},
    {"task": "0A1106020000005C", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 64, "q": "e5pz01", "f": "50_epoch_network", "deps": ["0A11060200000001"]},
    {"task": "0A1106020000005D", "kind": "item_any", "items": "ae2:blank_pattern|minecraft:paper", "n": 64, "q": "e5pz02", "f": "50_epoch_network", "deps": ["0A1106020000005C"]},
    {"task": "0A1106020000005E", "kind": "building", "word": "mech", "n": 4, "q": "e5pz02", "f": "50_epoch_network", "deps": ["0A1106020000005C"]},
    {"task": "0A1106020000005F", "kind": "item_any", "items": "minecraft:hopper", "n": 32, "q": "e5pz03", "f": "50_epoch_network", "deps": ["0A1106020000005D", "0A1106020000005E"]},
    {"task": "0A11060200000060", "kind": "item_any", "items": "minecraft:ender_chest", "n": 4, "q": "e5pz03", "f": "50_epoch_network", "deps": ["0A1106020000005D", "0A1106020000005E"]},
    {"task": "0A11060200000061", "kind": "building", "word": "warehouse", "n": 5, "q": "e5pz03", "f": "50_epoch_network", "deps": ["0A1106020000005D", "0A1106020000005E"]},
    {"task": "0A11060200000062", "kind": "always", "q": "e5_tr", "f": "50_epoch_network", "deps": ["0A11060200000007", "0A11060200000008"]},
    {"task": "0A11070200000001", "kind": "townhall", "n": 5, "q": "hub", "f": "60_epoch_cosmos", "deps": ["0A11060200000007", "0A11060200000008"]},
    {"task": "0A11070200000002", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 16, "q": "mek_late", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A11070200000003", "kind": "item_any", "items": "thermal:enderium_ingot", "n": 8, "q": "thermal_late", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A11070200000004", "kind": "item_any", "items": "minecraft:nether_star", "n": 2, "q": "rare", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A11070200000005", "kind": "item_any", "items": "arcanopolis:arcane_converter", "n": 8, "q": "center", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A11070200000006", "kind": "item_any", "items": "arcanopolis:primal_catalyst", "n": 1, "q": "catalyst", "f": "60_epoch_cosmos", "deps": ["0A11070200000002", "0A11070200000004"]},
    {"task": "0A11070200000007", "kind": "item_any", "items": "arcanopolis:heart_of_arcanopolis", "n": 1, "q": "heart", "f": "60_epoch_cosmos", "deps": ["0A11070200000003", "0A11070200000006"]},
    {"task": "0A11070200000008", "kind": "always", "q": "finale", "f": "60_epoch_cosmos", "deps": ["0A11070200000005", "0A11070200000007", "0A11070200000012", "0A11070200000013", "0A11070200000018", "0A11070200000019", "0A1107020000001E", "0A1107020000001F", "0A11070200000025", "0A11070200000026", "0A1107020000002B", "0A11070200000034", "0A1107020000003A", "0A11070200000040", "0A11070200000049", "0A1107020000004A", "0A11070200000059", "0A1107020000005A", "0A1107020000005F", "0A11070200000060"]},
    {"task": "0A11070200000009", "kind": "always", "q": "finale", "f": "60_epoch_cosmos", "deps": ["0A11070200000005", "0A11070200000007", "0A11070200000012", "0A11070200000013", "0A11070200000018", "0A11070200000019", "0A1107020000001E", "0A1107020000001F", "0A11070200000025", "0A11070200000026", "0A1107020000002B", "0A11070200000034", "0A1107020000003A", "0A11070200000040", "0A11070200000049", "0A1107020000004A", "0A11070200000059", "0A1107020000005A", "0A1107020000005F", "0A11070200000060"]},
    {"task": "0A1107020000000A", "kind": "item_any", "items": "minecraft:nether_star", "n": 2, "q": "nether_stars", "f": "60_epoch_cosmos", "deps": ["0A11070200000004"]},
    {"task": "0A1107020000000B", "kind": "item_any", "items": "minecraft:dragon_breath", "n": 4, "q": "dragon_breath", "f": "60_epoch_cosmos", "deps": ["0A11070200000006"]},
    {"task": "0A1107020000000C", "kind": "citizens", "n": 56, "q": "e6_c01", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A1107020000000D", "kind": "citizens", "n": 60, "q": "e6_c02", "f": "60_epoch_cosmos", "deps": ["0A1107020000000C"]},
    {"task": "0A1107020000000E", "kind": "building", "word": "mech", "n": 5, "q": "e6_c03", "f": "60_epoch_cosmos", "deps": ["0A1107020000000D"]},
    {"task": "0A1107020000000F", "kind": "building", "word": "university", "n": 5, "q": "e6_c04", "f": "60_epoch_cosmos", "deps": ["0A1107020000000E"]},
    {"task": "0A11070200000010", "kind": "building", "word": "hospital", "n": 5, "q": "e6_c05", "f": "60_epoch_cosmos", "deps": ["0A1107020000000F"]},
    {"task": "0A11070200000011", "kind": "building", "word": "black", "n": 5, "q": "e6_c06", "f": "60_epoch_cosmos", "deps": ["0A11070200000010"]},
    {"task": "0A11070200000012", "kind": "building", "word": "miner", "n": 5, "q": "e6_c07", "f": "60_epoch_cosmos", "deps": ["0A11070200000011"]},
    {"task": "0A11070200000013", "kind": "building", "word": "lumberjack", "n": 5, "q": "e6_c07", "f": "60_epoch_cosmos", "deps": ["0A11070200000011"]},
    {"task": "0A11070200000014", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 32, "q": "e6_k01", "f": "60_epoch_cosmos", "deps": ["0A11070200000002"]},
    {"task": "0A11070200000015", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 32, "q": "e6_k02", "f": "60_epoch_cosmos", "deps": ["0A11070200000014"]},
    {"task": "0A11070200000016", "kind": "item_any", "items": "mekanism:pellet_plutonium|minecraft:nether_star", "n": 4, "q": "e6_k03", "f": "60_epoch_cosmos", "deps": ["0A11070200000015"]},
    {"task": "0A11070200000017", "kind": "item_any", "items": "mekanism:pellet_antimatter|minecraft:dragon_breath", "n": 2, "q": "e6_k04", "f": "60_epoch_cosmos", "deps": ["0A11070200000016"]},
    {"task": "0A11070200000018", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 16, "q": "e6_k05", "f": "60_epoch_cosmos", "deps": ["0A11070200000017"]},
    {"task": "0A11070200000019", "kind": "building", "word": "mech", "n": 5, "q": "e6_k05", "f": "60_epoch_cosmos", "deps": ["0A11070200000017"]},
    {"task": "0A1107020000001A", "kind": "item_any", "items": "thermal:enderium_ingot", "n": 16, "q": "e6_t01", "f": "60_epoch_cosmos", "deps": ["0A11070200000003"]},
    {"task": "0A1107020000001B", "kind": "item_any", "items": "thermal:signalum_ingot|minecraft:redstone", "n": 32, "q": "e6_t02", "f": "60_epoch_cosmos", "deps": ["0A1107020000001A"]},
    {"task": "0A1107020000001C", "kind": "item_any", "items": "thermal:lumium_ingot|minecraft:glowstone_dust", "n": 32, "q": "e6_t03", "f": "60_epoch_cosmos", "deps": ["0A1107020000001B"]},
    {"task": "0A1107020000001D", "kind": "item_any", "items": "thermal:machine_frame", "n": 8, "q": "e6_t04", "f": "60_epoch_cosmos", "deps": ["0A1107020000001C"]},
    {"task": "0A1107020000001E", "kind": "item_any", "items": "thermal:enderium_ingot", "n": 8, "q": "e6_t05", "f": "60_epoch_cosmos", "deps": ["0A1107020000001D"]},
    {"task": "0A1107020000001F", "kind": "building", "word": "mech", "n": 5, "q": "e6_t05", "f": "60_epoch_cosmos", "deps": ["0A1107020000001D"]},
    {"task": "0A11070200000020", "kind": "item_any", "items": "botania:terrasteel_ingot", "n": 8, "q": "e6_r01", "f": "60_epoch_cosmos", "deps": ["0A11070200000004"]},
    {"task": "0A11070200000021", "kind": "item_any", "items": "minecraft:nether_star", "n": 4, "q": "e6_r02", "f": "60_epoch_cosmos", "deps": ["0A1107020000000A", "0A11070200000020"]},
    {"task": "0A11070200000022", "kind": "item_any", "items": "minecraft:dragon_breath", "n": 8, "q": "e6_r03", "f": "60_epoch_cosmos", "deps": ["0A1107020000000B", "0A11070200000021"]},
    {"task": "0A11070200000023", "kind": "item_any", "items": "arcanopolis:ritual_regulator", "n": 4, "q": "e6_r04", "f": "60_epoch_cosmos", "deps": ["0A11070200000022"]},
    {"task": "0A11070200000024", "kind": "building", "word": "library", "n": 5, "q": "e6_r04", "f": "60_epoch_cosmos", "deps": ["0A11070200000022"]},
    {"task": "0A11070200000025", "kind": "item_any", "items": "ars_nouveau:source_gem", "n": 64, "q": "e6_r05", "f": "60_epoch_cosmos", "deps": ["0A11070200000023", "0A11070200000024"]},
    {"task": "0A11070200000026", "kind": "building", "word": "university", "n": 5, "q": "e6_r05", "f": "60_epoch_cosmos", "deps": ["0A11070200000023", "0A11070200000024"]},
    {"task": "0A11070200000027", "kind": "item_any", "items": "arcanopolis:arcane_converter", "n": 16, "q": "e6_f01", "f": "60_epoch_cosmos", "deps": ["0A11070200000005"]},
    {"task": "0A11070200000028", "kind": "item_any", "items": "arcanopolis:arcane_converter", "n": 8, "q": "e6_f02", "f": "60_epoch_cosmos", "deps": ["0A11070200000027"]},
    {"task": "0A11070200000029", "kind": "townhall", "n": 5, "q": "e6_f02", "f": "60_epoch_cosmos", "deps": ["0A11070200000027"]},
    {"task": "0A1107020000002A", "kind": "item_any", "items": "arcanopolis:primal_catalyst", "n": 2, "q": "e6_f03", "f": "60_epoch_cosmos", "deps": ["0A11070200000006", "0A11070200000028", "0A11070200000029"]},
    {"task": "0A1107020000002B", "kind": "item_any", "items": "arcanopolis:heart_of_arcanopolis", "n": 1, "q": "e6_f04", "f": "60_epoch_cosmos", "deps": ["0A11070200000007", "0A1107020000002A"]},
    {"task": "0A1107020000002C", "kind": "item_any", "items": "arcanopolis:heart_of_arcanopolis", "n": 1, "q": "e6_f05", "f": "60_epoch_cosmos", "deps": ["0A11070200000008", "0A11070200000009", "0A1107020000002B"]},
    {"task": "0A1107020000002D", "kind": "citizens", "n": 60, "q": "e6_f05", "f": "60_epoch_cosmos", "deps": ["0A11070200000008", "0A11070200000009", "0A1107020000002B"]},
    {"task": "0A1107020000002E", "kind": "item_any", "items": "minecraft:end_stone", "n": 64, "q": "e6_s01", "f": "60_epoch_cosmos", "deps": ["0A1107020000000D"]},
    {"task": "0A1107020000002F", "kind": "item_any", "items": "minecraft:purpur_block", "n": 32, "q": "e6_s02", "f": "60_epoch_cosmos", "deps": ["0A1107020000002E"]},
    {"task": "0A11070200000030", "kind": "item_any", "items": "minecraft:end_rod", "n": 16, "q": "e6_s03", "f": "60_epoch_cosmos", "deps": ["0A1107020000002F"]},
    {"task": "0A11070200000031", "kind": "item_any", "items": "minecraft:shulker_shell", "n": 8, "q": "e6_s04", "f": "60_epoch_cosmos", "deps": ["0A11070200000030"]},
    {"task": "0A11070200000032", "kind": "item_any", "items": "minecraft:end_crystal", "n": 4, "q": "e6_s05", "f": "60_epoch_cosmos", "deps": ["0A11070200000031"]},
    {"task": "0A11070200000033", "kind": "item_any", "items": "minecraft:elytra|minecraft:firework_rocket", "n": 1, "q": "e6_s06", "f": "60_epoch_cosmos", "deps": ["0A11070200000032"]},
    {"task": "0A11070200000034", "kind": "item_any", "items": "minecraft:firework_rocket", "n": 32, "q": "e6_s07", "f": "60_epoch_cosmos", "deps": ["0A11070200000033"]},
    {"task": "0A11070200000035", "kind": "item_any", "items": "minecraft:netherite_ingot", "n": 4, "q": "e6_n01", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A11070200000036", "kind": "item_any", "items": "minecraft:netherite_block", "n": 1, "q": "e6_n02", "f": "60_epoch_cosmos", "deps": ["0A11070200000035"]},
    {"task": "0A11070200000037", "kind": "item_any", "items": "minecraft:beacon", "n": 2, "q": "e6_n03", "f": "60_epoch_cosmos", "deps": ["0A11070200000028", "0A11070200000029", "0A11070200000036"]},
    {"task": "0A11070200000038", "kind": "item_any", "items": "minecraft:totem_of_undying", "n": 2, "q": "e6_n04", "f": "60_epoch_cosmos", "deps": ["0A11070200000037"]},
    {"task": "0A11070200000039", "kind": "item_any", "items": "minecraft:wither_skeleton_skull", "n": 3, "q": "e6_n05", "f": "60_epoch_cosmos", "deps": ["0A11070200000038"]},
    {"task": "0A1107020000003A", "kind": "item_any", "items": "minecraft:enchanted_golden_apple", "n": 1, "q": "e6_n06", "f": "60_epoch_cosmos", "deps": ["0A11070200000039"]},
    {"task": "0A1107020000003B", "kind": "item_any", "items": "minecraft:iron_ingot", "n": 512, "q": "e6_m01", "f": "60_epoch_cosmos", "deps": ["0A11070200000014"]},
    {"task": "0A1107020000003C", "kind": "item_any", "items": "minecraft:gold_ingot", "n": 128, "q": "e6_m02", "f": "60_epoch_cosmos", "deps": ["0A1107020000003B"]},
    {"task": "0A1107020000003D", "kind": "item_any", "items": "minecraft:diamond", "n": 16, "q": "e6_m03", "f": "60_epoch_cosmos", "deps": ["0A1107020000003C"]},
    {"task": "0A1107020000003E", "kind": "item_any", "items": "minecraft:emerald", "n": 16, "q": "e6_m04", "f": "60_epoch_cosmos", "deps": ["0A1107020000003D"]},
    {"task": "0A1107020000003F", "kind": "item_any", "items": "minecraft:lapis_lazuli", "n": 64, "q": "e6_m05", "f": "60_epoch_cosmos", "deps": ["0A1107020000003E"]},
    {"task": "0A11070200000040", "kind": "item_any", "items": "minecraft:copper_ingot", "n": 256, "q": "e6_m06", "f": "60_epoch_cosmos", "deps": ["0A1107020000003F"]},
    {"task": "0A11070200000041", "kind": "item_any", "items": "arcanopolis:reinforced_casing", "n": 32, "q": "e6_l01", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A11070200000042", "kind": "building", "word": "black", "n": 5, "q": "e6_l01", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A11070200000043", "kind": "item_any", "items": "botania:terrasteel_ingot", "n": 8, "q": "e6_l02", "f": "60_epoch_cosmos", "deps": ["0A11070200000041", "0A11070200000042"]},
    {"task": "0A11070200000044", "kind": "building", "word": "library", "n": 5, "q": "e6_l02", "f": "60_epoch_cosmos", "deps": ["0A11070200000041", "0A11070200000042"]},
    {"task": "0A11070200000045", "kind": "item_any", "items": "mekanism:ultimate_control_circuit", "n": 16, "q": "e6_l03", "f": "60_epoch_cosmos", "deps": ["0A11070200000043", "0A11070200000044"]},
    {"task": "0A11070200000046", "kind": "building", "word": "mech", "n": 5, "q": "e6_l03", "f": "60_epoch_cosmos", "deps": ["0A11070200000043", "0A11070200000044"]},
    {"task": "0A11070200000047", "kind": "item_any", "items": "minecraft:ender_pearl", "n": 64, "q": "e6_l04", "f": "60_epoch_cosmos", "deps": ["0A11070200000045", "0A11070200000046"]},
    {"task": "0A11070200000048", "kind": "building", "word": "warehouse", "n": 5, "q": "e6_l04", "f": "60_epoch_cosmos", "deps": ["0A11070200000045", "0A11070200000046"]},
    {"task": "0A11070200000049", "kind": "item_any", "items": "arcanopolis:arcane_converter", "n": 16, "q": "e6_l05", "f": "60_epoch_cosmos", "deps": ["0A11070200000028", "0A11070200000029", "0A11070200000047", "0A11070200000048"]},
    {"task": "0A1107020000004A", "kind": "citizens", "n": 60, "q": "e6_l05", "f": "60_epoch_cosmos", "deps": ["0A11070200000028", "0A11070200000029", "0A11070200000047", "0A11070200000048"]},
    {"task": "0A1107020000004B", "kind": "item_any", "items": "minecraft:emerald", "n": 32, "q": "e6_g01", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A1107020000004C", "kind": "building", "word": "warehouse", "n": 5, "q": "e6_g01", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A1107020000004D", "kind": "item_any", "items": "minecraft:book", "n": 64, "q": "e6_g02", "f": "60_epoch_cosmos", "deps": ["0A1107020000004B", "0A1107020000004C"]},
    {"task": "0A1107020000004E", "kind": "building", "word": "university", "n": 5, "q": "e6_g02", "f": "60_epoch_cosmos", "deps": ["0A1107020000004B", "0A1107020000004C"]},
    {"task": "0A1107020000004F", "kind": "item_any", "items": "minecraft:golden_apple", "n": 4, "q": "e6_g03", "f": "60_epoch_cosmos", "deps": ["0A1107020000004D", "0A1107020000004E"]},
    {"task": "0A11070200000050", "kind": "building", "word": "hospital", "n": 5, "q": "e6_g03", "f": "60_epoch_cosmos", "deps": ["0A1107020000004D", "0A1107020000004E"]},
    {"task": "0A11070200000051", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 16, "q": "e6_g04", "f": "60_epoch_cosmos", "deps": ["0A1107020000004F", "0A11070200000050"]},
    {"task": "0A11070200000052", "kind": "building", "word": "mech", "n": 5, "q": "e6_g04", "f": "60_epoch_cosmos", "deps": ["0A1107020000004F", "0A11070200000050"]},
    {"task": "0A11070200000053", "kind": "item_any", "items": "minecraft:iron_sword", "n": 8, "q": "e6_g05", "f": "60_epoch_cosmos", "deps": ["0A11070200000051", "0A11070200000052"]},
    {"task": "0A11070200000054", "kind": "building", "word": "guard", "n": 5, "q": "e6_g05", "f": "60_epoch_cosmos", "deps": ["0A11070200000051", "0A11070200000052"]},
    {"task": "0A11070200000055", "kind": "item_any", "items": "minecraft:chest", "n": 32, "q": "e6_g06", "f": "60_epoch_cosmos", "deps": ["0A11070200000053", "0A11070200000054"]},
    {"task": "0A11070200000056", "kind": "building", "word": "warehouse", "n": 5, "q": "e6_g06", "f": "60_epoch_cosmos", "deps": ["0A11070200000053", "0A11070200000054"]},
    {"task": "0A11070200000057", "kind": "item_any", "items": "minecraft:oak_sapling", "n": 64, "q": "e6_g07", "f": "60_epoch_cosmos", "deps": ["0A11070200000055", "0A11070200000056"]},
    {"task": "0A11070200000058", "kind": "building", "word": "farm", "n": 5, "q": "e6_g07", "f": "60_epoch_cosmos", "deps": ["0A11070200000055", "0A11070200000056"]},
    {"task": "0A11070200000059", "kind": "item_any", "items": "minecraft:book", "n": 128, "q": "e6_g08", "f": "60_epoch_cosmos", "deps": ["0A11070200000057", "0A11070200000058"]},
    {"task": "0A1107020000005A", "kind": "building", "word": "library", "n": 5, "q": "e6_g08", "f": "60_epoch_cosmos", "deps": ["0A11070200000057", "0A11070200000058"]},
    {"task": "0A1107020000005B", "kind": "item_any", "items": "minecraft:firework_rocket", "n": 64, "q": "e6_g09", "f": "60_epoch_cosmos", "deps": ["0A1107020000002C", "0A1107020000002D", "0A11070200000059", "0A1107020000005A"]},
    {"task": "0A1107020000005C", "kind": "citizens", "n": 60, "q": "e6_g09", "f": "60_epoch_cosmos", "deps": ["0A1107020000002C", "0A1107020000002D", "0A11070200000059", "0A1107020000005A"]},
    {"task": "0A1107020000005D", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 128, "q": "e6pz01", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A1107020000005E", "kind": "building", "word": "mech", "n": 5, "q": "e6pz01", "f": "60_epoch_cosmos", "deps": ["0A11070200000001"]},
    {"task": "0A1107020000005F", "kind": "item_any", "items": "arcanopolis:reinforced_casing", "n": 64, "q": "e6pz02", "f": "60_epoch_cosmos", "deps": ["0A1107020000005D", "0A1107020000005E"]},
    {"task": "0A11070200000060", "kind": "item_any", "items": "arcanopolis:arcane_converter", "n": 16, "q": "e6pz02", "f": "60_epoch_cosmos", "deps": ["0A1107020000005D", "0A1107020000005E"]},
    {"task": "0A11070200000061", "kind": "always", "q": "e6_tr", "f": "60_epoch_cosmos", "deps": ["0A11070200000008", "0A11070200000009"]}
  ],
  "00_prologue#free": [
    {"task": "0A11010200000008", "kind": "building", "word": "deliveryman", "n": 1, "q": "logistics", "f": "00_prologue", "deps": []},
    {"task": "0A11010200000051", "kind": "item_any", "items": "minecraft:cake", "n": 1, "q": "sec_cake", "f": "00_prologue", "deps": []},
    {"task": "0A11010200000052", "kind": "item_any", "items": "minecraft:egg", "n": 16, "q": "sec_eggs", "f": "00_prologue", "deps": []}
  ],
  "10_epoch_wood_water#free": [
    {"task": "0A11020200000064", "kind": "item_any", "items": "minecraft:lava_bucket", "n": 1, "q": "sec_lava", "f": "10_epoch_wood_water", "deps": []},
    {"task": "0A11020200000065", "kind": "citizens", "n": 13, "q": "sec_13", "f": "10_epoch_wood_water", "deps": []}
  ],
  "20_epoch_steam_logistics#free": [
    {"task": "0A1103020000000B", "kind": "item_any", "items": "create:railway_casing", "n": 4, "q": "rails", "f": "20_epoch_steam_logistics", "deps": []},
    {"task": "0A11030200000060", "kind": "item_any", "items": "tconstruct:tinker_station", "n": 1, "q": "tic_station", "f": "20_epoch_steam_logistics", "deps": []},
    {"task": "0A11030200000061", "kind": "item_any", "items": "tconstruct:part_builder", "n": 1, "q": "tic_parts", "f": "20_epoch_steam_logistics", "deps": []}
  ],
  "30_epoch_industry#free": [
    {"task": "0A1104020000005C", "kind": "item_any", "items": "tconstruct:smeltery_controller", "n": 1, "q": "tic_smeltery", "f": "30_epoch_industry", "deps": []},
    {"task": "0A1104020000005D", "kind": "item_any", "items": "tconstruct:cobalt_ingot", "n": 4, "q": "tic_cobalt", "f": "30_epoch_industry", "deps": []},
    {"task": "0A1104020000005E", "kind": "item_any", "items": "tconstruct:manyullyn_ingot", "n": 2, "q": "tic_manyullyn", "f": "30_epoch_industry", "deps": []}
  ],
  "40_epoch_magic#free": [
    {"task": "0A11050200000004", "kind": "always", "q": "ars_create", "f": "40_epoch_magic", "deps": []},
    {"task": "0A11050200000009", "kind": "item_any", "items": "arcanopolis:ritual_regulator", "n": 1, "q": "ritual", "f": "40_epoch_magic", "deps": []}
  ],
  "50_epoch_network#free": [
    {"task": "0A11060200000005", "kind": "item_any", "items": "mekanism:alloy_atomic", "n": 8, "q": "mek_link", "f": "50_epoch_network", "deps": []}
  ],
  "70_side_architects": [
    {"task": "0A11080200000001", "kind": "always", "q": "hub", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000006", "kind": "item_any", "items": "minecraft:stone_bricks", "n": 128, "q": "s_ar01", "f": "70_side_architects", "deps": ["0A11080200000001"]},
    {"task": "0A11080200000007", "kind": "item_any", "items": "minecraft:glass_pane", "n": 64, "q": "s_ar02", "f": "70_side_architects", "deps": ["0A11080200000006"]},
    {"task": "0A11080200000008", "kind": "item_any", "items": "minecraft:copper_block", "n": 16, "q": "s_ar03", "f": "70_side_architects", "deps": ["0A11080200000007"]},
    {"task": "0A11080200000009", "kind": "item_any", "items": "minecraft:bricks", "n": 32, "q": "s_ar04", "f": "70_side_architects", "deps": ["0A11080200000008"]},
    {"task": "0A1108020000000A", "kind": "item_any", "items": "minecraft:quartz_block", "n": 16, "q": "s_ar05", "f": "70_side_architects", "deps": ["0A11080200000009"]},
    {"task": "0A1108020000000B", "kind": "building", "word": "residence", "n": 3, "q": "s_ar05", "f": "70_side_architects", "deps": ["0A11080200000009"]},
    {"task": "0A1108020000000C", "kind": "item_any", "items": "minecraft:oak_sapling", "n": 32, "q": "s_ar06", "f": "70_side_architects", "deps": ["0A1108020000000A", "0A1108020000000B"]},
    {"task": "0A1108020000000D", "kind": "building", "word": "farm", "n": 2, "q": "s_ar06", "f": "70_side_architects", "deps": ["0A1108020000000A", "0A1108020000000B"]}
  ],
  "70_side_architects#free": [
    {"task": "0A11080200000002", "kind": "always", "q": "style", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000003", "kind": "always", "q": "quarters", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000004", "kind": "always", "q": "park", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000005", "kind": "always", "q": "monument", "f": "70_side_architects", "deps": []},
    {"task": "0A1108020000000E", "kind": "item_any", "items": "minecraft:white_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A1108020000000F", "kind": "item_any", "items": "minecraft:orange_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000010", "kind": "item_any", "items": "minecraft:magenta_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000011", "kind": "item_any", "items": "minecraft:light_blue_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000012", "kind": "item_any", "items": "minecraft:yellow_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000013", "kind": "item_any", "items": "minecraft:lime_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000014", "kind": "item_any", "items": "minecraft:pink_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000015", "kind": "item_any", "items": "minecraft:gray_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000016", "kind": "item_any", "items": "minecraft:light_gray_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000017", "kind": "item_any", "items": "minecraft:cyan_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000018", "kind": "item_any", "items": "minecraft:purple_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A11080200000019", "kind": "item_any", "items": "minecraft:blue_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A1108020000001A", "kind": "item_any", "items": "minecraft:brown_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A1108020000001B", "kind": "item_any", "items": "minecraft:green_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A1108020000001C", "kind": "item_any", "items": "minecraft:red_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []},
    {"task": "0A1108020000001D", "kind": "item_any", "items": "minecraft:black_wool", "n": 1, "q": "sec_rainbow", "f": "70_side_architects", "deps": []}
  ],
  "71_side_expeditions": [
    {"task": "0A11090200000001", "kind": "always", "q": "hub", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000006", "kind": "item_any", "items": "minecraft:cooked_beef", "n": 32, "q": "s_ex01", "f": "71_side_expeditions", "deps": ["0A11090200000001"]},
    {"task": "0A11090200000007", "kind": "item_any", "items": "minecraft:iron_sword", "n": 2, "q": "s_ex02", "f": "71_side_expeditions", "deps": ["0A11090200000006"]},
    {"task": "0A11090200000008", "kind": "item_any", "items": "minecraft:blaze_rod", "n": 8, "q": "s_ex03", "f": "71_side_expeditions", "deps": ["0A11090200000007"]},
    {"task": "0A11090200000009", "kind": "item_any", "items": "minecraft:ender_pearl", "n": 8, "q": "s_ex04", "f": "71_side_expeditions", "deps": ["0A11090200000008"]},
    {"task": "0A1109020000000A", "kind": "item_any", "items": "minecrp", "n": 8, "q": "s_ex05", "f": "71_side_expeditions", "deps": ["0A11090200000009"]},
    {"task": "0A1109020000000B", "kind": "building", "word": "university", "n": 1, "q": "s_ex05", "f": "71_side_expeditions", "deps": ["0A11090200000009"]},
    {"task": "0A1109020000000C", "kind": "item_any", "items": "minecraft:name_tag", "n": 4, "q": "s_ex06", "f": "71_side_expeditions", "deps": ["0A1109020000000A", "0A1109020000000B"]},
    {"task": "0A1109020000000D", "kind": "building", "word": "library", "n": 2, "q": "s_ex06", "f": "71_side_expeditions", "deps": ["0A1109020000000A", "0A1109020000000B"]},
    {"task": "0A1109020000000E", "kind": "skip", "q": "s_hu01", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000000F", "kind": "skip", "q": "s_hu02", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000010", "kind": "skip", "q": "s_hu03", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000011", "kind": "skip", "q": "s_hu04", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000012", "kind": "skip", "q": "s_hu05", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000013", "kind": "skip", "q": "s_hu06", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000014", "kind": "skip", "q": "s_hu07", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000015", "kind": "skip", "q": "s_rd01", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000016", "kind": "skip", "q": "s_rd02", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000017", "kind": "skip", "q": "s_rd03", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000018", "kind": "skip", "q": "s_dx01", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000019", "kind": "skip", "q": "s_dx02", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000001A", "kind": "skip", "q": "s_dx03", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000001B", "kind": "skip", "q": "s_dx04", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000001C", "kind": "skip", "q": "s_st01", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000001D", "kind": "skip", "q": "s_st02", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000001E", "kind": "skip", "q": "s_st03", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000001F", "kind": "skip", "q": "s_st04", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000020", "kind": "skip", "q": "s_ww01", "f": "71_side_expeditions", "deps": []}
  ],
  "71_side_expeditions#free": [
    {"task": "0A11090200000002", "kind": "always", "q": "structures", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000003", "kind": "skip", "q": "nether", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000004", "kind": "skip", "q": "end", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000005", "kind": "always", "q": "colony_ruins", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000021", "kind": "skip", "q": "s_sec1", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000022", "kind": "skip", "q": "s_sec2", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000023", "kind": "skip", "q": "boss_ender_golem", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000024", "kind": "skip", "q": "boss_ender_guardian", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000025", "kind": "skip", "q": "boss_prowler", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000026", "kind": "skip", "q": "boss_wadjet", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000027", "kind": "skip", "q": "boss_monstrosity", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000028", "kind": "skip", "q": "boss_ignis", "f": "71_side_expeditions", "deps": []},
    {"task": "0A11090200000029", "kind": "skip", "q": "boss_harbinger", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000002A", "kind": "skip", "q": "boss_remnant", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000002B", "kind": "skip", "q": "boss_leviathan", "f": "71_side_expeditions", "deps": []},
    {"task": "0A1109020000002C", "kind": "skip", "q": "sec_marathon", "f": "71_side_expeditions", "deps": []}
  ],
  "72_side_schools": [
    {"task": "0A110A0200000001", "kind": "always", "q": "hub", "f": "72_side_schools", "deps": []},
    {"task": "0A110A0200000006", "kind": "item_any", "items": "minecraft:book", "n": 16, "q": "s_sc01", "f": "72_side_schools", "deps": ["0A110A0200000001"]},
    {"task": "0A110A0200000007", "kind": "item_any", "items": "minecraft:lectern", "n": 2, "q": "s_sc02", "f": "72_side_schools", "deps": ["0A110A0200000006"]},
    {"task": "0A110A0200000008", "kind": "building", "word": "school", "n": 2, "q": "s_sc03", "f": "72_side_schools", "deps": ["0A110A0200000007"]},
    {"task": "0A110A0200000009", "kind": "building", "word": "university", "n": 2, "q": "s_sc04", "f": "72_side_schools", "deps": ["0A110A0200000008"]},
    {"task": "0A110A020000000A", "kind": "item_any", "items": "minecra_book", "n": 8, "q": "s_sc05", "f": "72_side_schools", "deps": ["0A110A0200000009"]},
    {"task": "0A110A020000000B", "kind": "building", "word": "library", "n": 2, "q": "s_sc05", "f": "72_side_schools", "deps": ["0A110A0200000009"]}
  ],
  "72_side_schools#free": [
    {"task": "0A110A0200000002", "kind": "always", "q": "ars_master", "f": "72_side_schools", "deps": []},
    {"task": "0A110A0200000003", "kind": "always", "q": "botania_master", "f": "72_side_schools", "deps": []},
    {"task": "0A110A0200000004", "kind": "always", "q": "blood_master", "f": "72_side_schools", "deps": []},
    {"task": "0A110A0200000005", "kind": "always", "q": "eidolon_master", "f": "72_side_schools", "deps": []},
    {"task": "0A110A020000000C", "kind": "item_any", "items": "minecraft:book", "n": 42, "q": "sec_42", "f": "72_side_schools", "deps": []}
  ],
  "73_side_engineering": [
    {"task": "0A110B0200000001", "kind": "always", "q": "hub", "f": "73_side_engineering", "deps": []},
    {"task": "0A110B0200000006", "kind": "item_any", "items": "create:toolbox|minecraft:chest", "n": 1, "q": "s_en01", "f": "73_side_engineering", "deps": ["0A110B0200000001"]},
    {"task": "0A110B0200000007", "kind": "item_any", "items": "minecraft:paper", "n": 32, "q": "s_en02", "f": "73_side_engineering", "deps": ["0A110B0200000006"]},
    {"task": "0A110B0200000008", "kind": "building", "word": "mech", "n": 2, "q": "s_en03", "f": "73_side_engineering", "deps": ["0A110B0200000007"]},
    {"task": "0A110B0200000009", "kind": "item_any", "items": "create:wrench", "n": 2, "q": "s_en04", "f": "73_side_engineering", "deps": ["0A110B0200000008"]},
    {"task": "0A110B020000000A", "kind": "building", "word": "mech", "n": 2, "q": "s_en04", "f": "73_side_engineering", "deps": ["0A110B0200000008"]},
    {"task": "0A110B020000000B", "kind": "item_any", "items": "create:precision_mechanism", "n": 4, "q": "s_en05", "f": "73_side_engineering", "deps": ["0A110B0200000009", "0A110B020000000A"]},
    {"task": "0A110B020000000C", "kind": "building", "word": "university", "n": 1, "q": "s_en05", "f": "73_side_engineering", "deps": ["0A110B0200000009", "0A110B020000000A"]}
  ],
  "73_side_engineering#free": [
    {"task": "0A110B0200000002", "kind": "always", "q": "layout", "f": "73_side_engineering", "deps": []},
    {"task": "0A110B0200000003", "kind": "always", "q": "transport", "f": "73_side_engineering", "deps": []},
    {"task": "0A110B0200000004", "kind": "always", "q": "power", "f": "73_side_engineering", "deps": []},
    {"task": "0A110B0200000005", "kind": "always", "q": "sorting", "f": "73_side_engineering", "deps": []}
  ],
  "74_side_supply": [
    {"task": "0A110C0200000001", "kind": "always", "q": "hub", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000005", "kind": "item_any", "items": "minecraft:bread", "n": 128, "q": "s_su01", "f": "74_side_supply", "deps": ["0A110C0200000001"]},
    {"task": "0A110C0200000006", "kind": "item_any", "items": "minecraft:coal", "n": 128, "q": "s_su02", "f": "74_side_supply", "deps": ["0A110C0200000005"]},
    {"task": "0A110C0200000007", "kind": "item_any", "items": "minecraft:oak_planks", "n": 256, "q": "s_su03", "f": "74_side_supply", "deps": ["0A110C0200000006"]},
    {"task": "0A110C0200000008", "kind": "item_any", "items": "minecraft:iron_ingot", "n": 64, "q": "s_su04", "f": "74_side_supply", "deps": ["0A110C0200000007"]},
    {"task": "0A110C0200000009", "kind": "item_any", "items": "minecraft:golden_apple", "n": 2, "q": "s_su05", "f": "74_side_supply", "deps": ["0A110C0200000008"]},
    {"task": "0A110C020000000A", "kind": "building", "word": "warehouse", "n": 3, "q": "s_su05", "f": "74_side_supply", "deps": ["0A110C0200000008"]},
    {"task": "0A110C020000000B", "kind": "item_any", "items": "minecraft:chest", "n": 16, "q": "s_su06", "f": "74_side_supply", "deps": ["0A110C0200000009", "0A110C020000000A"]},
    {"task": "0A110C020000000C", "kind": "building", "word": "deliveryman", "n": 2, "q": "s_su06", "f": "74_side_supply", "deps": ["0A110C0200000009", "0A110C020000000A"]}
  ],
  "74_side_supply#free": [
    {"task": "0A110C0200000002", "kind": "always", "q": "week", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000003", "kind": "always", "q": "month", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000004", "kind": "always", "q": "trophy", "f": "74_side_supply", "deps": []},
    {"task": "0A110C020000000D", "kind": "skip", "q": "s_tr01", "f": "74_side_supply", "deps": []},
    {"task": "0A110C020000000E", "kind": "skip", "q": "s_tr02", "f": "74_side_supply", "deps": []},
    {"task": "0A110C020000000F", "kind": "skip", "q": "s_tr03", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000010", "kind": "skip", "q": "s_tr04", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000011", "kind": "skip", "q": "s_tr05", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000012", "kind": "skip", "q": "s_tr06", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000013", "kind": "skip", "q": "s_tr07", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000014", "kind": "skip", "q": "s_tr08", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000015", "kind": "skip", "q": "s_tr09", "f": "74_side_supply", "deps": []},
    {"task": "0A110C0200000016", "kind": "skip", "q": "s_tr10", "f": "74_side_supply", "deps": []}
  ],
  "80_reference#free": [
    {"task": "0A110D0200000001", "kind": "always", "q": "seals", "f": "80_reference", "deps": []},
    {"task": "0A110D0200000002", "kind": "always", "q": "items", "f": "80_reference", "deps": []},
    {"task": "0A110D0200000003", "kind": "always", "q": "epochs", "f": "80_reference", "deps": []},
    {"task": "0A110D0200000004", "kind": "always", "q": "colony", "f": "80_reference", "deps": []},
    {"task": "0A110D0200000005", "kind": "always", "q": "kubejs", "f": "80_reference", "deps": []},
    {"task": "0A110D0200000006", "kind": "always", "q": "ref_sys", "f": "80_reference", "deps": []}
  ],
  "81_side_relics#free": [
    {"task": "0A110E0200000001", "kind": "item_any", "items": "relics:infinity_ham", "n": 1, "q": "rel_infinity_ham", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000002", "kind": "item_any", "items": "relics:space_dissector", "n": 1, "q": "rel_space_dissector", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000003", "kind": "item_any", "items": "relics:magic_mirror", "n": 1, "q": "rel_magic_mirror", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000004", "kind": "item_any", "items": "relics:elytra_booster", "n": 1, "q": "rel_elytra_booster", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000005", "kind": "item_any", "items": "relics:enders_hand", "n": 1, "q": "rel_enders_hand", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000006", "kind": "item_any", "items": "relics:bastion_ring", "n": 1, "q": "rel_bastion_ring", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000007", "kind": "item_any", "items": "relics:chorus_inhibitor", "n": 1, "q": "rel_chorus_inhibitor", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000008", "kind": "item_any", "items": "relics:midnight_robe", "n": 1, "q": "rel_midnight_robe", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000009", "kind": "item_any", "items": "relics:shadow_glaive", "n": 1, "q": "rel_shadow_glaive", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000000A", "kind": "item_any", "items": "relics:spatial_sign", "n": 1, "q": "rel_spatial_sign", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000000B", "kind": "item_any", "items": "relics:blazing_flask", "n": 1, "q": "rel_blazing_flask", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000000C", "kind": "item_any", "items": "relics:reflection_necklace", "n": 1, "q": "rel_reflection_necklace", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000000D", "kind": "item_any", "items": "relics:jellyfish_necklace", "n": 1, "q": "rel_jellyfish_necklace", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000000E", "kind": "item_any", "items": "relics:rage_glove", "n": 1, "q": "rel_rage_glove", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000000F", "kind": "item_any", "items": "relics:holy_locket", "n": 1, "q": "rel_holy_locket", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000010", "kind": "item_any", "items": "relics:horse_flute", "n": 1, "q": "rel_horse_flute", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000011", "kind": "item_any", "items": "relics:amphibian_boot", "n": 1, "q": "rel_amphibian_boot", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000012", "kind": "item_any", "items": "relics:aqua_walker", "n": 1, "q": "rel_aqua_walker", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000013", "kind": "item_any", "items": "relics:magma_walker", "n": 1, "q": "rel_magma_walker", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000014", "kind": "item_any", "items": "relics:drowned_belt", "n": 1, "q": "rel_drowned_belt", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000015", "kind": "item_any", "items": "relics:arrow_quiver", "n": 1, "q": "rel_arrow_quiver", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000016", "kind": "item_any", "items": "relics:hunter_belt", "n": 1, "q": "rel_hunter_belt", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000017", "kind": "item_any", "items": "relics:ice_breaker", "n": 1, "q": "rel_ice_breaker", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000018", "kind": "item_any", "items": "relics:ice_skates", "n": 1, "q": "rel_ice_skates", "f": "81_side_relics", "deps": []},
    {"task": "0A110E0200000019", "kind": "item_any", "items": "relics:roller_skates", "n": 1, "q": "rel_roller_skates", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000001A", "kind": "item_any", "items": "relics:leather_belt", "n": 1, "q": "rel_leather_belt", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000001B", "kind": "item_any", "items": "relics:solid_snowball", "n": 1, "q": "rel_solid_snowball", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000001C", "kind": "item_any", "items": "relics:spore_sack", "n": 1, "q": "rel_spore_sack", "f": "81_side_relics", "deps": []},
    {"task": "0A110E020000001D", "kind": "item_any", "items": "relics:wool_mitten", "n": 1, "q": "rel_wool_mitten", "f": "81_side_relics", "deps": []}
  ]
}

const IColonyManager = Java.loadClass('com.minecolonies.api.colony.IColonyManager')

// Диагностика: первая ошибка каждого места пишется в лог один раз —
// если API колонии в вашей версии MineColonies отличается, лог скажет где.
const _arcErrSeen = {}
function arcanopolis_logErr(where, e) {
  if (_arcErrSeen[where]) return
  _arcErrSeen[where] = true
  try { console.error('[Arcanopolis] ошибка проверки колонии (' + where + '): ' + e) } catch (ignored) {}
}

const _arcColonySeen = {}
function arcanopolis_noteColony(player, col) {
  try {
    const name = String(player.username)
    if (_arcColonySeen[name]) return
    _arcColonySeen[name] = true
    let cn = '?', cz = -1
    try { cn = String(col.getName()) } catch (e) {}
    try { cz = col.getCitizenManager().getCitizens().size() } catch (e) {}
    console.info('[Arcanopolis] колония игрока ' + name + ': «' + cn + '», жителей ' + cz + ' — проверки MineColonies работают')
  } catch (e) {}
}

function arcanopolis_level(player) {
  try { const l = player.level; if (l) return l } catch (e) {}
  try { return player.getLevel() } catch (e) {}
  return null
}

function arcanopolis_colonyOf(player) {
  try {
    const lvl = arcanopolis_level(player)
    if (lvl == null) return null
    let mgr = null
    try { mgr = IColonyManager.getInstance() } catch (e) { arcanopolis_logErr('manager.getInstance', e) }
    if (mgr == null) {
      try { mgr = Java.loadClass('com.minecolonies.api.IMinecoloniesAPI').getInstance().getColonyManager() } catch (e) { arcanopolis_logErr('manager.api', e) }
    }
    if (mgr == null) return null
    let col = null
    // сначала колония самого игрока-владельца: условия засчитываются из любой
    // точки мира, а не только рядом с городом
    try { col = mgr.getIColonyByOwner(lvl, player) } catch (e) {}
    if (col == null) {
      try { col = mgr.getIColony(lvl, player.blockPosition()) } catch (e) {}
    }
    if (col == null) {
      try { col = mgr.getClosestColony(lvl, player.blockPosition()) } catch (e) {}
    }
    if (col != null) arcanopolis_noteColony(player, col)
    return col
  } catch (e) { arcanopolis_logErr('colonyOf', e); return null }
}

function arcanopolis_buildingManager(col) {
  // имена менеджера зданий гуляли между версиями — пробуем все
  try { if (col.getServerBuildingManager) return col.getServerBuildingManager() } catch (e) {}
  try { if (col.getCommonBuildingManager) return col.getCommonBuildingManager() } catch (e) {}
  try { if (col.getBuildingManager) return col.getBuildingManager() } catch (e) {}
  arcanopolis_logErr('buildingManager', 'нет ни одного менеджера зданий')
  return null
}

function arcanopolis_buildingLevel(col, word) {
  // максимальный уровень здания, в id/имени которого есть word; -1 — не нашли
  const bm = arcanopolis_buildingManager(col)
  if (bm == null) return -1
  let best = -1
  try {
    const it = bm.getBuildings().values().iterator()
    while (it.hasNext()) {
      const b = it.next()
      let hay = ''
      try { hay += ' ' + String(b.getSchematicName()) } catch (e) {}
      try { hay += ' ' + String(b.getBuildingType().getRegistryName()) } catch (e) {}
      try { hay += ' ' + String(b.getBuildingType().getSerializedName()) } catch (e) {}
      if (hay.toLowerCase().indexOf(word) >= 0) {
        const lv = b.getBuildingLevel()
        if (lv > best) best = lv
      }
    }
  } catch (e) { arcanopolis_logErr('buildings.scan', e) }
  return best
}

function arcanopolis_itemCount(player, id) {
  try {
    const Reg = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    const RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    const item = Reg.ITEM.get(new RL(String(id)))
    if (item == null) return 0
    const inv = player.getInventory()
    let total = 0
    for (let i = 0; i < inv.getContainerSize(); i++) {
      const st = inv.getItem(i)
      if (!st.isEmpty() && st.getItem().equals(item)) total += st.getCount()
    }
    return total
  } catch (e) { return 0 }
}

// Лагерь / корабль снабжения засчитывает сам MineColonies: первый квест
// пролога — нативная FTB-задача на advancement
// minecolonies:minecraft/craft_supply (триггер supply_placed при установке
// снабжения, проверено по релизу v1.20.1-1.1.1301). JS-здесь не нужен.

function arcanopolis_rowOk(player, row) {
  if (row.kind === 'always') return true
  if (row.kind === 'item_any') {
    try {
      const ids = String(row.items).split('|')
      let total = 0
      for (const id of ids) {
        total += arcanopolis_itemCount(player, id)
        if (total >= row.n) return true
      }
      return total >= row.n
    } catch (e) { return false }
  }
  try {
    const col = arcanopolis_colonyOf(player)
    if (col == null) return false
    if (row.kind === 'townhall') {
      const bm = arcanopolis_buildingManager(col)
      let lvl = -1
      try {
        const th = bm != null ? bm.getTownHall() : null
        if (th != null) lvl = th.getBuildingLevel()
      } catch (e) { arcanopolis_logErr('townhall.get', e) }
      if (lvl < 0) lvl = arcanopolis_buildingLevel(col, 'townhall')
      return lvl >= row.n
    }
    if (row.kind === 'citizens') {
      return col.getCitizenManager().getCitizens().size() >= row.n
    }
    if (row.kind === 'building') {
      return arcanopolis_buildingLevel(col, row.word) >= row.n
    }
  } catch (e) { arcanopolis_logErr('rowOk.' + row.kind, e) }
  return false
}

const _arcanopolis_done = {}

function arcanopolis_depsDone(name, row) {
  if (!row.deps) return true
  for (const d of row.deps) {
    if (!_arcanopolis_done[name + '|' + d]) return false
  }
  return true
}

ServerEvents.tick(event => {
  const s = event.server || event
  try {
    if (s.getTickCount() % 20 !== 0) return  // раз в секунду
    const players = s.players
    if (!players) return
    for (const p of players) {
      let name = ''
      try { name = String(p.username) } catch (e) { try { name = String(p.getName().getString()) } catch (e2) { return } }
      // два прохода: строки, чьи deps закрылись в этом же тике, не ждут секунду
      for (let pass = 0; pass < 2; pass++) {
        for (const chKey in CHAPTER_CHAINS) {
          const chain = CHAPTER_CHAINS[chKey]
          for (const row of chain) {
            if (row.kind === 'skip') continue
            const dk = name + '|' + row.task
            if (_arcanopolis_done[dk]) continue
            if (!arcanopolis_depsDone(name, row)) continue  // фронт графа: ждём зависимости
            if (!arcanopolis_rowOk(p, row)) continue
            _arcanopolis_done[dk] = true
            try { p.data.ftbquests.addProgress(row.task, 1) } catch (e) {}
            try { s.runCommandSilent('ftbquests change_progress ' + name + ' complete ' + row.task) } catch (e) {}
          }
        }
      }
    }
  } catch (e) {}
})

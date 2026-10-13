// 95_colony_checks.js — СГЕНЕРИРОВАНО tools/gen_quests.py, НЕ редактировать вручную!
// Авто-детект условий MineColonies для квестов FTB Quests (custom-задачи).
// Игрок не может отметить эти задачи вручную — прогресс выдаёт этот скрипт.
// Проверка: раз в 5 секунд на игрока. Ошибки API проглатываются (не роняют сервер).

const CHECKS = [
  { task: "A11A010200000002", kind: "building", word: "builder", n: 1 },
  { task: "A11A010200000003", kind: "townhall", n: 1 },
  { task: "A11A010200000004", kind: "building", word: "builder", n: 2 },
  { task: "A11A010200000005", kind: "building", word: "home", n: 1 },
  { task: "A11A010200000007", kind: "citizens", n: 3 },
  { task: "A11A010200000008", kind: "building", word: "courier", n: 1 },
  { task: "A11A010200000009", kind: "citizens", n: 5 },
  { task: "A11A01020000000C", kind: "building", word: "cook", n: 1 },
  { task: "A11A01020000000D", kind: "building", word: "farm", n: 1 },
  { task: "A11A01020000000E", kind: "building", word: "fish", n: 1 },
  { task: "A11A01020000000F", kind: "building", word: "home", n: 2 },
  { task: "A11A010200000010", kind: "citizens", n: 4 },
  { task: "A11A010200000011", kind: "citizens", n: 6 },
  { task: "A11A010200000012", kind: "citizens", n: 8 },
  { task: "A11A010200000013", kind: "building", word: "guard", n: 1 },
  { task: "A11A010200000014", kind: "building", word: "black", n: 1 },
  { task: "A11A010200000015", kind: "building", word: "stone", n: 1 },
  { task: "A11A010200000021", kind: "building", word: "builder", n: 1 },
  { task: "A11A01020000002A", kind: "building", word: "farm", n: 2 },
  { task: "A11A01020000002C", kind: "building", word: "warehouse", n: 1 },
  { task: "A11A01020000002E", kind: "building", word: "black", n: 1 },
  { task: "A11A010200000030", kind: "citizens", n: 4 },
  { task: "A11A010200000032", kind: "building", word: "home", n: 2 },
  { task: "A11A01020000004A", kind: "building", word: "farm", n: 2 },
  { task: "A11A020200000001", kind: "townhall", n: 2 },
  { task: "A11A020200000002", kind: "townhall", n: 2 },
  { task: "A11A020200000003", kind: "citizens", n: 8 },
  { task: "A11A020200000004", kind: "building", word: "lumberjack", n: 1 },
  { task: "A11A020200000005", kind: "building", word: "miner", n: 1 },
  { task: "A11A020200000006", kind: "building", word: "warehouse", n: 1 },
  { task: "A11A020200000007", kind: "building", word: "courier", n: 1 },
  { task: "A11A020200000008", kind: "building", word: "farm", n: 1 },
  { task: "A11A02020000000F", kind: "always" },
  { task: "A11A020200000011", kind: "building", word: "sawmill", n: 1 },
  { task: "A11A020200000015", kind: "building", word: "home", n: 3 },
  { task: "A11A020200000016", kind: "citizens", n: 4 },
  { task: "A11A020200000017", kind: "citizens", n: 6 },
  { task: "A11A020200000018", kind: "citizens", n: 10 },
  { task: "A11A020200000019", kind: "citizens", n: 12 },
  { task: "A11A02020000001A", kind: "building", word: "lumberjack", n: 2 },
  { task: "A11A02020000001B", kind: "building", word: "miner", n: 2 },
  { task: "A11A02020000001C", kind: "building", word: "farm", n: 2 },
  { task: "A11A02020000001D", kind: "building", word: "cook", n: 2 },
  { task: "A11A02020000001E", kind: "building", word: "fish", n: 2 },
  { task: "A11A02020000001F", kind: "building", word: "saw", n: 1 },
  { task: "A11A020200000020", kind: "building", word: "stone", n: 2 },
  { task: "A11A020200000021", kind: "building", word: "black", n: 2 },
  { task: "A11A020200000022", kind: "building", word: "guard", n: 2 },
  { task: "A11A020200000023", kind: "building", word: "warehouse", n: 2 },
  { task: "A11A020200000024", kind: "building", word: "courier", n: 2 },
  { task: "A11A02020000003D", kind: "building", word: "library", n: 1 },
  { task: "A11A02020000003F", kind: "building", word: "saw", n: 1 },
  { task: "A11A02020000004E", kind: "building", word: "cook", n: 2 },
  { task: "A11A020200000050", kind: "building", word: "miner", n: 2 },
  { task: "A11A020200000052", kind: "building", word: "lumberjack", n: 2 },
  { task: "A11A020200000054", kind: "building", word: "black", n: 2 },
  { task: "A11A020200000056", kind: "building", word: "home", n: 3 },
  { task: "A11A020200000058", kind: "building", word: "warehouse", n: 2 },
  { task: "A11A030200000001", kind: "townhall", n: 3 },
  { task: "A11A030200000002", kind: "townhall", n: 3 },
  { task: "A11A030200000003", kind: "building", word: "builder", n: 3 },
  { task: "A11A030200000004", kind: "building", word: "warehouse", n: 2 },
  { task: "A11A030200000005", kind: "citizens", n: 12 },
  { task: "A11A030200000006", kind: "building", word: "university", n: 1 },
  { task: "A11A030200000007", kind: "building", word: "cook", n: 1 },
  { task: "A11A03020000000C", kind: "always" },
  { task: "A11A03020000000D", kind: "building", word: "mechanic", n: 1 },
  { task: "A11A030200000011", kind: "townhall", n: 3 },
  { task: "A11A030200000012", kind: "citizens", n: 14 },
  { task: "A11A030200000013", kind: "citizens", n: 16 },
  { task: "A11A030200000014", kind: "citizens", n: 18 },
  { task: "A11A030200000015", kind: "citizens", n: 20 },
  { task: "A11A030200000016", kind: "building", word: "builder", n: 3 },
  { task: "A11A030200000017", kind: "building", word: "warehouse", n: 3 },
  { task: "A11A030200000018", kind: "building", word: "mech", n: 1 },
  { task: "A11A030200000019", kind: "building", word: "university", n: 1 },
  { task: "A11A03020000001A", kind: "building", word: "library", n: 2 },
  { task: "A11A03020000001B", kind: "building", word: "school", n: 1 },
  { task: "A11A03020000001C", kind: "building", word: "hospital", n: 1 },
  { task: "A11A03020000001D", kind: "building", word: "cook", n: 3 },
  { task: "A11A03020000001E", kind: "building", word: "farm", n: 3 },
  { task: "A11A03020000001F", kind: "building", word: "guard", n: 3 },
  { task: "A11A030200000020", kind: "building", word: "home", n: 4 },
  { task: "A11A03020000002F", kind: "building", word: "mech", n: 1 },
  { task: "A11A030200000037", kind: "building", word: "warehouse", n: 3 },
  { task: "A11A030200000041", kind: "building", word: "cook", n: 3 },
  { task: "A11A030200000043", kind: "building", word: "black", n: 3 },
  { task: "A11A030200000045", kind: "building", word: "courier", n: 2 },
  { task: "A11A030200000047", kind: "building", word: "cook", n: 3 },
  { task: "A11A030200000049", kind: "building", word: "miner", n: 3 },
  { task: "A11A03020000004B", kind: "building", word: "university", n: 1 },
  { task: "A11A03020000004D", kind: "building", word: "warehouse", n: 3 },
  { task: "A11A03020000004F", kind: "building", word: "mech", n: 1 },
  { task: "A11A040200000001", kind: "townhall", n: 3 },
  { task: "A11A040200000002", kind: "townhall", n: 3 },
  { task: "A11A040200000003", kind: "citizens", n: 20 },
  { task: "A11A040200000004", kind: "building", word: "warehouse", n: 3 },
  { task: "A11A040200000005", kind: "building", word: "university", n: 2 },
  { task: "A11A040200000006", kind: "building", word: "cook", n: 2 },
  { task: "A11A040200000008", kind: "always" },
  { task: "A11A04020000000B", kind: "always" },
  { task: "A11A04020000000D", kind: "building", word: "mechanic", n: 2 },
  { task: "A11A040200000011", kind: "citizens", n: 24 },
  { task: "A11A040200000012", kind: "citizens", n: 28 },
  { task: "A11A040200000013", kind: "citizens", n: 32 },
  { task: "A11A040200000014", kind: "building", word: "university", n: 2 },
  { task: "A11A040200000015", kind: "building", word: "school", n: 2 },
  { task: "A11A040200000016", kind: "building", word: "hospital", n: 2 },
  { task: "A11A040200000017", kind: "building", word: "library", n: 3 },
  { task: "A11A040200000018", kind: "building", word: "mech", n: 2 },
  { task: "A11A040200000019", kind: "building", word: "warehouse", n: 4 },
  { task: "A11A04020000001A", kind: "building", word: "miner", n: 4 },
  { task: "A11A04020000001B", kind: "building", word: "lumberjack", n: 4 },
  { task: "A11A04020000001C", kind: "building", word: "black", n: 3 },
  { task: "A11A04020000001D", kind: "building", word: "saw", n: 3 },
  { task: "A11A04020000001E", kind: "building", word: "guard", n: 4 },
  { task: "A11A04020000001F", kind: "building", word: "cook", n: 4 },
  { task: "A11A040200000020", kind: "building", word: "home", n: 5 },
  { task: "A11A04020000002C", kind: "building", word: "mech", n: 2 },
  { task: "A11A040200000037", kind: "building", word: "mech", n: 2 },
  { task: "A11A04020000003F", kind: "building", word: "miner", n: 4 },
  { task: "A11A040200000041", kind: "building", word: "warehouse", n: 4 },
  { task: "A11A040200000043", kind: "building", word: "mech", n: 2 },
  { task: "A11A040200000045", kind: "building", word: "mech", n: 2 },
  { task: "A11A040200000047", kind: "building", word: "warehouse", n: 4 },
  { task: "A11A040200000049", kind: "building", word: "university", n: 2 },
  { task: "A11A04020000004B", kind: "building", word: "mech", n: 2 },
  { task: "A11A04020000004D", kind: "building", word: "mech", n: 2 },
  { task: "A11A04020000004F", kind: "townhall", n: 3 },
  { task: "A11A050200000001", kind: "townhall", n: 4 },
  { task: "A11A050200000003", kind: "always" },
  { task: "A11A050200000004", kind: "always" },
  { task: "A11A05020000000A", kind: "always" },
  { task: "A11A05020000000B", kind: "always" },
  { task: "A11A05020000000C", kind: "building", word: "library", n: 2 },
  { task: "A11A05020000000D", kind: "building", word: "library", n: 2 },
  { task: "A11A050200000010", kind: "citizens", n: 36 },
  { task: "A11A050200000011", kind: "citizens", n: 40 },
  { task: "A11A050200000012", kind: "building", word: "library", n: 4 },
  { task: "A11A050200000013", kind: "building", word: "university", n: 3 },
  { task: "A11A050200000014", kind: "building", word: "school", n: 3 },
  { task: "A11A050200000015", kind: "building", word: "hospital", n: 3 },
  { task: "A11A050200000016", kind: "building", word: "mech", n: 3 },
  { task: "A11A050200000017", kind: "building", word: "cook", n: 5 },
  { task: "A11A050200000018", kind: "building", word: "guard", n: 5 },
  { task: "A11A050200000019", kind: "building", word: "warehouse", n: 5 },
  { task: "A11A05020000001F", kind: "building", word: "library", n: 4 },
  { task: "A11A050200000022", kind: "building", word: "university", n: 3 },
  { task: "A11A050200000024", kind: "building", word: "mech", n: 3 },
  { task: "A11A05020000002E", kind: "building", word: "library", n: 4 },
  { task: "A11A050200000035", kind: "building", word: "library", n: 4 },
  { task: "A11A05020000003B", kind: "building", word: "library", n: 4 },
  { task: "A11A05020000003E", kind: "building", word: "library", n: 4 },
  { task: "A11A05020000004E", kind: "building", word: "hospital", n: 3 },
  { task: "A11A050200000050", kind: "building", word: "hospital", n: 3 },
  { task: "A11A050200000053", kind: "building", word: "library", n: 4 },
  { task: "A11A060200000001", kind: "townhall", n: 5 },
  { task: "A11A060200000003", kind: "always" },
  { task: "A11A060200000004", kind: "always" },
  { task: "A11A060200000007", kind: "building", word: "mechanic", n: 3 },
  { task: "A11A06020000000B", kind: "citizens", n: 44 },
  { task: "A11A06020000000C", kind: "citizens", n: 48 },
  { task: "A11A06020000000D", kind: "citizens", n: 52 },
  { task: "A11A06020000000E", kind: "building", word: "mech", n: 4 },
  { task: "A11A06020000000F", kind: "building", word: "university", n: 4 },
  { task: "A11A060200000010", kind: "building", word: "hospital", n: 4 },
  { task: "A11A060200000011", kind: "building", word: "library", n: 5 },
  { task: "A11A060200000012", kind: "building", word: "miner", n: 5 },
  { task: "A11A06020000001D", kind: "building", word: "mech", n: 4 },
  { task: "A11A060200000024", kind: "building", word: "mech", n: 4 },
  { task: "A11A060200000026", kind: "building", word: "mech", n: 4 },
  { task: "A11A06020000002A", kind: "building", word: "warehouse", n: 5 },
  { task: "A11A06020000002C", kind: "building", word: "mech", n: 4 },
  { task: "A11A06020000002E", kind: "building", word: "mech", n: 4 },
  { task: "A11A060200000030", kind: "building", word: "courier", n: 3 },
  { task: "A11A060200000032", kind: "townhall", n: 5 },
  { task: "A11A060200000039", kind: "building", word: "warehouse", n: 5 },
  { task: "A11A060200000048", kind: "building", word: "warehouse", n: 5 },
  { task: "A11A06020000004A", kind: "building", word: "university", n: 4 },
  { task: "A11A06020000004C", kind: "building", word: "hospital", n: 4 },
  { task: "A11A06020000004E", kind: "building", word: "library", n: 5 },
  { task: "A11A060200000050", kind: "building", word: "school", n: 3 },
  { task: "A11A060200000052", kind: "building", word: "warehouse", n: 5 },
  { task: "A11A060200000054", kind: "building", word: "mech", n: 4 },
  { task: "A11A060200000056", kind: "building", word: "courier", n: 3 },
  { task: "A11A06020000005B", kind: "building", word: "mech", n: 4 },
  { task: "A11A070200000001", kind: "townhall", n: 6 },
  { task: "A11A070200000008", kind: "always" },
  { task: "A11A070200000009", kind: "always" },
  { task: "A11A07020000000C", kind: "citizens", n: 56 },
  { task: "A11A07020000000D", kind: "citizens", n: 60 },
  { task: "A11A07020000000E", kind: "building", word: "mech", n: 5 },
  { task: "A11A07020000000F", kind: "building", word: "university", n: 5 },
  { task: "A11A070200000010", kind: "building", word: "hospital", n: 5 },
  { task: "A11A070200000011", kind: "building", word: "black", n: 5 },
  { task: "A11A070200000012", kind: "building", word: "miner", n: 5 },
  { task: "A11A070200000013", kind: "building", word: "lumberjack", n: 5 },
  { task: "A11A070200000019", kind: "building", word: "mech", n: 5 },
  { task: "A11A07020000001F", kind: "building", word: "mech", n: 5 },
  { task: "A11A070200000024", kind: "building", word: "library", n: 5 },
  { task: "A11A070200000026", kind: "building", word: "university", n: 5 },
  { task: "A11A070200000029", kind: "townhall", n: 5 },
  { task: "A11A07020000002D", kind: "citizens", n: 60 },
  { task: "A11A070200000042", kind: "building", word: "black", n: 5 },
  { task: "A11A070200000044", kind: "building", word: "library", n: 5 },
  { task: "A11A070200000046", kind: "building", word: "mech", n: 5 },
  { task: "A11A070200000048", kind: "building", word: "warehouse", n: 5 },
  { task: "A11A07020000004A", kind: "citizens", n: 60 },
  { task: "A11A07020000004C", kind: "building", word: "warehouse", n: 5 },
  { task: "A11A07020000004E", kind: "building", word: "university", n: 5 },
  { task: "A11A070200000050", kind: "building", word: "hospital", n: 5 },
  { task: "A11A070200000052", kind: "building", word: "mech", n: 5 },
  { task: "A11A070200000054", kind: "building", word: "guard", n: 5 },
  { task: "A11A070200000056", kind: "building", word: "warehouse", n: 5 },
  { task: "A11A070200000058", kind: "building", word: "farm", n: 5 },
  { task: "A11A07020000005A", kind: "building", word: "library", n: 5 },
  { task: "A11A07020000005C", kind: "citizens", n: 60 },
  { task: "A11A080200000001", kind: "always" },
  { task: "A11A080200000002", kind: "always" },
  { task: "A11A080200000003", kind: "always" },
  { task: "A11A080200000004", kind: "always" },
  { task: "A11A080200000005", kind: "always" },
  { task: "A11A08020000000B", kind: "building", word: "home", n: 3 },
  { task: "A11A08020000000D", kind: "building", word: "farm", n: 2 },
  { task: "A11A090200000001", kind: "always" },
  { task: "A11A090200000002", kind: "always" },
  { task: "A11A090200000005", kind: "always" },
  { task: "A11A09020000000B", kind: "building", word: "university", n: 1 },
  { task: "A11A09020000000D", kind: "building", word: "library", n: 2 },
  { task: "A11A0A0200000001", kind: "always" },
  { task: "A11A0A0200000002", kind: "always" },
  { task: "A11A0A0200000003", kind: "always" },
  { task: "A11A0A0200000004", kind: "always" },
  { task: "A11A0A0200000005", kind: "always" },
  { task: "A11A0A0200000008", kind: "building", word: "school", n: 2 },
  { task: "A11A0A0200000009", kind: "building", word: "university", n: 2 },
  { task: "A11A0A020000000B", kind: "building", word: "library", n: 2 },
  { task: "A11A0B0200000001", kind: "always" },
  { task: "A11A0B0200000002", kind: "always" },
  { task: "A11A0B0200000003", kind: "always" },
  { task: "A11A0B0200000004", kind: "always" },
  { task: "A11A0B0200000005", kind: "always" },
  { task: "A11A0B0200000008", kind: "building", word: "mech", n: 2 },
  { task: "A11A0B020000000A", kind: "building", word: "mech", n: 2 },
  { task: "A11A0B020000000C", kind: "building", word: "university", n: 1 },
  { task: "A11A0C0200000001", kind: "always" },
  { task: "A11A0C0200000002", kind: "always" },
  { task: "A11A0C0200000003", kind: "always" },
  { task: "A11A0C0200000004", kind: "always" },
  { task: "A11A0C020000000A", kind: "building", word: "warehouse", n: 3 },
  { task: "A11A0C020000000C", kind: "building", word: "courier", n: 2 },
  { task: "A11A0D0200000001", kind: "always" },
  { task: "A11A0D0200000002", kind: "always" },
  { task: "A11A0D0200000003", kind: "always" },
  { task: "A11A0D0200000004", kind: "always" },
  { task: "A11A0D0200000005", kind: "always" },
  { task: "A11A0D0200000006", kind: "always" },
]

const IColonyManager = Java.loadClass('com.minecolonies.api.colony.IColonyManager')

function arcanopolis_colonyOf(player) {
  try {
    const mgr = IColonyManager.getInstance()
    let col = null
    try { col = mgr.getIColony(player.getLevel(), player.blockPosition()) } catch (e) {}
    if (col == null) {
      try { col = mgr.getClosestColony(player.getLevel(), player.blockPosition()) } catch (e) {}
    }
    return col
  } catch (e) { return null }
}

function arcanopolis_buildingManager(col) {
  try { if (col.getServerBuildingManager) return col.getServerBuildingManager() } catch (e) {}
  try { return col.getBuildingManager() } catch (e) {}
  return null
}

function arcanopolis_condOk(player, c) {
  if (c.kind === 'always') return true
  try {
    const col = arcanopolis_colonyOf(player)
    if (col == null) return false
    if (c.kind === 'townhall') {
      const bm = arcanopolis_buildingManager(col)
      const th = bm != null ? bm.getTownHall() : null
      return th != null && th.getBuildingLevel() >= c.n
    }
    if (c.kind === 'citizens') {
      return col.getCitizenManager().getCitizens().size() >= c.n
    }
    if (c.kind === 'building') {
      const bm = arcanopolis_buildingManager(col)
      if (bm == null) return false
      const list = bm.getBuildings()
      const it = list.values().iterator()
      while (it.hasNext()) {
        const b = it.next()
        let hay = ''
        try { hay += ' ' + String(b.getSchematicName()) } catch (e) {}
        try { hay += ' ' + String(b.getBuildingType().getRegistryName()) } catch (e) {}
        try { hay += ' ' + String(b.getBuildingType().getSerializedName()) } catch (e) {}
        if (hay.toLowerCase().indexOf(c.word) >= 0) return b.getBuildingLevel() >= c.n
      }
    }
  } catch (e) {}
  return false
}

const _arcanopolis_done = {}

ServerEvents.tick(event => {
  const s = event.server || event
  try {
    if (s.getTickCount() % 100 !== 0) return  // раз в 5 секунд
    const players = s.players
    if (!players) return
    for (const p of players) {
      let name = ''
      try { name = String(p.username) } catch (e) { try { name = String(p.getName().getString()) } catch (e2) { return }}
      for (const c of CHECKS) {
        const key = name + '|' + c.task
        if (_arcanopolis_done[key]) continue
        if (arcanopolis_condOk(p, c)) {
          _arcanopolis_done[key] = true
          try { p.data.ftbquests.addProgress(c.task, 1) } catch (e) {}
          try { s.runCommandSilent('ftbquests change_progress ' + name + ' complete ' + c.task) } catch (e) {}
        }
      }
    }
  } catch (e) {}
})

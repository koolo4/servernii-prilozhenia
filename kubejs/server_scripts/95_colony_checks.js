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
  { task: "A11A030200000001", kind: "townhall", n: 3 },
  { task: "A11A030200000002", kind: "townhall", n: 3 },
  { task: "A11A030200000003", kind: "building", word: "builder", n: 3 },
  { task: "A11A030200000004", kind: "building", word: "warehouse", n: 2 },
  { task: "A11A030200000005", kind: "citizens", n: 12 },
  { task: "A11A030200000006", kind: "building", word: "university", n: 1 },
  { task: "A11A030200000007", kind: "building", word: "cook", n: 1 },
  { task: "A11A03020000000C", kind: "always" },
  { task: "A11A03020000000D", kind: "building", word: "mechanic", n: 1 },
  { task: "A11A040200000001", kind: "townhall", n: 3 },
  { task: "A11A040200000002", kind: "townhall", n: 3 },
  { task: "A11A040200000003", kind: "citizens", n: 20 },
  { task: "A11A040200000004", kind: "building", word: "warehouse", n: 3 },
  { task: "A11A040200000005", kind: "building", word: "university", n: 2 },
  { task: "A11A040200000006", kind: "building", word: "cook", n: 2 },
  { task: "A11A040200000008", kind: "always" },
  { task: "A11A04020000000B", kind: "always" },
  { task: "A11A04020000000D", kind: "building", word: "mechanic", n: 2 },
  { task: "A11A050200000001", kind: "townhall", n: 4 },
  { task: "A11A050200000003", kind: "always" },
  { task: "A11A050200000004", kind: "always" },
  { task: "A11A05020000000A", kind: "always" },
  { task: "A11A05020000000B", kind: "always" },
  { task: "A11A05020000000C", kind: "building", word: "library", n: 2 },
  { task: "A11A05020000000D", kind: "building", word: "library", n: 2 },
  { task: "A11A060200000001", kind: "townhall", n: 5 },
  { task: "A11A060200000003", kind: "always" },
  { task: "A11A060200000004", kind: "always" },
  { task: "A11A060200000007", kind: "building", word: "mechanic", n: 3 },
  { task: "A11A070200000001", kind: "townhall", n: 6 },
  { task: "A11A070200000008", kind: "always" },
  { task: "A11A070200000009", kind: "always" },
  { task: "A11A080200000001", kind: "always" },
  { task: "A11A080200000002", kind: "always" },
  { task: "A11A080200000003", kind: "always" },
  { task: "A11A080200000004", kind: "always" },
  { task: "A11A080200000005", kind: "always" },
  { task: "A11A090200000001", kind: "always" },
  { task: "A11A090200000002", kind: "always" },
  { task: "A11A090200000005", kind: "always" },
  { task: "A11A0A0200000001", kind: "always" },
  { task: "A11A0A0200000002", kind: "always" },
  { task: "A11A0A0200000003", kind: "always" },
  { task: "A11A0A0200000004", kind: "always" },
  { task: "A11A0A0200000005", kind: "always" },
  { task: "A11A0B0200000001", kind: "always" },
  { task: "A11A0B0200000002", kind: "always" },
  { task: "A11A0B0200000003", kind: "always" },
  { task: "A11A0B0200000004", kind: "always" },
  { task: "A11A0B0200000005", kind: "always" },
  { task: "A11A0C0200000001", kind: "always" },
  { task: "A11A0C0200000002", kind: "always" },
  { task: "A11A0C0200000003", kind: "always" },
  { task: "A11A0C0200000004", kind: "always" },
  { task: "A11A0D0200000001", kind: "always" },
  { task: "A11A0D0200000002", kind: "always" },
  { task: "A11A0D0200000003", kind: "always" },
  { task: "A11A0D0200000004", kind: "always" },
  { task: "A11A0D0200000005", kind: "always" },
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

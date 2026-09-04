// Aggregate a set of normalized matches into display stats. Runs client-side so
// the Dashboard can recompute stats for any mode selection without re-fetching.

// Empty bucket for per-agent / per-map grouping.
function bucket() {
  return { matches: 0, wins: 0, kills: 0, deaths: 0, acs: 0, adr: 0, hs: 0 }
}
function add(b, m) {
  b.matches++
  if (m.won) b.wins++
  b.kills += m.kills || 0
  b.deaths += m.deaths || 0
  b.acs += m.acs || 0
  b.adr += m.adr || 0
  b.hs += m.hsPct || 0
}
function summarize(key, b) {
  return {
    key,
    matches: b.matches,
    wins: b.wins,
    losses: b.matches - b.wins,
    wr: Math.round((b.wins / b.matches) * 100),
    kd: b.deaths > 0 ? (b.kills / b.deaths).toFixed(2) : b.kills.toFixed(2),
    acs: Math.round(b.acs / b.matches),
    adr: Math.round(b.adr / b.matches),
    hsPct: Math.round(b.hs / b.matches),
  }
}

export function aggregateStats(matches) {
  const n = matches.length
  if (!n) {
    return {
      matchCount: 0, wins: 0, winRate: 0, kd: '0.00', acs: 0, adr: 0, hsPct: 0,
      topAgents: [], maps: [], agents: [], weapons: [],
    }
  }

  let kills = 0, deaths = 0, acs = 0, adr = 0, hs = 0, wins = 0
  const byAgent = {}
  const byMap = {}
  const byWeapon = {}

  for (const m of matches) {
    kills += m.kills || 0
    deaths += m.deaths || 0
    acs += m.acs || 0
    adr += m.adr || 0
    hs += m.hsPct || 0
    if (m.won) wins++
    if (m.agent) add((byAgent[m.agent] = byAgent[m.agent] || bucket()), m)
    if (m.map) add((byMap[m.map] = byMap[m.map] || bucket()), m)
    for (const [w, c] of Object.entries(m.weapons || {})) byWeapon[w] = (byWeapon[w] || 0) + c
  }

  const totalWeaponKills = Object.values(byWeapon).reduce((a, b) => a + b, 0)
  const weapons = Object.entries(byWeapon)
    .map(([name, kills]) => ({ name, kills, pct: totalWeaponKills ? Math.round((kills / totalWeaponKills) * 100) : 0 }))
    .sort((a, b) => b.kills - a.kills)

  const agents = Object.entries(byAgent)
    .map(([k, b]) => ({ ...summarize(k, b), agent: k, pct: Math.round((b.matches / n) * 100) }))
    .sort((a, b) => b.matches - a.matches)

  const maps = Object.entries(byMap)
    .map(([k, b]) => ({ ...summarize(k, b), map: k }))
    .sort((a, b) => b.matches - a.matches)

  const topAgents = agents.slice(0, 5).map((a) => ({ agent: a.agent, count: a.matches, pct: a.pct }))

  return {
    matchCount: n,
    wins,
    winRate: Math.round((wins / n) * 100),
    kd: deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2),
    acs: Math.round(acs / n),
    adr: Math.round(adr / n),
    hsPct: Math.round(hs / n),
    topAgents,
    agents,
    maps,
    weapons,
  }
}

// Order modes so the collegiate-relevant ones come first.
const MODE_PRIORITY = { Competitive: 0, Custom: 1, Premier: 2, Unrated: 3 }

export function orderModes(modes) {
  return [...modes].sort((a, b) => {
    const pa = MODE_PRIORITY[a] ?? 50
    const pb = MODE_PRIORITY[b] ?? 50
    return pa - pb || a.localeCompare(b)
  })
}

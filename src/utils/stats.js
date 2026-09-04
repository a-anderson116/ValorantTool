// Aggregate a set of normalized matches into display stats. Runs client-side so
// the Dashboard can recompute stats for any mode selection without re-fetching.

export function aggregateStats(matches) {
  const n = matches.length
  if (!n) {
    return { matchCount: 0, wins: 0, winRate: 0, kd: '0.00', acs: 0, adr: 0, hsPct: 0, topAgents: [], maps: [] }
  }

  let kills = 0, deaths = 0, acs = 0, adr = 0, hs = 0, wins = 0
  const agentCounts = {}
  const mapStats = {}

  for (const m of matches) {
    kills += m.kills || 0
    deaths += m.deaths || 0
    acs += m.acs || 0
    adr += m.adr || 0
    hs += m.hsPct || 0
    if (m.won) wins++
    if (m.agent) agentCounts[m.agent] = (agentCounts[m.agent] || 0) + 1
    if (m.map) {
      if (!mapStats[m.map]) mapStats[m.map] = { wins: 0, losses: 0 }
      m.won ? mapStats[m.map].wins++ : mapStats[m.map].losses++
    }
  }

  const topAgents = Object.entries(agentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([agent, count]) => ({ agent, count, pct: Math.round((count / n) * 100) }))

  const maps = Object.entries(mapStats)
    .map(([map, { wins: w, losses: l }]) => ({ map, wins: w, losses: l, wr: Math.round((w / (w + l)) * 100) }))
    .sort((a, b) => b.wins + b.losses - (a.wins + a.losses))

  return {
    matchCount: n,
    wins,
    winRate: Math.round((wins / n) * 100),
    kd: deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2),
    acs: Math.round(acs / n),
    adr: Math.round(adr / n),
    hsPct: Math.round(hs / n),
    topAgents,
    maps,
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

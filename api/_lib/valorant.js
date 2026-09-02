/**
 * Player data fetching + stat aggregation for the serverless backend.
 *
 * Source strategy:
 *   1. Riot API (val/match/v1) using RIOT_API_KEY — used once your Riot product
 *      is approved for VAL-MATCH-V1. Attempted first when a key is present.
 *   2. HenrikDev community API — no key required, works today. Fallback so the
 *      app shows real data before Riot approval.
 *
 * Only ever called for the SIGNED-IN player (who has opted in by authenticating),
 * so this is opt-in compliant.
 */

const HENRIK_BASE = 'https://api.henrikdev.tech/valorant'

// region code -> Riot VAL platform host prefix
const PLATFORM = { na: 'na', latam: 'na', br: 'br', eu: 'eu', kr: 'kr', ap: 'ap' }

function henrikHeaders() {
  return process.env.HENRIK_API_KEY ? { Authorization: process.env.HENRIK_API_KEY } : {}
}

// ---- Normalized shapes -----------------------------------------------------
// match: { id, map, mode, startedAt, agent, won, kills, deaths, assists, acs, adr, hsPct }
// stats: { matchCount, kills, deaths, assists, kd, acs, adr, hsPct, topAgents, maps }

function emptyStats() {
  return {
    matchCount: 0, kills: 0, deaths: 0, assists: 0,
    kd: '0.00', acs: 0, adr: 0, hsPct: 0, topAgents: [], maps: [],
  }
}

function aggregate(matches) {
  if (!matches.length) return emptyStats()
  let kills = 0, deaths = 0, assists = 0, acs = 0, adr = 0, hs = 0
  const agentCounts = {}
  const mapStats = {}

  for (const m of matches) {
    kills += m.kills
    deaths += m.deaths
    assists += m.assists
    acs += m.acs
    adr += m.adr
    hs += m.hsPct
    if (m.agent) agentCounts[m.agent] = (agentCounts[m.agent] || 0) + 1
    if (m.map) {
      if (!mapStats[m.map]) mapStats[m.map] = { wins: 0, losses: 0 }
      m.won ? mapStats[m.map].wins++ : mapStats[m.map].losses++
    }
  }
  const n = matches.length
  const topAgents = Object.entries(agentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([agent, count]) => ({ agent, count, pct: Math.round((count / n) * 100) }))
  const maps = Object.entries(mapStats)
    .map(([map, { wins, losses }]) => ({
      map, wins, losses, wr: Math.round((wins / (wins + losses)) * 100),
    }))
    .sort((a, b) => b.wins + b.losses - (a.wins + a.losses))

  return {
    matchCount: n,
    kills, deaths, assists,
    kd: deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2),
    acs: Math.round(acs / n),
    adr: Math.round(adr / n),
    hsPct: Math.round(hs / n),
    topAgents,
    maps,
  }
}

// ---- HenrikDev source ------------------------------------------------------
async function fromHenrik({ gameName, tagLine, region, count }) {
  const url = `${HENRIK_BASE}/v3/matches/${region}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?size=${count}`
  const res = await fetch(url, { headers: henrikHeaders() })
  if (!res.ok) throw new Error(`Henrik ${res.status}`)
  const body = await res.json()
  const target = `${gameName}#${tagLine}`.toLowerCase()

  const matches = (body.data || [])
    .map((m) => {
      const meta = m.metadata || {}
      const rounds = meta.rounds_played || 1
      const p = (m.players?.all_players || []).find(
        (pl) => `${pl.name}#${pl.tag}`.toLowerCase() === target
      )
      if (!p) return null
      const s = p.stats || {}
      const shots = (s.headshots || 0) + (s.bodyshots || 0) + (s.legshots || 0)
      const redWon = m.teams?.red?.has_won
      const won = (p.team === 'Red' && redWon) || (p.team === 'Blue' && !redWon)
      return {
        id: meta.matchid,
        map: meta.map,
        mode: meta.mode,
        startedAt: meta.game_start_patched,
        agent: p.character,
        won,
        kills: s.kills || 0,
        deaths: s.deaths || 0,
        assists: s.assists || 0,
        acs: s.score ? Math.round(s.score / rounds) : 0,
        adr: p.damage_made ? Math.round(p.damage_made / rounds) : 0,
        hsPct: shots ? Math.round(((s.headshots || 0) / shots) * 100) : 0,
      }
    })
    .filter(Boolean)

  return { source: 'henrik', matches, stats: aggregate(matches) }
}

// ---- Riot source (VAL-MATCH-V1) -------------------------------------------
async function fromRiot({ puuid, region, count }) {
  const key = process.env.RIOT_API_KEY
  const host = `https://${PLATFORM[region] || 'na'}.api.riotgames.com`
  const listRes = await fetch(`${host}/val/match/v1/matchlists/by-puuid/${puuid}`, {
    headers: { 'X-Riot-Token': key },
  })
  if (!listRes.ok) throw new Error(`Riot matchlist ${listRes.status}`)
  const list = await listRes.json()
  const ids = (list.history || []).slice(0, count).map((h) => h.matchId)

  const details = await Promise.all(
    ids.map((id) =>
      fetch(`${host}/val/match/v1/matches/${id}`, { headers: { 'X-Riot-Token': key } })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  )

  const matches = details
    .filter(Boolean)
    .map((m) => {
      const rounds = (m.roundResults || []).length || 1
      const p = (m.players || []).find((pl) => pl.puuid === puuid)
      if (!p) return null
      const st = p.stats || {}
      const teamWon = (m.teams || []).find((t) => t.teamId === p.teamId)?.won
      return {
        id: m.matchInfo?.matchId,
        map: (m.matchInfo?.mapId || '').split('/').pop(),
        mode: (m.matchInfo?.queueId || 'custom'),
        startedAt: m.matchInfo?.gameStartMillis
          ? new Date(m.matchInfo.gameStartMillis).toISOString()
          : null,
        agent: p.characterId,
        won: Boolean(teamWon),
        kills: st.kills || 0,
        deaths: st.deaths || 0,
        assists: st.assists || 0,
        acs: st.score ? Math.round(st.score / rounds) : 0,
        adr: 0, // ADR requires per-round damage summation; omitted for brevity
        hsPct: 0,
      }
    })
    .filter(Boolean)

  return { source: 'riot', matches, stats: aggregate(matches) }
}

// ---- Public entry ----------------------------------------------------------
export async function getPlayerData({ puuid, gameName, tagLine, region = 'na', count = 10 }) {
  // Try Riot first when a key + puuid are available; fall back to Henrik on any
  // failure (e.g. VAL-MATCH-V1 not yet approved for the key).
  if (process.env.RIOT_API_KEY && puuid) {
    try {
      return await fromRiot({ puuid, region, count })
    } catch (e) {
      // fall through to Henrik
    }
  }
  if (gameName && tagLine) {
    return await fromHenrik({ gameName, tagLine, region, count })
  }
  return { source: 'none', matches: [], stats: emptyStats() }
}

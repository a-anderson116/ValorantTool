const HENRIK_BASE = 'https://api.henrikdev.tech/valorant'

export async function fetchMatchByID(matchId) {
  try {
    const res = await fetch(`${HENRIK_BASE}/v2/match/${matchId}`)
    if (!res.ok) throw new Error(`Henrik API error: ${res.status}`)
    const data = await res.json()
    return { source: 'henrik', data: data.data }
  } catch (err) {
    console.warn('Henrik API failed, using mock data:', err.message)
    return { source: 'mock', data: null }
  }
}

export async function fetchPlayerByName(name, tag, region = 'na') {
  try {
    const res = await fetch(`${HENRIK_BASE}/v1/account/${name}/${tag}`)
    if (!res.ok) throw new Error(`Henrik API error: ${res.status}`)
    const data = await res.json()
    return data.data
  } catch (err) {
    console.warn('Player fetch failed:', err.message)
    return null
  }
}

export async function fetchMatchHistory(name, tag, region = 'na', mode = 'competitive') {
  try {
    const res = await fetch(`${HENRIK_BASE}/v3/matches/${region}/${name}/${tag}?mode=${mode}&size=10`)
    if (!res.ok) throw new Error(`Henrik API error: ${res.status}`)
    const data = await res.json()
    return data.data
  } catch (err) {
    console.warn('Match history fetch failed:', err.message)
    return null
  }
}

export function transformHenrikMatch(match) {
  if (!match) return null
  const { metadata, players, teams, rounds } = match
  return {
    id: metadata.matchid,
    map: metadata.map,
    mode: metadata.mode,
    date: metadata.game_start_patched,
    duration: `${Math.floor(metadata.game_length / 60)}m ${metadata.game_length % 60}s`,
    teamA: {
      name: 'Team A',
      score: teams?.red?.rounds_won || 0,
      side_start: teams?.red?.roster ? 'Attack' : 'Defense'
    },
    teamB: {
      name: 'Team B',
      score: teams?.blue?.rounds_won || 0,
    },
    players: players?.all_players?.map(p => ({
      name: p.name,
      tag: p.tag,
      agent: p.character,
      team: p.team,
      acs: p.stats?.score ? Math.round(p.stats.score / metadata.rounds_played) : 0,
      kills: p.stats?.kills || 0,
      deaths: p.stats?.deaths || 0,
      assists: p.stats?.assists || 0,
      kd: p.stats?.deaths ? (p.stats.kills / p.stats.deaths).toFixed(2) : p.stats?.kills || 0,
      hs: p.stats?.headshots && p.stats.kills ? Math.round((p.stats.headshots / p.stats.kills) * 100) : 0,
      adr: p.damage_made ? Math.round(p.damage_made / metadata.rounds_played) : 0,
    })) || []
  }
}

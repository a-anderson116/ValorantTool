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

// Riot returns internal map code names (mapId path). Translate to display names.
const MAP_NAMES = {
  Ascent: 'Ascent', Duality: 'Bind', Triad: 'Haven', Bonsai: 'Split',
  Port: 'Icebox', Foxtrot: 'Breeze', Canyon: 'Fracture', Jam: 'Lotus',
  Pitt: 'Pearl', Juliett: 'Sunset', Infinity: 'Abyss', Plummet: 'Summit',
  District: 'District', Kasbah: 'Kasbah', Drift: 'Drift', Piazza: 'Piazza', Glitch: 'Glitch',
}

// Riot queueId -> friendly mode name.
const QUEUE_NAMES = {
  competitive: 'Competitive', unrated: 'Unrated', swiftplay: 'Swiftplay',
  spikerush: 'Spike Rush', deathmatch: 'Deathmatch', ggteam: 'Escalation',
  hurm: 'Team Deathmatch', premier: 'Premier', newmap: 'New Map', '': 'Custom',
}

// Riot characterId (agent UUID) -> agent name.
const AGENT_NAMES = {
  '41fb69c1-4189-7b37-f117-bcaf1e96f1bf': 'Astra',
  '5f8d3a7f-467b-97f3-062c-13acf203c006': 'Breach',
  '9f0d8ba9-4140-b941-57d3-a7ad57c6b417': 'Brimstone',
  '22697a3d-45bf-8dd7-4fec-84a9e28c69d7': 'Chamber',
  '1dbf2edd-4729-0984-3115-daa5eed44993': 'Clove',
  '117ed9e3-49f3-6512-3ccf-0cada7e3823b': 'Cypher',
  'cc8b64c8-4b25-4ff9-6e7f-37b4da43d235': 'Deadlock',
  'dade69b4-4f5a-8528-247b-219e5a1facd6': 'Fade',
  'e370fa57-4757-3604-3648-499e1f642d3f': 'Gekko',
  '95b78ed7-4637-86d9-7e41-71ba8c293152': 'Harbor',
  '0e38b510-41a8-5780-5e8f-568b2a4f2d6c': 'Iso',
  'add6443a-41bd-e414-f6ad-e58d267f4e95': 'Jett',
  '601dbbe7-43ce-be57-2a40-4abd24953621': 'KAY/O',
  '1e58de9c-4950-5125-93e9-a0aee9f98746': 'Killjoy',
  'bb2a4828-46eb-8cd1-e765-15848195d751': 'Neon',
  '8e253930-4c05-31dd-1b6c-968525494517': 'Omen',
  'eb93336a-449b-9c1b-0a54-a891f7921d69': 'Phoenix',
  'f94c3b30-42be-e959-889c-5aa313dba261': 'Raze',
  'a3bfb853-43b2-7238-a4f1-ad90e9e46bcf': 'Reyna',
  '569fdd95-4d10-43ab-ca70-79becc718b46': 'Sage',
  '6f2a04ca-43e0-be17-7f36-b3908627744d': 'Skye',
  '320b2a48-4d9b-a075-30f1-1f93a9b638fa': 'Sova',
  '707eab51-4836-f488-046a-cda6bf494859': 'Viper',
  '7f94d92c-4234-0a36-9646-3a87eb8b06fe': 'Yoru',
  'efba5359-4016-a1e5-7626-b1ae76895940': 'Vyse',
  'df1cb487-4902-002e-5c17-d28e83e78588': 'Waylay',
  'b444168c-4e35-8076-db47-ef9bf368f384': 'Tejo',
}

function henrikHeaders() {
  return process.env.HENRIK_API_KEY ? { Authorization: process.env.HENRIK_API_KEY } : {}
}

// Weapon UUID -> display name, fetched once from the public content DB and cached
// on the warm instance (avoids hardcoding UUIDs that change when Riot adds guns).
let _weaponMap = null
async function getWeaponNames() {
  if (_weaponMap) return _weaponMap
  try {
    const res = await fetch('https://valorant-api.com/v1/weapons')
    const body = await res.json()
    const map = {}
    for (const w of body.data || []) map[String(w.uuid).toLowerCase()] = w.displayName
    _weaponMap = map
  } catch {
    _weaponMap = {}
  }
  return _weaponMap
}

// Agent ability "weapons" not present in the content DB (keys lowercased).
// Add more as their raw damageItem ids are identified.
const ABILITY_WEAPONS = {
  '856d9a7e-4b06-dc37-15dc-9d809c37cb90': 'Headhunter', // Chamber Q
  // '<uuid>': 'Tour de Force',  // Chamber ultimate
  // '<uuid>': 'Blade Storm',    // Jett knives ultimate
}

// Classify a Riot finishingDamage object into a weapon/ability label.
function killLabel(fd, weaponMap) {
  const item = fd?.damageItem
  const type = fd?.damageType
  const lc = item ? String(item).toLowerCase() : ''
  if (lc && weaponMap[lc]) return weaponMap[lc]
  if (lc && ABILITY_WEAPONS[lc]) return ABILITY_WEAPONS[lc]
  if (type === 'Bomb' || /bomb/.test(lc)) return 'Spike'
  if (type === 'Melee' || /melee/.test(lc)) return 'Melee'
  if (type === 'Ability' || /ability|grenade|ultimate|primary/.test(lc)) return 'Ability'
  // Unknown weapon-type id: surface it so a distinct ability-weapon (like
  // Chamber's Headhunter) can be identified and named. No id at all -> ability.
  return lc ? String(item) : 'Ability'
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

  const [details, weaponMap] = await Promise.all([
    Promise.all(
      ids.map((id) =>
        fetch(`${host}/val/match/v1/matches/${id}`, { headers: { 'X-Riot-Token': key } })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ),
    getWeaponNames(),
  ])

  const matches = details
    .filter(Boolean)
    .map((m) => {
      const rounds = (m.roundResults || []).length || 1
      const p = (m.players || []).find((pl) => pl.puuid === puuid)
      if (!p) return null
      const st = p.stats || {}
      const teamWon = (m.teams || []).find((t) => t.teamId === p.teamId)?.won

      // Per-round: damage/hits (ADR, HS%), weapon kills, first blood/death, multikills.
      let dmg = 0, hs = 0, bs = 0, ls = 0
      let fk = 0, fd = 0, k2 = 0, k3 = 0, k4 = 0, k5 = 0
      const weapons = {}
      for (const rr of m.roundResults || []) {
        const ps = (rr.playerStats || []).find((x) => x.puuid === puuid)
        for (const d of ps?.damage || []) {
          dmg += d.damage || 0
          hs += d.headshots || 0
          bs += d.bodyshots || 0
          ls += d.legshots || 0
        }
        for (const k of ps?.kills || []) {
          const label = killLabel(k.finishingDamage, weaponMap)
          weapons[label] = (weapons[label] || 0) + 1
        }

        // Multikills: how many kills the player got this round.
        const myKills = (ps?.kills || []).length
        if (myKills >= 5) k5++
        else if (myKills === 4) k4++
        else if (myKills === 3) k3++
        else if (myKills === 2) k2++

        // First blood / first death: the earliest kill in the round.
        let first = null
        for (const q of rr.playerStats || []) {
          for (const k of q.kills || []) {
            const t = k.timeSinceRoundStartMillis ?? k.timeSinceGameStartMillis ?? 0
            if (!first || t < first.t) first = { t, killer: q.puuid, victim: k.victim }
          }
        }
        if (first) {
          if (first.killer === puuid) fk++
          if (first.victim === puuid) fd++
        }
      }
      const shots = hs + bs + ls
      const codename = (m.matchInfo?.mapId || '').split('/').pop()
      const queueId = m.matchInfo?.queueId || ''

      return {
        id: m.matchInfo?.matchId,
        map: MAP_NAMES[codename] || codename,
        mode: QUEUE_NAMES[queueId] ?? (queueId || 'Custom'),
        startedAt: m.matchInfo?.gameStartMillis
          ? new Date(m.matchInfo.gameStartMillis).toISOString()
          : null,
        agent: AGENT_NAMES[p.characterId] || p.characterId,
        won: Boolean(teamWon),
        kills: st.kills || 0,
        deaths: st.deaths || 0,
        assists: st.assists || 0,
        acs: st.score ? Math.round(st.score / rounds) : 0,
        adr: Math.round(dmg / rounds),
        hsPct: shots ? Math.round((hs / shots) * 100) : 0,
        weapons,
        fk, fd, k2, k3, k4, k5,
      }
    })
    .filter(Boolean)

  return { source: 'riot', matches, stats: aggregate(matches) }
}

// Competitive tier number -> rank name.
const TIERS = [
  'Unranked', '', '', 'Iron 1', 'Iron 2', 'Iron 3', 'Bronze 1', 'Bronze 2', 'Bronze 3',
  'Silver 1', 'Silver 2', 'Silver 3', 'Gold 1', 'Gold 2', 'Gold 3',
  'Platinum 1', 'Platinum 2', 'Platinum 3', 'Diamond 1', 'Diamond 2', 'Diamond 3',
  'Ascendant 1', 'Ascendant 2', 'Ascendant 3', 'Immortal 1', 'Immortal 2', 'Immortal 3', 'Radiant',
]

function roundOutcome(rr) {
  const code = (rr.roundResultCode || rr.roundResult || '').toLowerCase()
  if (code.includes('detonate') || code.includes('bomb')) return 'Spike'
  if (code.includes('defus')) return 'Defuse'
  if (code.includes('elim')) return 'Elimination'
  if (code.includes('surrender')) return 'Surrender'
  if (code.includes('timer') || code.includes('time')) return 'Time'
  return rr.roundResult || '—'
}

/**
 * Full match detail: scoreboard (all players), round-by-round outcomes, and
 * per-round team economy. Names are masked for everyone except `mePuuid` to
 * honor the opt-in policy (only the signed-in player is opted in).
 */
export async function getMatchDetail({ matchId, region = 'na', mePuuid }) {
  const key = process.env.RIOT_API_KEY
  // ---- Riot source ----
  if (key) {
    try {
      const host = `https://${PLATFORM[region] || 'na'}.api.riotgames.com`
      const res = await fetch(`${host}/val/match/v1/matches/${matchId}`, {
        headers: { 'X-Riot-Token': key },
      })
      if (!res.ok) throw new Error(`Riot match ${res.status}`)
      const m = await res.json()
      const weaponMap = await getWeaponNames()
      const rounds = (m.roundResults || []).length || 1

      // Per-player damage/hits across rounds -> ADR, HS%.
      const acc = {}
      const teamByPuuid = {}
      // puuid -> display identity for the kill feed (names masked except me).
      const pmap = {}
      for (const p of m.players || []) {
        teamByPuuid[p.puuid] = p.teamId
        pmap[p.puuid] = {
          agent: AGENT_NAMES[p.characterId] || p.characterId,
          team: p.teamId,
          isMe: p.puuid === mePuuid,
          name: p.puuid === mePuuid ? `${p.gameName}#${p.tagLine}` : null,
        }
      }
      for (const rr of m.roundResults || []) {
        for (const ps of rr.playerStats || []) {
          const a = (acc[ps.puuid] = acc[ps.puuid] || { dmg: 0, hs: 0, bs: 0, ls: 0 })
          for (const d of ps.damage || []) {
            a.dmg += d.damage || 0; a.hs += d.headshots || 0
            a.bs += d.bodyshots || 0; a.ls += d.legshots || 0
          }
        }
      }

      const players = (m.players || []).map((p) => {
        const st = p.stats || {}
        const a = acc[p.puuid] || { dmg: 0, hs: 0, bs: 0, ls: 0 }
        const shots = a.hs + a.bs + a.ls
        const isMe = p.puuid === mePuuid
        return {
          team: p.teamId,
          agent: AGENT_NAMES[p.characterId] || p.characterId,
          name: isMe ? `${p.gameName}#${p.tagLine}` : null, // masked otherwise
          rank: TIERS[p.competitiveTier] || null,
          isMe,
          kills: st.kills || 0, deaths: st.deaths || 0, assists: st.assists || 0,
          acs: st.score ? Math.round(st.score / rounds) : 0,
          adr: Math.round(a.dmg / rounds),
          hsPct: shots ? Math.round((a.hs / shots) * 100) : 0,
        }
      }).sort((x, y) => y.acs - x.acs)

      const roundList = (m.roundResults || []).map((rr, i) => {
        const buys = {}
        const kills = []
        for (const ps of rr.playerStats || []) {
          const t = teamByPuuid[ps.puuid]
          buys[t] = (buys[t] || 0) + (ps.economy?.loadoutValue || 0)
          for (const k of ps.kills || []) {
            kills.push({
              t: k.timeSinceRoundStartMillis ?? k.timeSinceGameStartMillis ?? 0,
              killer: pmap[ps.puuid] || { agent: '?' },
              victim: pmap[k.victim] || { agent: '?' },
              weapon: killLabel(k.finishingDamage, weaponMap),
            })
          }
        }
        kills.sort((a, b) => a.t - b.t)
        return {
          num: i + 1,
          winner: rr.winningTeam,
          outcome: roundOutcome(rr),
          buys,
          kills: kills.map(({ t, ...rest }) => rest),
        }
      })

      const codename = (m.matchInfo?.mapId || '').split('/').pop()
      return {
        source: 'riot',
        meta: {
          id: m.matchInfo?.matchId,
          map: MAP_NAMES[codename] || codename,
          mode: QUEUE_NAMES[m.matchInfo?.queueId] ?? (m.matchInfo?.queueId || 'Custom'),
          startedAt: m.matchInfo?.gameStartMillis ? new Date(m.matchInfo.gameStartMillis).toISOString() : null,
          lengthMin: m.matchInfo?.gameLengthMillis ? Math.round(m.matchInfo.gameLengthMillis / 60000) : null,
          teams: (m.teams || []).map((t) => ({ team: t.teamId, won: t.won, roundsWon: t.roundsWon })),
        },
        players,
        rounds: roundList,
      }
    } catch (e) {
      // fall through to Henrik
    }
  }

  // ---- HenrikDev fallback ----
  const res = await fetch(`${HENRIK_BASE}/v2/match/${matchId}`, { headers: henrikHeaders() })
  if (!res.ok) throw new Error(`Henrik match ${res.status}`)
  const body = await res.json()
  const d = body.data || {}
  const meMatch = (d.players?.all_players || []).find(
    (p) => p.puuid === mePuuid || (mePuuid == null && false)
  )
  const rounds = d.metadata?.rounds_played || 1
  const players = (d.players?.all_players || []).map((p) => {
    const s = p.stats || {}
    const shots = (s.headshots || 0) + (s.bodyshots || 0) + (s.legshots || 0)
    const isMe = p.puuid === mePuuid
    return {
      team: p.team, agent: p.character,
      name: isMe ? `${p.name}#${p.tag}` : null,
      rank: p.currenttier_patched || null,
      isMe,
      kills: s.kills || 0, deaths: s.deaths || 0, assists: s.assists || 0,
      acs: s.score ? Math.round(s.score / rounds) : 0,
      adr: p.damage_made ? Math.round(p.damage_made / rounds) : 0,
      hsPct: shots ? Math.round(((s.headshots || 0) / shots) * 100) : 0,
    }
  }).sort((x, y) => y.acs - x.acs)

  const roundList = (d.rounds || []).map((r, i) => ({
    num: i + 1,
    winner: r.winning_team,
    outcome: r.end_type || '—',
    buys: { Red: r.bomb_planted ? null : null }, // Henrik economy is per-player; omit team totals
  }))

  return {
    source: 'henrik',
    meta: {
      id: d.metadata?.matchid,
      map: d.metadata?.map,
      mode: d.metadata?.mode,
      startedAt: d.metadata?.game_start_patched,
      lengthMin: d.metadata?.game_length ? Math.round(d.metadata.game_length / 60) : null,
      teams: [
        { team: 'Red', won: d.teams?.red?.has_won, roundsWon: d.teams?.red?.rounds_won },
        { team: 'Blue', won: d.teams?.blue?.has_won, roundsWon: d.teams?.blue?.rounds_won },
      ],
    },
    players,
    rounds: roundList,
  }
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

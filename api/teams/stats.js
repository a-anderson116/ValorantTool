import { requireSession, isAdmin } from '../_lib/session.js'
import { getTeam } from '../_lib/teamsStore.js'
import { getPlayerData, resolvePuuid } from '../_lib/valorant.js'
import { isOptedIn } from '../_lib/optinStore.js'

/**
 * GET /api/teams/stats?id=<teamId>
 *
 * Combined scouting view for a saved team. For each roster player we fetch
 * recent-match stats — but only for players who have opted in (or when the
 * viewer is an admin). Non-opted players are returned flagged, without data.
 */
export default async function handler(req, res) {
  const session = requireSession(req, res)
  if (!session) return
  const admin = isAdmin(session)

  const team = await getTeam(session.puuid, req.query.id)
  if (!team) return res.status(404).json({ success: false, error: 'Team not found' })

  try {
    const players = await Promise.all(
      (team.players || []).map(async (p) => {
        const puuid = await resolvePuuid(p.name, p.tag, p.region)
        const visible = admin || (puuid && (await isOptedIn(puuid)))
        if (!visible) {
          return { name: p.name, tag: p.tag, region: p.region, optedIn: false }
        }
        const { stats, matches, source } = await getPlayerData({
          puuid, gameName: p.name, tagLine: p.tag, region: p.region, count: 8,
        })
        const wins = matches.filter((m) => m.won).length
        return {
          name: p.name, tag: p.tag, region: p.region, optedIn: true, source,
          matchCount: stats.matchCount,
          wr: matches.length ? Math.round((wins / matches.length) * 100) : 0,
          acs: stats.acs, kd: stats.kd, adr: stats.adr, hsPct: stats.hsPct,
          agents: (stats.topAgents || []).slice(0, 3),
          maps: matches.map((m) => ({ map: m.map, won: m.won })),
        }
      })
    )

    // Combined team map pool from all visible players' matches.
    const mapPool = {}
    for (const pl of players) {
      for (const mm of pl.maps || []) {
        if (!mm.map) continue
        if (!mapPool[mm.map]) mapPool[mm.map] = { wins: 0, losses: 0 }
        mm.won ? mapPool[mm.map].wins++ : mapPool[mm.map].losses++
      }
    }
    const maps = Object.entries(mapPool)
      .map(([map, { wins, losses }]) => ({ map, wins, losses, wr: Math.round((wins / (wins + losses)) * 100) }))
      .sort((a, b) => b.wins + b.losses - (a.wins + a.losses))

    return res.json({
      success: true,
      team: { id: team.id, name: team.name },
      players: players.map(({ maps: _omit, ...rest }) => rest),
      maps,
    })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || 'Team stats failed' })
  }
}

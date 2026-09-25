import { requireSession, isAdmin } from '../_lib/session.js'
import { getTeam } from '../_lib/teamsStore.js'
import { getSharedMatchStats, resolvePuuid } from '../_lib/valorant.js'
import { isOptedIn } from '../_lib/optinStore.js'

/**
 * GET /api/teams/stats?id=<teamId>
 *
 * Team scouting view computed ONLY from matches the roster played together
 * (>= 2 members in the same match). Per-member stats and the team map pool come
 * from those shared matches. Opt-in enforced: only opted-in members are
 * included (admins see everyone).
 */
export default async function handler(req, res) {
  const session = requireSession(req, res)
  if (!session) return
  const admin = isAdmin(session)

  const team = await getTeam(session.puuid, req.query.id)
  if (!team) return res.status(404).json({ success: false, error: 'Team not found' })

  const region = (team.players?.[0]?.region || 'na').toLowerCase()

  try {
    // Resolve each roster member and decide visibility (opt-in / admin).
    const resolved = await Promise.all(
      (team.players || []).map(async (p) => {
        const puuid = await resolvePuuid(p.name, p.tag, p.region || region)
        const visible = admin || (puuid && (await isOptedIn(puuid)))
        return { name: p.name, tag: p.tag, region: p.region || region, puuid: visible ? puuid : null, visible }
      })
    )

    const members = resolved.filter((r) => r.visible && r.puuid)
    const shared = await getSharedMatchStats({ members, region, count: 15, maxShared: 15 })

    const players = resolved.map((r) => {
      if (!r.visible) return { name: r.name, tag: r.tag, optedIn: false }
      const pm = shared.perMember[r.puuid]
      if (!pm || pm.matches === 0) return { name: r.name, tag: r.tag, optedIn: true, sharedMatches: 0 }
      return {
        name: r.name,
        tag: r.tag,
        optedIn: true,
        sharedMatches: pm.matches,
        wr: Math.round((pm.wins / pm.matches) * 100),
        acs: Math.round(pm.acs / pm.matches),
        kd: pm.deaths > 0 ? (pm.kills / pm.deaths).toFixed(2) : String(pm.kills),
        adr: Math.round(pm.adr / pm.matches),
        hsPct: Math.round(pm.hs / pm.matches),
        agents: Object.entries(pm.agents).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([agent, count]) => ({ agent, count })),
      }
    })

    return res.json({
      success: true,
      team: { id: team.id, name: team.name },
      sharedMatchCount: shared.sharedMatchCount,
      players,
      maps: shared.maps,
    })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || 'Team stats failed' })
  }
}

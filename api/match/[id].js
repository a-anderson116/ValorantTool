import { requireSession } from '../_lib/session.js'
import { getMatchDetail } from '../_lib/valorant.js'

/**
 * GET /api/match/:id?region=na
 *
 * Full detail for a single match: scoreboard, rounds, economy. Requires a valid
 * RSO session; names of players other than the signed-in user are masked
 * (opt-in policy).
 */
export default async function handler(req, res) {
  const session = requireSession(req, res)
  if (!session) return

  const id = req.query.id
  const region = (req.query.region || 'na').toString().toLowerCase()
  if (!id) return res.status(400).json({ success: false, error: 'Missing match id' })

  try {
    const detail = await getMatchDetail({ matchId: id, region, mePuuid: session.puuid })
    return res.json({ success: true, ...detail })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || 'Could not load match' })
  }
}

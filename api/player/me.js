import { requireSession } from '../_lib/session.js'
import { getPlayerData } from '../_lib/valorant.js'

/**
 * GET /api/player/me?region=na&count=10
 *
 * Returns the signed-in player's own profile, aggregate stats, and recent
 * matches. Requires a valid RSO session; the player is inherently opted in by
 * having authenticated.
 */
export default async function handler(req, res) {
  const session = requireSession(req, res)
  if (!session) return

  const region = (req.query.region || 'na').toString().toLowerCase()
  const count = Math.min(parseInt(req.query.count, 10) || 10, 20)

  try {
    const { source, matches, stats } = await getPlayerData({
      puuid: session.puuid,
      gameName: session.gameName,
      tagLine: session.tagLine,
      region,
      count,
    })

    return res.json({
      success: true,
      source,
      profile: {
        puuid: session.puuid,
        gameName: session.gameName,
        tagLine: session.tagLine,
        region,
      },
      stats,
      matches,
    })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || 'Could not load player data' })
  }
}

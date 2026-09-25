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
  // Fetch a deeper window so the profile covers the whole current act (the data
  // layer filters to the act and derives rank from it).
  const count = Math.min(parseInt(req.query.count, 10) || 40, 50)

  try {
    const { source, matches, stats, rank } = await getPlayerData({
      puuid: session.puuid, gameName: session.gameName, tagLine: session.tagLine, region, count,
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
      rank,
      stats,
      matches,
    })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || 'Could not load player data' })
  }
}

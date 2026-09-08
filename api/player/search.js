import { requireSession, isAdmin } from '../_lib/session.js'
import { getPlayerData, resolvePuuid } from '../_lib/valorant.js'
import { isOptedIn } from '../_lib/optinStore.js'

/**
 * GET /api/player/search?name=&tag=&region=na
 *
 * Admin-only player lookup (searching arbitrary players bypasses opt-in, so it
 * is restricted to configured admin accounts and enforced here server-side).
 */
export default async function handler(req, res) {
  const session = requireSession(req, res)
  if (!session) return
  if (!isAdmin(session)) {
    return res.status(403).json({ success: false, error: 'Player search is restricted to admin accounts.' })
  }

  const name = (req.query.name || '').toString().trim()
  const tag = (req.query.tag || '').toString().trim().replace(/^#/, '')
  const region = (req.query.region || 'na').toString().toLowerCase()
  if (!name || !tag) {
    return res.status(400).json({ success: false, error: 'name and tag are required' })
  }

  try {
    const puuid = await resolvePuuid(name, tag, region)
    const [{ source, matches, stats }, optedIn] = await Promise.all([
      getPlayerData({ puuid, gameName: name, tagLine: tag, region, count: 20 }),
      puuid ? isOptedIn(puuid) : Promise.resolve(false),
    ])
    if (!matches.length && !puuid) {
      return res.status(404).json({ success: false, error: `No player found for ${name}#${tag} in ${region.toUpperCase()}.` })
    }
    return res.json({
      success: true,
      source,
      profile: { puuid, gameName: name, tagLine: tag, region, optedIn },
      stats,
      matches,
    })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || 'Search failed' })
  }
}

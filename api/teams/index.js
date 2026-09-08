import { requireSession } from '../_lib/session.js'
import { listTeams, saveTeam, deleteTeam } from '../_lib/teamsStore.js'

/**
 * /api/teams — per-account team rosters (session-gated; scoped to the signed-in
 * user's PUUID).
 *   GET                 -> { teams: [...] }
 *   POST { id?, name, players:[{name,tag,region}] } -> { team }
 *   DELETE ?id=         -> { success }
 */
export default async function handler(req, res) {
  const session = requireSession(req, res)
  if (!session) return
  const owner = session.puuid

  try {
    if (req.method === 'GET') {
      return res.json({ success: true, teams: await listTeams(owner) })
    }

    if (req.method === 'POST') {
      const { id, name, players } = req.body || {}
      if (!name || !String(name).trim()) {
        return res.status(400).json({ success: false, error: 'Team name is required' })
      }
      const clean = (players || [])
        .slice(0, 10)
        .map((p) => ({
          name: String(p.name || '').trim(),
          tag: String(p.tag || '').replace(/^#/, '').trim(),
          region: String(p.region || 'na').toLowerCase(),
        }))
        .filter((p) => p.name && p.tag)
      const team = await saveTeam(owner, { id, name, players: clean })
      return res.json({ success: true, team })
    }

    if (req.method === 'DELETE') {
      const id = req.query.id
      if (!id) return res.status(400).json({ success: false, error: 'id required' })
      await deleteTeam(owner, id)
      return res.json({ success: true })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Team request failed' })
  }
}

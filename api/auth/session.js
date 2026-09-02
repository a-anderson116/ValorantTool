import { verifySession, bearer } from '../_lib/session.js'

// GET /api/auth/session — validate a session token (Authorization: Bearer <token>)
export default function handler(req, res) {
  const session = verifySession(bearer(req))
  if (!session) return res.status(401).json({ success: false, error: 'No active session' })
  return res.json({
    success: true,
    puuid: session.puuid,
    gameName: session.gameName,
    tagLine: session.tagLine,
    optedIn: Boolean(session.optedIn),
  })
}

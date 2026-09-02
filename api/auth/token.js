import { signSession } from '../_lib/session.js'

/**
 * POST /api/auth/token   { code, state }
 *
 * Exchanges an RSO authorization code for tokens using the confidential client
 * secret (server-side only), resolves the player's identity, and returns a
 * signed session. The RSO access token is never returned to the browser.
 */

const RSO_TOKEN_URL = process.env.RSO_TOKEN_URL || 'https://auth.riotgames.com/token'
const RSO_USERINFO_URL = process.env.RSO_USERINFO_URL || 'https://auth.riotgames.com/userinfo'
const ACCOUNT_ME_URL =
  process.env.RIOT_ACCOUNT_ME_URL ||
  'https://americas.api.riotgames.com/riot/account/v1/accounts/me'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { code } = req.body || {}
  if (!code) return res.status(400).json({ success: false, error: 'Missing authorization code' })

  const CLIENT_ID = process.env.RSO_CLIENT_ID
  const CLIENT_SECRET = process.env.RSO_CLIENT_SECRET
  const REDIRECT_URI = process.env.RSO_REDIRECT_URI
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return res.status(503).json({
      success: false,
      error: 'RSO is not configured. Set RSO_CLIENT_ID, RSO_CLIENT_SECRET and RSO_REDIRECT_URI.',
    })
  }

  try {
    // 1) Exchange code -> tokens (confidential client, HTTP Basic auth).
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    const tokenRes = await fetch(RSO_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString(),
    })
    if (!tokenRes.ok) {
      const detail = await tokenRes.text()
      return res.status(tokenRes.status).json({ success: false, error: `Token exchange failed: ${detail}` })
    }
    const tokens = await tokenRes.json()
    const accessToken = tokens.access_token
    if (!accessToken) throw new Error('No access token returned by Riot')

    // 2) Resolve identity. userinfo -> PUUID; Account-v1 -> gameName/tagLine.
    let puuid = null
    let gameName = null
    let tagLine = null

    try {
      const ui = await fetch(RSO_USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } })
      if (ui.ok) {
        const uinfo = await ui.json()
        puuid = uinfo.sub || uinfo.puuid || null
      }
    } catch {
      /* fall through */
    }

    try {
      const acc = await fetch(ACCOUNT_ME_URL, { headers: { Authorization: `Bearer ${accessToken}` } })
      if (acc.ok) {
        const account = await acc.json()
        puuid = account.puuid || puuid
        gameName = account.gameName || null
        tagLine = account.tagLine || null
      }
    } catch {
      /* userinfo puuid is enough */
    }

    if (!puuid) throw new Error('Could not resolve player identity from Riot')

    // 3) Signing in IS the opt-in. Encode identity + consent into the session.
    const session = signSession({ puuid, gameName, tagLine, optedIn: true })

    return res.json({ success: true, session, puuid, gameName, tagLine })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Sign-in failed' })
  }
}

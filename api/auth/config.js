// GET /api/auth/config — public, non-secret RSO settings the browser needs to
// start a login (client id + redirect uri are public by OAuth design). Served
// at runtime so no VITE_/build-time env vars are required. The client SECRET is
// never included here.
export default function handler(req, res) {
  const clientId = process.env.RSO_CLIENT_ID || ''
  const redirectUri = process.env.RSO_REDIRECT_URI || ''
  const configured = Boolean(clientId && process.env.RSO_CLIENT_SECRET && redirectUri)
  return res.json({
    configured,
    clientId,
    redirectUri,
    authorizeUrl: process.env.RSO_AUTHORIZE_URL || 'https://auth.riotgames.com/authorize',
    scope: process.env.RSO_SCOPE || 'openid offline_access',
  })
}

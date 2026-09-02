import crypto from 'crypto'

/**
 * Stateless, signed session tokens for the serverless (Vercel) backend.
 *
 * Vercel Functions have no persistent disk or shared memory between
 * invocations, so we can't use a file/in-memory session store here. Instead we
 * issue a compact HMAC-signed token (like a minimal JWT) that carries the
 * player's identity and opt-in flag. It is verified on each request with the
 * server-side SESSION_SECRET — the browser cannot forge or alter it.
 */

const SECRET =
  process.env.SESSION_SECRET || process.env.RSO_CLIENT_SECRET || 'dev-insecure-secret-change-me'
const TTL_MS = 1000 * 60 * 60 * 8 // 8 hours

export function signSession(payload) {
  const body = { ...payload, iat: Date.now(), exp: Date.now() + TTL_MS }
  const data = Buffer.from(JSON.stringify(body)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySession(token) {
  if (!token || typeof token !== 'string') return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const body = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (body.exp && Date.now() > body.exp) return null
    return body
  } catch {
    return null
  }
}

/** Extract the bearer token from an incoming request. */
export function bearer(req) {
  return (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
}

/** Verify the session on a request, or send 401. Returns the session or null. */
export function requireSession(req, res) {
  const session = verifySession(bearer(req))
  if (!session) {
    res.status(401).json({ success: false, error: 'Sign in with Riot to access this data.' })
    return null
  }
  return session
}

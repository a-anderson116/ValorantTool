// Riot Sign On (RSO) — browser side.
// The browser only ever handles the authorization code + an opaque session
// token. The confidential client secret and token exchange live on the backend.
//
// RSO settings (client id, redirect uri, authorize url, scope) are fetched from
// the backend at runtime via /api/auth/config, so NO build-time VITE_ variables
// are required. Only server-side env vars need to be set in Vercel.

// Optional: point at a different backend origin. Left empty = same-origin /api.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

const SESSION_KEY = 'rso_session'
const STATE_KEY = 'rso_state'

function apiBase() {
  return BACKEND_URL.replace(/\/$/, '')
}

function randomState() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Fetch the public RSO config (client id, redirect uri, etc.) from the backend. */
export async function fetchRsoConfig() {
  try {
    const res = await fetch(`${apiBase()}/api/auth/config`)
    if (!res.ok) throw new Error(`config ${res.status}`)
    return await res.json()
  } catch (e) {
    return { configured: false, clientId: '', redirectUri: '' }
  }
}

/** Kick off the RSO login by redirecting to Riot's authorize endpoint. */
export function login(config) {
  if (!config?.clientId) {
    console.warn('RSO not configured: no client id from /api/auth/config')
    return
  }
  const state = randomState()
  try {
    sessionStorage.setItem(STATE_KEY, state)
  } catch (e) {
    /* private mode — state check will be skipped in the callback */
  }
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri || `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: config.scope || 'openid offline_access',
    state,
  })
  const authorizeUrl = config.authorizeUrl || 'https://auth.riotgames.com/authorize'
  window.location.href = `${authorizeUrl}?${params.toString()}`
}

/** Read the stored session (set by the callback page after a code exchange). */
export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function setSession(session) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (e) {
    /* ignore */
  }
}

/** Clear the local session and send the user to the post-logout page. */
export function logout() {
  const token = getSession()?.session
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(STATE_KEY)
  } catch (e) {
    /* ignore */
  }
  if (token) {
    fetch(`${apiBase()}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }
  window.location.href = '/logout'
}

/** Authorization header for calling gated backend endpoints. */
export function authHeader() {
  const token = getSession()?.session
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * If the RSO callback left an authorization code in sessionStorage, exchange it
 * for a session via the backend (which holds the client secret). Returns the
 * new session on success, or null if there was nothing to exchange.
 */
export async function exchangeCodeIfPresent() {
  let code, state
  try {
    code = sessionStorage.getItem('rso_code')
    state = sessionStorage.getItem('rso_code_state')
  } catch (e) {
    return null
  }
  if (!code) return null

  // One-shot: clear immediately so a failed exchange doesn't loop.
  try {
    sessionStorage.removeItem('rso_code')
    sessionStorage.removeItem('rso_code_state')
  } catch (e) {
    /* ignore */
  }

  try {
    const res = await fetch(`${apiBase()}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    })
    if (!res.ok) throw new Error(`Token exchange failed (${res.status})`)
    const data = await res.json()
    if (!data?.session) throw new Error(data?.error || 'No session returned')
    const session = {
      session: data.session,
      puuid: data.puuid,
      gameName: data.gameName,
      tagLine: data.tagLine,
    }
    setSession(session)
    return session
  } catch (err) {
    console.warn('RSO exchange failed:', err.message)
    return null
  }
}

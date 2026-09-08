/**
 * Persistent opt-in registry backed by Vercel KV / Upstash Redis (REST API).
 *
 * Stores a single Redis hash `vct:optin` mapping PUUID -> "gameName#tagLine" for
 * every player who has completed RSO login (i.e. opted in). Used to un-mask
 * players in match scoreboards and to gate scouting.
 *
 * No SDK / dependency: talks to the Upstash REST endpoint with fetch. If the KV
 * env vars aren't set, every call is a safe no-op so the app keeps working
 * (everyone stays masked) until the store is connected.
 */

const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const HASH = 'vct:optin'

export function kvConfigured() {
  return Boolean(URL && TOKEN)
}

async function cmd(args) {
  if (!kvConfigured()) return null
  const res = await fetch(URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`KV ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.result
}

/** Record (or refresh) a player's opt-in consent. */
export async function recordOptIn({ puuid, gameName, tagLine }) {
  if (!puuid || !kvConfigured()) return
  const label = gameName ? `${gameName}#${tagLine || ''}` : puuid
  try {
    await cmd(['HSET', HASH, puuid, label])
  } catch (e) {
    /* non-fatal: opt-in just won't be recorded this time */
  }
}

/** For a list of PUUIDs, return { puuid: "name#tag" } for those that opted in. */
export async function optedInNames(puuids) {
  const out = {}
  const ids = (puuids || []).filter(Boolean)
  if (!kvConfigured() || ids.length === 0) return out
  try {
    const res = await cmd(['HMGET', HASH, ...ids])
    ids.forEach((p, i) => {
      if (res && res[i]) out[p] = res[i]
    })
  } catch (e) {
    /* ignore -> everyone stays masked */
  }
  return out
}

/** Has this single PUUID opted in? */
export async function isOptedIn(puuid) {
  if (!puuid || !kvConfigured()) return false
  try {
    return Boolean(await cmd(['HGET', HASH, puuid]))
  } catch (e) {
    return false
  }
}

/** Remove a player's consent (e.g. deletion request). */
export async function removeOptIn(puuid) {
  if (!puuid || !kvConfigured()) return
  try {
    await cmd(['HDEL', HASH, puuid])
  } catch (e) {
    /* ignore */
  }
}

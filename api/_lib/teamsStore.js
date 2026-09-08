import crypto from 'crypto'
import { kvCmd, kvConfigured } from './optinStore.js'

/**
 * Per-account team rosters, stored in Vercel KV / Upstash Redis.
 * One hash per owner: `vct:teams:<ownerPuuid>` mapping teamId -> JSON(team).
 * team = { id, name, players: [{ name, tag, region }], createdAt }
 */

const key = (owner) => `vct:teams:${owner}`

function parseHashAll(res) {
  const out = []
  if (Array.isArray(res)) {
    for (let i = 0; i < res.length; i += 2) {
      try { out.push(JSON.parse(res[i + 1])) } catch { /* skip */ }
    }
  } else if (res && typeof res === 'object') {
    for (const v of Object.values(res)) {
      try { out.push(JSON.parse(v)) } catch { /* skip */ }
    }
  }
  return out
}

export async function listTeams(owner) {
  if (!kvConfigured() || !owner) return []
  try {
    const res = await kvCmd(['HGETALL', key(owner)])
    return parseHashAll(res).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } catch {
    return []
  }
}

export async function getTeam(owner, id) {
  if (!kvConfigured() || !owner || !id) return null
  try {
    const v = await kvCmd(['HGET', key(owner), id])
    return v ? JSON.parse(v) : null
  } catch {
    return null
  }
}

export async function saveTeam(owner, team) {
  if (!kvConfigured()) throw new Error('Team storage is not configured (KV).')
  const t = {
    id: team.id || crypto.randomUUID(),
    name: String(team.name || 'Untitled').slice(0, 60),
    players: (team.players || []).slice(0, 10),
    createdAt: team.createdAt || new Date().toISOString(),
  }
  await kvCmd(['HSET', key(owner), t.id, JSON.stringify(t)])
  return t
}

export async function deleteTeam(owner, id) {
  if (!kvConfigured() || !id) return
  await kvCmd(['HDEL', key(owner), id])
}

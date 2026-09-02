const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Opt-in consent registry + session store.
 *
 * Riot's developer policy requires that a player's stats/gameplay data is only
 * displayed AFTER that player has opted in via Riot Sign On (RSO). This module
 * is the source of truth for who has opted in.
 *
 *  - Opt-in consent is PERSISTED to disk (backend/data/optin.json) so it
 *    survives restarts. A player is added the first time they complete RSO.
 *  - Sessions are kept in memory (ephemeral); users simply re-authenticate
 *    after a server restart.
 *
 * For a production deployment with multiple instances, replace the JSON file
 * with a shared database — the interface below stays the same.
 */

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'optin.json');

// puuid -> { puuid, gameName, tagLine, optedInAt }
let optedIn = {};
// sessionToken -> { puuid, gameName, tagLine, createdAt }
const sessions = new Map();

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      optedIn = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) || {};
    }
  } catch (err) {
    console.warn('opt-in store: could not read', DB_FILE, err.message);
    optedIn = {};
  }
}

function persist() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(optedIn, null, 2));
  } catch (err) {
    console.warn('opt-in store: could not write', DB_FILE, err.message);
  }
}

load();

/** Record (or refresh) a player's opt-in consent. */
function recordOptIn({ puuid, gameName, tagLine }) {
  if (!puuid) return;
  optedIn[puuid] = {
    puuid,
    gameName: gameName || optedIn[puuid]?.gameName || null,
    tagLine: tagLine || optedIn[puuid]?.tagLine || null,
    optedInAt: optedIn[puuid]?.optedInAt || new Date().toISOString(),
  };
  persist();
}

/** Has this player opted in? Data must not be shown for anyone where this is false. */
function isOptedIn(puuid) {
  return Boolean(puuid && optedIn[puuid]);
}

/** Withdraw consent (e.g. account deletion request) and forget the player. */
function removeOptIn(puuid) {
  if (optedIn[puuid]) {
    delete optedIn[puuid];
    persist();
  }
  for (const [token, s] of sessions) {
    if (s.puuid === puuid) sessions.delete(token);
  }
}

/** List opted-in players (safe to display / search). */
function listOptedIn() {
  return Object.values(optedIn);
}

function createSession({ puuid, gameName, tagLine }) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { puuid, gameName, tagLine, createdAt: Date.now() });
  return token;
}

function getSession(token) {
  return token ? sessions.get(token) || null : null;
}

function deleteSession(token) {
  if (token) sessions.delete(token);
}

module.exports = {
  recordOptIn,
  isOptedIn,
  removeOptIn,
  listOptedIn,
  createSession,
  getSession,
  deleteSession,
};

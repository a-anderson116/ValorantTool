const express = require('express');
const router = express.Router();
const axios = require('axios');
const optin = require('../store/optin');

/**
 * Riot Sign On (RSO) authentication.
 *
 * The frontend redirects the user to Riot's authorize endpoint. Riot returns an
 * authorization `code` to the registered redirect URI (/auth/callback). The
 * callback page POSTs that code here, where we exchange it for tokens using the
 * confidential client secret (which must NEVER be exposed to the browser), read
 * the player's identity, record their opt-in consent, and issue a session token.
 */

const RSO_TOKEN_URL = process.env.RSO_TOKEN_URL || 'https://auth.riotgames.com/token';
const RSO_USERINFO_URL = process.env.RSO_USERINFO_URL || 'https://auth.riotgames.com/userinfo';
const ACCOUNT_ME_URL =
  process.env.RIOT_ACCOUNT_ME_URL ||
  'https://americas.api.riotgames.com/riot/account/v1/accounts/me';

const CLIENT_ID = process.env.RSO_CLIENT_ID;
const CLIENT_SECRET = process.env.RSO_CLIENT_SECRET;
const REDIRECT_URI = process.env.RSO_REDIRECT_URI;

// POST /api/auth/token  { code, state }
router.post('/token', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ success: false, error: 'Missing authorization code' });

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return res.status(503).json({
      success: false,
      error:
        'RSO is not configured on the server. Set RSO_CLIENT_ID, RSO_CLIENT_SECRET and RSO_REDIRECT_URI.',
    });
  }

  try {
    // 1) Exchange the authorization code for tokens (confidential client).
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    });
    const tokenRes = await axios.post(RSO_TOKEN_URL, form.toString(), {
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const accessToken = tokenRes.data.access_token;
    if (!accessToken) throw new Error('No access token returned by Riot');

    // 2) Identify the player. userinfo gives the PUUID (sub); the Account API
    //    gives the Riot ID (gameName#tagLine).
    let puuid = null;
    let gameName = null;
    let tagLine = null;

    try {
      const userinfo = await axios.get(RSO_USERINFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      puuid = userinfo.data.sub || userinfo.data.puuid || null;
    } catch (e) {
      /* fall through to account API */
    }

    try {
      const account = await axios.get(ACCOUNT_ME_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      puuid = account.data.puuid || puuid;
      gameName = account.data.gameName || null;
      tagLine = account.data.tagLine || null;
    } catch (e) {
      /* userinfo puuid is enough to proceed */
    }

    if (!puuid) throw new Error('Could not resolve player identity from Riot');

    // 3) Record opt-in consent and issue a session.
    optin.recordOptIn({ puuid, gameName, tagLine });
    const session = optin.createSession({ puuid, gameName, tagLine });

    res.json({
      success: true,
      session,
      puuid,
      gameName,
      tagLine,
      // The RSO access token is intentionally NOT returned to the browser.
    });
  } catch (err) {
    const detail = err.response?.data?.error_description || err.response?.data?.error || err.message;
    res.status(err.response?.status || 500).json({ success: false, error: detail });
  }
});

// GET /api/auth/session — validate a session token (Authorization: Bearer <session>)
router.get('/session', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = optin.getSession(token);
  if (!session) return res.status(401).json({ success: false, error: 'No active session' });
  res.json({
    success: true,
    puuid: session.puuid,
    gameName: session.gameName,
    tagLine: session.tagLine,
    optedIn: optin.isOptedIn(session.puuid),
  });
});

// POST /api/auth/logout — end the session
router.post('/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  optin.deleteSession(token);
  res.json({ success: true });
});

module.exports = router;

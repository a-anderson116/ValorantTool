const optin = require('../store/optin');

/**
 * Require a valid RSO session (Authorization: Bearer <session token>).
 * Attaches req.session = { puuid, gameName, tagLine }.
 */
function requireSession(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = optin.getSession(token);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Sign in with Riot to access this data.' });
  }
  req.session = session;
  next();
}

/**
 * Enforce Riot's opt-in policy: a Riot ID may only be returned if that player
 * has opted in (or is the signed-in player themselves). Reads name/tag pairs
 * from the request and rejects any that are not in the opt-in registry.
 */
function requireOptedInTargets(getRiotIds) {
  return (req, res, next) => {
    const opted = optin.listOptedIn().map(
      (p) => `${(p.gameName || '').toLowerCase()}#${(p.tagLine || '').toLowerCase()}`
    );
    const self = req.session
      ? `${(req.session.gameName || '').toLowerCase()}#${(req.session.tagLine || '').toLowerCase()}`
      : null;

    const requested = (getRiotIds(req) || []).map(
      ({ name, tag }) => `${(name || '').toLowerCase()}#${(tag || '').toLowerCase()}`
    );

    const blocked = requested.filter((id) => id !== self && !opted.includes(id));
    if (blocked.length) {
      return res.status(403).json({
        success: false,
        error:
          'Opt-in required: one or more requested players have not opted in via Riot Sign On. ' +
          'Their data cannot be displayed.',
        blocked,
      });
    }
    next();
  };
}

module.exports = { requireSession, requireOptedInTargets };

const express = require('express');
const router = express.Router();
const { getMatch } = require('../services/henrik');

// GET /api/match/:matchId
router.get('/:matchId', async (req, res) => {
  try {
    const match = await getMatch(req.params.matchId);
    res.json({ success: true, data: match });
  } catch (err) {
    res.status(err.response?.status || 500).json({
      success: false,
      error: err.response?.data?.errors?.[0]?.message || err.message
    });
  }
});

// POST /api/match/bulk — fetch multiple match IDs
router.post('/bulk', async (req, res) => {
  const { matchIds } = req.body;
  if (!Array.isArray(matchIds) || matchIds.length === 0) {
    return res.status(400).json({ success: false, error: 'matchIds array required' });
  }
  try {
    const results = await Promise.allSettled(matchIds.map(id => getMatch(id)));
    const matches = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    res.json({ success: true, data: matches, count: matches.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

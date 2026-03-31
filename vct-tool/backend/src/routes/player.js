const express = require('express');
const router = express.Router();
const { getPlayerMatches, getPlayerMMR, getPlayerAccount } = require('../services/henrik');
const { aggregatePlayerStats } = require('../utils/stats');

// GET /api/player/:region/:name/:tag
router.get('/:region/:name/:tag', async (req, res) => {
  const { region, name, tag } = req.params;
  const count = parseInt(req.query.count) || 20;
  try {
    const [account, mmr, matches] = await Promise.allSettled([
      getPlayerAccount(name, tag),
      getPlayerMMR(name, tag, region),
      getPlayerMatches(name, tag, region, count)
    ]);

    const matchData = matches.status === 'fulfilled' ? matches.value : [];
    const stats = aggregatePlayerStats(matchData, name, tag);

    res.json({
      success: true,
      data: {
        account: account.status === 'fulfilled' ? account.value : null,
        mmr: mmr.status === 'fulfilled' ? mmr.value : null,
        stats,
        recentMatches: matchData.slice(0, 5).map(m => ({
          matchId: m.metadata?.matchid,
          map: m.metadata?.map,
          mode: m.metadata?.mode,
          date: m.metadata?.game_start_patched,
          duration: m.metadata?.game_length,
          result: (() => {
            const players = m.players?.all_players || [];
            const p = players.find(pl => pl.name.toLowerCase() === name.toLowerCase());
            if (!p) return 'unknown';
            const redWon = m.teams?.red?.has_won;
            return (p.team === 'Red' && redWon) || (p.team === 'Blue' && !redWon) ? 'win' : 'loss';
          })(),
          agent: m.players?.all_players?.find(p => p.name.toLowerCase() === name.toLowerCase())?.character,
          kills: m.players?.all_players?.find(p => p.name.toLowerCase() === name.toLowerCase())?.stats?.kills,
          deaths: m.players?.all_players?.find(p => p.name.toLowerCase() === name.toLowerCase())?.stats?.deaths,
          assists: m.players?.all_players?.find(p => p.name.toLowerCase() === name.toLowerCase())?.stats?.assists,
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getPlayerMatches } = require('../services/henrik');
const { aggregatePlayerStats, aggregateTeamStats } = require('../utils/stats');

// POST /api/team/scout
// Body: { players: [{name, tag, region}], count }
router.post('/scout', async (req, res) => {
  const { players, count = 15 } = req.body;
  if (!Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ success: false, error: 'players array required' });
  }

  try {
    const playerResults = await Promise.allSettled(
      players.map(async ({ name, tag, region = 'na' }) => {
        const matches = await getPlayerMatches(name, tag, region, count);
        const stats = aggregatePlayerStats(matches, name, tag);
        return { name, tag, stats, matchCount: matches.length, matches };
      })
    );

    const playerData = playerResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    // Combine all matches for team-level analysis
    const allMatches = playerData.flatMap(p => p.matches || []);
    const uniqueMatches = Object.values(
      Object.fromEntries(allMatches.map(m => [m.metadata?.matchid, m]))
    );

    const teamStats = aggregateTeamStats(uniqueMatches, players.map(p => p.name));

    // Generate scouting summary
    const scoutingSummary = generateScoutingSummary(playerData, teamStats);

    res.json({
      success: true,
      data: {
        players: playerData.map(({ matches, ...rest }) => rest),
        teamStats,
        scoutingSummary
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function generateScoutingSummary(players, teamStats) {
  const strengths = [];
  const weaknesses = [];
  const keyPlayers = [];

  // Identify star player
  const sorted = [...players].sort((a, b) => (b.stats?.acs || 0) - (a.stats?.acs || 0));
  if (sorted[0]?.stats) {
    keyPlayers.push({
      player: `${sorted[0].name}#${sorted[0].tag}`,
      note: `Primary carry — ${sorted[0].stats.acs} avg ACS, ${sorted[0].stats.kd} K/D`,
      role: 'carry'
    });
  }

  // Identify primary entry
  const entry = [...players].sort((a, b) => (b.stats?.fk || 0) - (a.stats?.fk || 0))[0];
  if (entry?.stats && entry.name !== sorted[0]?.name) {
    keyPlayers.push({
      player: `${entry.name}#${entry.tag}`,
      note: `Primary entry — ${entry.stats.fk} first kills tracked`,
      role: 'entry'
    });
  }

  // Map pool strengths
  const strongMaps = teamStats.mapPool.filter(m => m.winRate >= 60);
  const weakMaps = teamStats.mapPool.filter(m => m.winRate <= 40 && m.total >= 3);

  if (strongMaps.length) strengths.push(`Strong on ${strongMaps.map(m => m.map).join(', ')}`);
  if (weakMaps.length) weaknesses.push(`Exploitable on ${weakMaps.map(m => m.map).join(', ')}`);

  // HS% analysis
  const avgHS = players.reduce((a, p) => a + (p.stats?.hsPercent || 0), 0) / players.length;
  if (avgHS >= 25) strengths.push(`High headshot accuracy (${Math.round(avgHS)}% avg) — aim-heavy team`);
  else if (avgHS < 15) weaknesses.push(`Low headshot rate (${Math.round(avgHS)}% avg) — susceptible to duels`);

  return { strengths, weaknesses, keyPlayers, topAgents: teamStats.agentPool.slice(0, 6) };
}

module.exports = router;

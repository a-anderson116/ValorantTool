// Compute per-player aggregate stats from an array of match objects
function aggregatePlayerStats(matches, playerName, playerTag) {
  const target = `${playerName}#${playerTag}`.toLowerCase();
  let kills = 0, deaths = 0, assists = 0, acs = 0, adr = 0, hsPercent = 0;
  let kastTotal = 0, fk = 0, fd = 0, matchCount = 0;
  const agentCounts = {};
  const mapStats = {};

  for (const match of matches) {
    const players = match.players?.all_players || [];
    const player = players.find(p =>
      `${p.name}#${p.tag}`.toLowerCase() === target
    );
    if (!player) continue;
    matchCount++;

    kills += player.stats?.kills || 0;
    deaths += player.stats?.deaths || 0;
    assists += player.stats?.assists || 0;
    acs += player.stats?.score / (match.metadata?.rounds_played || 1) || 0;
    adr += (player.damage_made || 0) / (match.metadata?.rounds_played || 1);
    hsPercent += player.stats?.headshots /
      Math.max((player.stats?.headshots + player.stats?.bodyshots + player.stats?.legshots), 1);
    fk += player.stats?.first_bloods || 0;
    fd += player.stats?.first_deaths || 0;

    const agent = player.character;
    agentCounts[agent] = (agentCounts[agent] || 0) + 1;

    const map = match.metadata?.map;
    if (map) {
      if (!mapStats[map]) mapStats[map] = { wins: 0, losses: 0 };
      const won = match.teams?.red?.has_won
        ? player.team === 'Red' : player.team === 'Blue';
      if (won) mapStats[map].wins++;
      else mapStats[map].losses++;
    }
  }

  if (matchCount === 0) return null;

  const topAgents = Object.entries(agentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([agent, count]) => ({ agent, count, pct: Math.round(count / matchCount * 100) }));

  return {
    matchCount,
    kills, deaths, assists,
    kd: deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2),
    acs: Math.round(acs / matchCount),
    adr: Math.round(adr / matchCount),
    hsPercent: Math.round(hsPercent / matchCount * 100),
    fk, fd,
    topAgents,
    mapStats,
  };
}

// Compute team-level tendencies from an array of matches for a given team
function aggregateTeamStats(matches, teamPlayerNames) {
  const normalizedNames = teamPlayerNames.map(n => n.toLowerCase());
  const mapPool = {};
  const agentPool = {};
  let totalRounds = 0, attackRoundsWon = 0, defenseRoundsWon = 0;
  let matchesAnalyzed = 0;

  for (const match of matches) {
    const players = match.players?.all_players || [];
    const teamPlayers = players.filter(p =>
      normalizedNames.includes(p.name.toLowerCase())
    );
    if (teamPlayers.length === 0) continue;
    matchesAnalyzed++;

    const map = match.metadata?.map;
    if (map) {
      if (!mapPool[map]) mapPool[map] = { wins: 0, losses: 0 };
      const teamSide = teamPlayers[0]?.team;
      const redWon = match.teams?.red?.has_won;
      const won = (teamSide === 'Red' && redWon) || (teamSide === 'Blue' && !redWon);
      if (won) mapPool[map].wins++;
      else mapPool[map].losses++;
    }

    for (const p of teamPlayers) {
      const agent = p.character;
      agentPool[agent] = (agentPool[agent] || 0) + 1;
    }
  }

  const sortedMaps = Object.entries(mapPool)
    .map(([map, { wins, losses }]) => ({
      map, wins, losses,
      total: wins + losses,
      winRate: Math.round(wins / (wins + losses) * 100)
    }))
    .sort((a, b) => b.total - a.total);

  const sortedAgents = Object.entries(agentPool)
    .sort((a, b) => b[1] - a[1])
    .map(([agent, count]) => ({ agent, count }));

  return { matchesAnalyzed, mapPool: sortedMaps, agentPool: sortedAgents };
}

module.exports = { aggregatePlayerStats, aggregateTeamStats };

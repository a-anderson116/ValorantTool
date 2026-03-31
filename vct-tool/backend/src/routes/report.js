const express = require('express');
const router = express.Router();

// POST /api/report/generate
// Generates an HTML scouting report (client-side PDF via print)
router.post('/generate', async (req, res) => {
  const { teamName, players, teamStats, scoutingSummary, generatedBy, matchDate } = req.body;

  const html = buildReportHTML({ teamName, players, teamStats, scoutingSummary, generatedBy, matchDate });
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

function buildReportHTML({ teamName, players, teamStats, scoutingSummary, generatedBy, matchDate }) {
  const agentColors = {
    Jett: '#72d8e8', Reyna: '#9b6dff', Phoenix: '#ff9d4d', Neon: '#4de8ff',
    Raze: '#ffb347', Chamber: '#c8a96e', Yoru: '#4a6fff', Iso: '#a0c4ff',
    Omen: '#7b68ee', Brimstone: '#ff6b35', Astra: '#b39ddb', Harbor: '#4fc3f7',
    Viper: '#69c063', Killjoy: '#ffe566', Cypher: '#aaaaaa', Sage: '#52d9b5',
    Sova: '#5b9bd5', Fade: '#c678a0', Breach: '#ff7043', Skye: '#81c784',
    Kay: '#64b5f6', Gekko: '#a5d6a7', Deadlock: '#ef9a9a', Default: '#888'
  };
  const getAgentColor = (agent) => agentColors[agent] || agentColors.Default;

  const playerRows = (players || []).map(p => {
    const s = p.stats || {};
    return `
      <tr>
        <td><strong>${p.name}#${p.tag}</strong></td>
        <td>${s.acs || '-'}</td>
        <td>${s.kd || '-'}</td>
        <td>${s.adr || '-'}</td>
        <td>${s.hsPercent != null ? s.hsPercent + '%' : '-'}</td>
        <td>${s.fk || 0} / ${s.fd || 0}</td>
        <td>${(s.topAgents || []).slice(0, 3).map(a =>
          `<span class="agent-badge" style="background:${getAgentColor(a.agent)}22;border-color:${getAgentColor(a.agent)}">${a.agent} ${a.pct}%</span>`
        ).join('')}</td>
      </tr>`;
  }).join('');

  const mapRows = (teamStats?.mapPool || []).map(m => `
    <tr>
      <td>${m.map}</td>
      <td>${m.wins}W – ${m.losses}L</td>
      <td>
        <div class="bar-wrap"><div class="bar" style="width:${m.winRate}%;background:${m.winRate >= 60 ? '#52d9b5' : m.winRate >= 45 ? '#ffe566' : '#ff6b6b'}"></div></div>
        ${m.winRate}%
      </td>
    </tr>`).join('');

  const strengthItems = (scoutingSummary?.strengths || []).map(s => `<li class="strength">✓ ${s}</li>`).join('');
  const weaknessItems = (scoutingSummary?.weaknesses || []).map(w => `<li class="weakness">✗ ${w}</li>`).join('');
  const keyPlayerItems = (scoutingSummary?.keyPlayers || []).map(k => `
    <div class="key-player">
      <span class="kp-role ${k.role}">${k.role.toUpperCase()}</span>
      <span class="kp-name">${k.player}</span>
      <span class="kp-note">${k.note}</span>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Scouting Report — ${teamName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #0f0f14; color: #e8e8f0; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ff4655; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { font-size: 12px; color: #ff4655; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
  h1 { font-size: 28px; font-weight: 700; margin: 4px 0; }
  .meta { font-size: 13px; color: #888; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #ff4655; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 10px; color: #888; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #2a2a3a; }
  td { padding: 10px 10px; border-bottom: 1px solid #1e1e2e; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  .agent-badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 4px; border: 1px solid; margin: 2px 2px 2px 0; }
  .bar-wrap { display: inline-block; width: 80px; height: 6px; background: #2a2a3a; border-radius: 3px; margin-right: 8px; vertical-align: middle; }
  .bar { height: 100%; border-radius: 3px; }
  .swot { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .swot-box { background: #1a1a24; border-radius: 8px; padding: 16px; }
  .swot-box h3 { font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  ul { padding-left: 0; list-style: none; }
  li { font-size: 13px; padding: 4px 0; }
  .strength { color: #52d9b5; }
  .weakness { color: #ff6b6b; }
  .key-player { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #1e1e2e; font-size: 13px; }
  .kp-role { font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 2px 8px; border-radius: 4px; }
  .kp-role.carry { background: #ff465522; color: #ff4655; }
  .kp-role.entry { background: #ff9d4d22; color: #ff9d4d; }
  .kp-role.support { background: #52d9b522; color: #52d9b5; }
  .kp-name { font-weight: 600; min-width: 160px; }
  .kp-note { color: #888; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #2a2a3a; font-size: 11px; color: #555; display: flex; justify-content: space-between; }
  @media print {
    body { background: white; color: #111; padding: 20px; }
    .header { border-color: #ff4655; }
    .swot-box { background: #f5f5f5; border: 1px solid #ddd; }
    td, th { border-color: #ddd; }
    .bar-wrap { background: #eee; }
  }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">Valorant Collegiate Tool</div>
    <h1>${teamName || 'Opponent Team'}</h1>
    <div class="meta">Scouting Report · Generated ${matchDate || new Date().toLocaleDateString()} · By ${generatedBy || 'VCT Analyst'}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;color:#888;margin-bottom:4px">MATCHES ANALYZED</div>
    <div style="font-size:32px;font-weight:700;color:#ff4655">${(players || []).reduce((a, p) => a + (p.stats?.matchCount || 0), 0) / Math.max((players || []).length, 1) | 0}</div>
    <div style="font-size:11px;color:#888">avg per player</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Player Stats</div>
  <table>
    <thead><tr><th>Player</th><th>ACS</th><th>K/D</th><th>ADR</th><th>HS%</th><th>FK/FD</th><th>Agent Pool</th></tr></thead>
    <tbody>${playerRows}</tbody>
  </table>
</div>

<div class="section">
  <div class="section-title">Map Pool</div>
  <table>
    <thead><tr><th>Map</th><th>Record</th><th>Win Rate</th></tr></thead>
    <tbody>${mapRows}</tbody>
  </table>
</div>

<div class="section">
  <div class="section-title">Scouting Analysis</div>
  <div class="swot">
    <div class="swot-box">
      <h3 style="color:#52d9b5">Strengths</h3>
      <ul>${strengthItems || '<li style="color:#555">Insufficient data</li>'}</ul>
    </div>
    <div class="swot-box">
      <h3 style="color:#ff6b6b">Weaknesses</h3>
      <ul>${weaknessItems || '<li style="color:#555">Insufficient data</li>'}</ul>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Key Players to Watch</div>
  ${keyPlayerItems || '<p style="color:#555;font-size:13px">No standout players identified yet.</p>'}
</div>

<div class="footer">
  <span>Valorant Collegiate Tool — vct.gg</span>
  <span>Confidential — For coaching staff use only</span>
</div>
</body>
</html>`;
}

module.exports = router;

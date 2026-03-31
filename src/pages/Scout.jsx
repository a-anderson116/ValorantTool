import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle, Target, Download } from 'lucide-react'
import Header from '../components/Header'
import { MOCK_TEAMS, MOCK_PLAYERS, MAP_WIN_RATES, ROLE_COLORS, AGENT_COLORS } from '../data/mockData'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

function generateReport(team, players, mapData) {
  const topFragger = [...players].sort((a, b) => b.acs - a.acs)[0]
  const bestMap = [...mapData].sort((a, b) => b.wr - a.wr)[0]
  const worstMap = [...mapData].sort((a, b) => a.wr - b.wr)[0]
  const avgKAST = Math.round(players.reduce((s, p) => s + p.kast, 0) / players.length)
  const avgACS = Math.round(players.reduce((s, p) => s + p.acs, 0) / players.length)

  return {
    threats: [
      `${topFragger?.name} (${topFragger?.agent}) averages ${topFragger?.acs} ACS — primary target to shut down`,
      `${bestMap?.map} is their strongest map at ${bestMap?.wr}% win rate — ban if possible`,
      `Team KAST of ${avgKAST}% suggests coordinated trading and support plays`,
    ],
    weaknesses: [
      `${worstMap?.map} win rate only ${worstMap?.wr}% — force onto this map`,
      `${players.filter(p => p.kd < 1).length} players below 1.0 K/D — exploit in duels`,
      `Low ACS players (${players.filter(p => p.acs < 150).map(p => p.name).join(', ') || 'none'}) may fold under pressure`,
    ],
    keyPlayers: players.slice(0, 3).map(p => ({
      name: p.name, agent: p.agent, threat: p.rating >= 7 ? 'High' : p.rating >= 5 ? 'Medium' : 'Low',
      note: p.kast >= 75 ? 'Consistent — never trades down' : p.fk >= 3 ? 'Entry fragger — shut down early' : 'Role player — collapse on others first'
    })),
    mapBans: mapData.sort((a, b) => b.wr - a.wr).slice(0, 2).map(m => m.map),
    stratNotes: [
      'Exploit pistol rounds — their eco win rate is low',
      `Focus utility on ${topFragger?.name} — they carry or feed`,
      `Play ${mapData.sort((a, b) => a.wr - b.wr)[0]?.map} — their worst map`,
    ]
  }
}

export default function Scout() {
  const [searchParams] = useSearchParams()
  const defaultTeam = searchParams.get('team') || MOCK_TEAMS[1].id
  const [selectedTeam, setSelectedTeam] = useState(defaultTeam)

  const team = MOCK_TEAMS.find(t => t.id === selectedTeam) || MOCK_TEAMS[1]
  const players = MOCK_PLAYERS[selectedTeam] || []
  const mapData = MAP_WIN_RATES[selectedTeam] || []
  const report = generateReport(team, players, mapData)

  const radarData = [
    { stat: 'ACS', value: Math.round(players.reduce((s,p) => s + p.acs, 0) / players.length / 3) },
    { stat: 'KAST', value: Math.round(players.reduce((s,p) => s + p.kast, 0) / players.length) },
    { stat: 'ADR', value: Math.round(players.reduce((s,p) => s + p.adr, 0) / players.length / 2.5) },
    { stat: 'HS%', value: Math.round(players.reduce((s,p) => s + p.hs, 0) / players.length) },
    { stat: 'FK Rate', value: Math.round(players.reduce((s,p) => s + p.fk, 0) / players.length * 15) },
    { stat: 'Clutch', value: 48 },
  ]

  function handleExport() {
    const reportText = `
VALORANT COLLEGIATE SCOUTING REPORT
=====================================
Team: ${team.name} (${team.school})
Rank: ${team.rank} | Record: ${team.wins}–${team.losses}
Generated: ${new Date().toLocaleDateString()}

KEY THREATS
-----------
${report.threats.map(t => `• ${t}`).join('\n')}

EXPLOITABLE WEAKNESSES
----------------------
${report.weaknesses.map(w => `• ${w}`).join('\n')}

MAP BANS (RECOMMENDED)
----------------------
${report.mapBans.map(m => `• ${m}`).join('\n')}

STRATEGIC NOTES
---------------
${report.stratNotes.map(s => `• ${s}`).join('\n')}

PLAYER BREAKDOWN
----------------
${players.map(p => `${p.name} (${p.agent}) — ACS: ${p.acs} | K/D: ${p.kd} | KAST: ${p.kast}%`).join('\n')}
    `.trim()

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scouting-report-${team.name.replace(/\s/g, '-')}.txt`
    a.click()
  }

  return (
    <div className="fade-in">
      <Header title="Scouting Report" subtitle="AI-generated opponent analysis" />
      <div className="p-6 space-y-6">

        {/* Team selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="section-label self-center">Scouting:</div>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="bg-val-card border border-val-border text-white px-4 py-2 rounded-md font-display font-semibold text-sm uppercase tracking-wider focus:outline-none focus:border-val-red"
            >
              {MOCK_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <Download size={13} /> Export Report
          </button>
        </div>

        {/* Team overview */}
        <div className="card p-5 flex items-center gap-6 flex-wrap">
          <div className="w-14 h-14 rounded-lg bg-val-red/15 border border-val-red/30 flex items-center justify-center font-display font-bold text-val-red text-lg">
            {team.logo}
          </div>
          <div className="flex-1">
            <div className="text-white font-display font-bold text-xl">{team.name}</div>
            <div className="text-val-muted text-xs font-mono">{team.school} · {team.region} · {team.rank}</div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="font-display font-bold text-2xl text-white">{team.wins}–{team.losses}</div>
              <div className="text-val-muted text-[10px] font-mono uppercase">Record</div>
            </div>
            <div className="text-center">
              <div className={`font-display font-bold text-2xl ${Math.round(team.wins/(team.wins+team.losses)*100) >= 60 ? 'text-val-teal' : 'text-val-red'}`}>
                {Math.round(team.wins / (team.wins + team.losses) * 100)}%
              </div>
              <div className="text-val-muted text-[10px] font-mono uppercase">Win Rate</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Threats */}
          <div className="card p-5">
            <h3 className="text-val-red font-display text-base mb-3 flex items-center gap-2">
              <AlertTriangle size={14} /> Key Threats
            </h3>
            <div className="space-y-2">
              {report.threats.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-red-900/10 border border-red-900/20 rounded px-3 py-2.5">
                  <span className="text-val-red text-xs font-mono mt-0.5 flex-shrink-0">0{i+1}</span>
                  <p className="text-white text-sm">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="card p-5">
            <h3 className="text-val-teal font-display text-base mb-3 flex items-center gap-2">
              <CheckCircle size={14} /> Exploitable Weaknesses
            </h3>
            <div className="space-y-2">
              {report.weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-teal-900/10 border border-teal-900/20 rounded px-3 py-2.5">
                  <span className="text-val-teal text-xs font-mono mt-0.5 flex-shrink-0">0{i+1}</span>
                  <p className="text-white text-sm">{w}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key players to watch */}
        <div className="card p-5">
          <h3 className="text-white font-display text-base mb-4 flex items-center gap-2">
            <Target size={14} className="text-val-red" /> Players to Watch
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {report.keyPlayers.map((kp, i) => {
              const playerData = players.find(p => p.name === kp.name)
              const agentColor = AGENT_COLORS[kp.agent] || '#7B9BAF'
              return (
                <div key={i} className="bg-val-darker border border-val-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center font-display font-bold text-xs"
                      style={{ background: agentColor + '25', color: agentColor, border: `1px solid ${agentColor}40` }}>
                      {kp.agent?.slice(0,2)}
                    </div>
                    <div>
                      <div className="text-white font-display font-semibold text-sm">{kp.name}</div>
                      <div className="text-val-muted text-xs font-mono">{kp.agent}</div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className={`tag text-[9px] ${kp.threat === 'High' ? 'tag-red' : kp.threat === 'Medium' ? 'tag-gold' : 'tag-muted'}`}>
                      {kp.threat} Threat
                    </span>
                  </div>
                  <p className="text-val-muted text-xs">{kp.note}</p>
                  {playerData && (
                    <div className="mt-3 pt-2 border-t border-val-border grid grid-cols-3 gap-1 text-center">
                      <div><div className="text-white font-display font-bold text-sm">{playerData.acs}</div><div className="text-val-muted text-[9px] font-mono">ACS</div></div>
                      <div><div className="text-white font-display font-bold text-sm">{playerData.kd}</div><div className="text-val-muted text-[9px] font-mono">K/D</div></div>
                      <div><div className="text-white font-display font-bold text-sm">{playerData.kast}%</div><div className="text-val-muted text-[9px] font-mono">KAST</div></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="card p-5">
            <h3 className="text-white font-display text-base mb-4">Team Profile</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1F3147" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: '#7B9BAF', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Radar dataKey="value" stroke="#FF4655" fill="#FF4655" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Strat notes */}
          <div className="card p-5">
            <h3 className="text-white font-display text-base mb-4">Strategic Notes</h3>
            <div className="space-y-3">
              {report.stratNotes.map((note, i) => (
                <div key={i} className="flex items-start gap-3 border-l-2 border-val-red pl-3 py-1">
                  <p className="text-white text-sm">{note}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-val-border">
              <div className="section-label mb-2">Recommended Map Bans</div>
              <div className="flex gap-2">
                {report.mapBans.map(m => <span key={m} className="tag tag-red">{m}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

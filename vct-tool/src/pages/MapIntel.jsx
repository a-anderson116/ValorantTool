import { useState } from 'react'
import Header from '../components/Header'
import { MOCK_TEAMS, MAP_WIN_RATES } from '../data/mockData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts'

const MAPS = ['Bind', 'Haven', 'Split', 'Ascent', 'Icebox', 'Lotus', 'Pearl']

const MAP_NOTES = {
  Bind: 'Two one-way teleporters connect sites. No mid — forces A or B commitment.',
  Haven: 'Three bomb sites. CT must cover more ground; strong for coordinated teams.',
  Split: 'Verticality and ropes define mid control. Attacker-favored in high-skill play.',
  Ascent: 'Open mid control is pivotal. Teams with strong mid presence dominate.',
  Icebox: 'Complex angles and zipping mechanic reward mechanical skill.',
  Lotus: 'Three sites with destructible walls. Rotating speed is key.',
  Pearl: 'Underground map with long sightlines. Similar feel to Ascent mid.',
}

export default function MapIntel() {
  const [selectedMap, setSelectedMap] = useState('Bind')
  const [compareTeamA, setCompareTeamA] = useState('sfu-esports')
  const [compareTeamB, setCompareTeamB] = useState('ubc-thunder')

  const teamAData = MAP_WIN_RATES[compareTeamA] || []
  const teamBData = MAP_WIN_RATES[compareTeamB] || []

  const compareData = MAPS.map(map => ({
    map,
    [MOCK_TEAMS.find(t => t.id === compareTeamA)?.name || 'A']: teamAData.find(m => m.map === map)?.wr || 0,
    [MOCK_TEAMS.find(t => t.id === compareTeamB)?.name || 'B']: teamBData.find(m => m.map === map)?.wr || 0,
  }))

  const teamAName = MOCK_TEAMS.find(t => t.id === compareTeamA)?.name || 'Team A'
  const teamBName = MOCK_TEAMS.find(t => t.id === compareTeamB)?.name || 'Team B'

  // Map ban recommendation
  const bannedMaps = MAPS.map(map => {
    const aWr = teamAData.find(m => m.map === map)?.wr || 50
    const bWr = teamBData.find(m => m.map === map)?.wr || 50
    return { map, aWr, bWr, diff: bWr - aWr }
  }).sort((a, b) => b.diff - a.diff)

  return (
    <div className="fade-in">
      <Header title="Map Intelligence" subtitle="Win rates, pool analysis, and ban recommendations" />
      <div className="p-6 space-y-6">

        {/* Map selector */}
        <div className="flex gap-2 flex-wrap">
          {MAPS.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMap(m)}
              className={`px-4 py-2 rounded font-display font-semibold text-sm uppercase tracking-wider transition-colors ${
                selectedMap === m
                  ? 'bg-val-red text-white'
                  : 'bg-val-card border border-val-border text-val-muted hover:text-white hover:border-val-red/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Selected map info */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-white font-display font-bold text-2xl">{selectedMap}</h2>
              <p className="text-val-muted text-sm mt-1 max-w-lg">{MAP_NOTES[selectedMap]}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {MOCK_TEAMS.slice(0, 2).map(team => {
                const wr = MAP_WIN_RATES[team.id]?.find(m => m.map === selectedMap)?.wr || 0
                return (
                  <div key={team.id} className="text-center bg-val-darker rounded-lg p-3 min-w-[80px]">
                    <div className="text-val-muted text-[9px] font-mono uppercase tracking-wider">{team.logo}</div>
                    <div className={`font-display font-bold text-xl mt-0.5 ${wr >= 60 ? 'text-val-teal' : wr >= 40 ? 'text-val-gold' : 'text-val-red'}`}>
                      {wr}%
                    </div>
                    <div className="text-val-muted text-[9px] font-mono">Win Rate</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Team comparison */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="text-white font-display text-base">Map Pool Comparison</h3>
            <div className="flex items-center gap-2">
              <select value={compareTeamA} onChange={e => setCompareTeamA(e.target.value)}
                className="bg-val-darker border border-val-border text-white text-xs px-3 py-1.5 rounded font-mono focus:outline-none focus:border-val-red">
                {MOCK_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <span className="text-val-muted font-mono text-xs">vs</span>
              <select value={compareTeamB} onChange={e => setCompareTeamB(e.target.value)}
                className="bg-val-darker border border-val-border text-white text-xs px-3 py-1.5 rounded font-mono focus:outline-none focus:border-val-red">
                {MOCK_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={compareData} margin={{ bottom: 5 }}>
              <XAxis dataKey="map" tick={{ fill: '#7B9BAF', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#7B9BAF', fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#1A2634', border: '1px solid #1F3147', borderRadius: 6 }}
                formatter={(v, name) => [`${v}%`, name]}
                labelStyle={{ color: '#E8F0F7', fontFamily: 'Rajdhani', fontWeight: 700 }}
              />
              <Bar dataKey={teamAName} fill="#378ADD" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
              <Bar dataKey={teamBName} fill="#FF4655" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-2">
            <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-blue-500 opacity-80"/><span className="text-val-muted text-xs font-mono">{teamAName}</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-2 rounded bg-val-red opacity-80"/><span className="text-val-muted text-xs font-mono">{teamBName}</span></div>
          </div>
        </div>

        {/* Ban recommendations */}
        <div className="card p-5">
          <h3 className="text-white font-display text-base mb-1">Ban Recommendations</h3>
          <p className="text-val-muted text-xs font-mono mb-4">Playing as {teamAName} — maps sorted by opponent advantage</p>
          <div className="space-y-2">
            {bannedMaps.map(({ map, aWr, bWr, diff }) => (
              <div key={map} className="flex items-center gap-4 bg-val-darker rounded px-4 py-2.5">
                <div className="w-16 font-display font-semibold text-white text-sm">{map}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-mono text-val-muted mb-1">
                    <span>{teamAName}: {aWr}%</span>
                    <span>{teamBName}: {bWr}%</span>
                  </div>
                  <div className="h-1.5 bg-val-border rounded-full overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-full bg-blue-500 opacity-70 rounded-full" style={{ width: `${aWr}%` }} />
                  </div>
                </div>
                <div className="w-20 text-right">
                  {diff > 15 ? (
                    <span className="tag tag-red">Ban This</span>
                  ) : diff > 5 ? (
                    <span className="tag tag-gold">Consider</span>
                  ) : (
                    <span className="tag tag-teal">Favorable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

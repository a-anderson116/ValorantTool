import { useState } from 'react'
import Header from '../components/Header'
import { MOCK_PLAYERS, MOCK_TEAMS, AGENT_COLORS, ROLE_COLORS } from '../data/mockData'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const allPlayers = Object.entries(MOCK_PLAYERS).flatMap(([teamId, players]) =>
  players.map(p => ({ ...p, teamId, teamName: MOCK_TEAMS.find(t => t.id === teamId)?.name || teamId }))
)

function PlayerCard({ player }) {
  const [expanded, setExpanded] = useState(false)
  const agentColor = AGENT_COLORS[player.agent] || '#7B9BAF'
  const roleColor = ROLE_COLORS[player.role] || '#7B9BAF'

  const radarData = [
    { stat: 'ACS', value: Math.min(Math.round((player.acs / 300) * 100), 100) },
    { stat: 'K/D', value: Math.min(Math.round((player.kd / 2) * 100), 100) },
    { stat: 'ADR', value: Math.min(Math.round((player.adr / 250) * 100), 100) },
    { stat: 'HS%', value: player.hs },
    { stat: 'KAST', value: player.kast },
    { stat: 'FK Rate', value: Math.min(player.fk * 12, 100) },
  ]

  return (
    <div className="card hover:border-val-red/40 transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
              style={{ background: agentColor + '25', color: agentColor, border: `1px solid ${agentColor}50` }}
            >
              {player.agent?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-display font-bold text-base leading-tight">
                {player.name}
                <span className="text-val-muted font-body font-normal text-xs ml-1.5">#{player.tag}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: roleColor + '25', color: roleColor }}>{player.role}</span>
                <span className="text-val-muted text-xs font-mono">{player.agent}</span>
                <span className="text-val-muted text-xs">·</span>
                <span className="text-val-muted text-xs font-mono">{player.teamName}</span>
              </div>
            </div>
          </div>
          <div
            className="font-display font-bold text-2xl flex-shrink-0"
            style={{ color: player.rating >= 7 ? '#FF4655' : player.rating >= 5 ? '#FFD700' : '#7B9BAF' }}
          >
            {player.rating}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-val-border">
          {[
            { label: 'ACS', value: player.acs, color: 'text-white' },
            { label: 'K/D', value: player.kd, color: player.kd >= 1 ? 'text-val-teal' : 'text-val-muted' },
            { label: 'ADR', value: player.adr, color: 'text-white' },
            { label: 'HS%', value: `${player.hs}%`, color: player.hs > 35 ? 'text-val-red' : 'text-val-muted' },
            { label: 'KAST', value: `${player.kast}%`, color: player.kast >= 70 ? 'text-val-teal' : 'text-val-muted' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`font-display font-bold text-base ${color}`}>{value}</div>
              <div className="text-val-muted text-[9px] font-mono uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded radar */}
      {expanded && (
        <div className="border-t border-val-border px-4 pb-4 pt-3">
          <div className="section-label mb-2">Performance Radar</div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1F3147" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: '#7B9BAF', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Radar dataKey="value" stroke={agentColor} fill={agentColor} fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-2 text-xs font-mono">
            <div className="flex justify-between bg-val-darker rounded px-3 py-1.5">
              <span className="text-val-muted">First Kills</span>
              <span className="text-white">{player.fk}</span>
            </div>
            <div className="flex justify-between bg-val-darker rounded px-3 py-1.5">
              <span className="text-val-muted">First Deaths</span>
              <span className="text-white">{player.fd}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Players() {
  const [teamFilter, setTeamFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('acs')

  const filtered = allPlayers
    .filter(p => teamFilter === 'all' || p.teamId === teamFilter)
    .filter(p => roleFilter === 'all' || p.role === roleFilter)
    .sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="fade-in">
      <Header title="Players" subtitle={`${allPlayers.length} players across ${MOCK_TEAMS.length} teams`} />
      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="bg-val-card border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red font-mono"
          >
            <option value="all">All Teams</option>
            {MOCK_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-val-card border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red font-mono"
          >
            <option value="all">All Roles</option>
            {['Duelist','Controller','Initiator','Sentinel'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-val-card border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red font-mono"
          >
            <option value="acs">Sort: ACS</option>
            <option value="kd">Sort: K/D</option>
            <option value="adr">Sort: ADR</option>
            <option value="kast">Sort: KAST</option>
            <option value="rating">Sort: Rating</option>
          </select>
          <div className="text-val-muted text-xs font-mono self-center">{filtered.length} players</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(p => <PlayerCard key={`${p.teamId}-${p.puuid}`} player={p} />)}
        </div>
      </div>
    </div>
  )
}

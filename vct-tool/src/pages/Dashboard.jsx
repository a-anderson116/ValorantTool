import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, AlertTriangle, Eye } from 'lucide-react'
import Header from '../components/Header'
import { StatCard } from '../components/StatCard'
import { MOCK_TEAMS, MOCK_MATCHES, MOCK_PLAYERS, ROLE_COLORS } from '../data/mockData'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

const myTeam = MOCK_TEAMS[0]
const myPlayers = MOCK_PLAYERS['sfu-esports']
const recentMatches = MOCK_MATCHES

const radarData = [
  { stat: 'ACS', value: 82 }, { stat: 'ADR', value: 74 }, { stat: 'HS%', value: 65 },
  { stat: 'KAST', stat: 'KAST', value: 70 }, { stat: 'FK Rate', value: 55 }, { stat: 'KAST', value: 70 },
]

const radarDataFixed = [
  { stat: 'ACS', value: 82 }, { stat: 'ADR', value: 74 }, { stat: 'HS%', value: 65 },
  { stat: 'FK Rate', value: 55 }, { stat: 'KAST', value: 70 }, { stat: 'Clutch', value: 48 },
]

export default function Dashboard() {
  return (
    <div className="fade-in">
      <Header title="Dashboard" subtitle={`${myTeam.name} · Spring 2026 Season`} />

      <div className="p-6 space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Season Record" value={`${myTeam.wins}–${myTeam.losses}`} sub="CCPL Spring 2026" accent />
          <StatCard label="Avg Team ACS" value="165" sub="Top 30% in conference" trend={8} />
          <StatCard label="Map Win Rate" value="62%" sub="5 maps tracked" trend={-3} />
          <StatCard label="Avg Rank" value="Diamond III" sub="Team peak: Ascendant II" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar */}
          <div className="card p-5">
            <h3 className="text-white font-display text-base mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-val-red" /> Team Performance
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarDataFixed}>
                <PolarGrid stroke="#1F3147" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: '#7B9BAF', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Radar dataKey="value" stroke="#FF4655" fill="#FF4655" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent matches */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-display text-base">Recent Matches</h3>
              <Link to="/matches" className="text-val-red text-xs font-mono flex items-center gap-1 hover:text-red-400">
                All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentMatches.map(m => {
                const isWin = m.winner === 'sfu-esports'
                const myScore = m.teamA.id === 'sfu-esports' ? m.teamA.score : m.teamB.score
                const oppScore = m.teamA.id === 'sfu-esports' ? m.teamB.score : m.teamA.score
                const opp = m.teamA.id === 'sfu-esports' ? m.teamB.name : m.teamA.name
                return (
                  <Link
                    key={m.id}
                    to={`/matches/${m.id}`}
                    className="flex items-center justify-between bg-val-darker border border-val-border rounded-md px-4 py-3 hover:border-val-red/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isWin ? 'bg-val-teal' : 'bg-val-red'}`}></span>
                      <div>
                        <div className="text-white text-sm font-display font-semibold">vs {opp}</div>
                        <div className="text-val-muted text-xs font-mono">{m.map} · {new Date(m.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-display font-bold text-lg ${isWin ? 'text-val-teal' : 'text-val-red'}`}>
                        {myScore}–{oppScore}
                      </span>
                      <Eye size={14} className="text-val-muted group-hover:text-val-red transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Roster summary */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-display text-base">Roster — SFU Esports</h3>
            <Link to="/players" className="text-val-red text-xs font-mono flex items-center gap-1 hover:text-red-400">
              Full profiles <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-val-border text-val-muted text-xs font-mono uppercase tracking-wider">
                  <th className="text-left pb-2 px-2">Player</th>
                  <th className="pb-2 px-2">ACS</th>
                  <th className="pb-2 px-2">K/D</th>
                  <th className="pb-2 px-2">ADR</th>
                  <th className="pb-2 px-2">HS%</th>
                  <th className="pb-2 px-2">KAST</th>
                  <th className="pb-2 px-2">Rating</th>
                </tr>
              </thead>
              <tbody>
                {myPlayers.map(p => (
                  <tr key={p.puuid} className="border-b border-val-border/30 hover:bg-val-card/50">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded text-[9px] font-display font-bold flex items-center justify-center"
                          style={{ background: ROLE_COLORS[p.role] + '25', color: ROLE_COLORS[p.role] }}
                        >{p.agent?.slice(0,2)}</span>
                        <span className="text-white font-display font-semibold">{p.name}</span>
                        <span className="text-val-muted text-xs">#{p.tag}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-display font-bold text-white">{p.acs}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-sm">
                      <span className={p.kd >= 1 ? 'text-val-teal' : 'text-val-muted'}>{p.kd}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-sm text-val-muted">{p.adr}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-sm text-val-muted">{p.hs}%</td>
                    <td className="py-2.5 px-2 text-center font-mono text-sm">
                      <span className={p.kast >= 70 ? 'text-val-teal' : 'text-val-red'}>{p.kast}%</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="font-display font-bold" style={{ color: p.rating >= 7 ? '#FF4655' : p.rating >= 5 ? '#FFD700' : '#7B9BAF' }}>
                        {p.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scout alert */}
        <div className="border border-yellow-600/40 bg-yellow-900/10 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-val-gold flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-val-gold font-display font-semibold text-sm">Next Match — UBC Thunder · Bind</div>
            <div className="text-val-muted text-xs mt-0.5">UBC wins 80% on Bind. Their duelist <strong className="text-white">nndy</strong> averages 293 ACS with 91% KAST. Review the scouting report before warmup.</div>
            <Link to="/scout" className="text-val-gold text-xs font-mono flex items-center gap-1 mt-2 hover:underline">
              View Scout Report <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import { MOCK_TEAMS, MOCK_PLAYERS, MAP_WIN_RATES } from '../data/mockData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Teams() {
  return (
    <div className="fade-in">
      <Header title="Teams" subtitle="CCPL Spring 2026 — All tracked programs" />
      <div className="p-6 space-y-4">
        {MOCK_TEAMS.map((team, idx) => {
          const players = MOCK_PLAYERS[team.id] || []
          const mapData = MAP_WIN_RATES[team.id] || []
          const wr = Math.round((team.wins / (team.wins + team.losses)) * 100)

          return (
            <div key={team.id} className="card p-5 space-y-4">
              {/* Team header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-val-red/15 border border-val-red/30 flex items-center justify-center font-display font-bold text-val-red text-sm">
                    {team.logo}
                  </div>
                  <div>
                    <div className="text-white font-display font-bold text-lg leading-tight">{team.name}</div>
                    <div className="text-val-muted text-xs font-mono">{team.school} · {team.region}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center hidden sm:block">
                    <div className="text-val-muted text-[10px] font-mono uppercase tracking-wider">Record</div>
                    <div className="font-display font-bold text-white text-lg">{team.wins}–{team.losses}</div>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="text-val-muted text-[10px] font-mono uppercase tracking-wider">Win Rate</div>
                    <div className={`font-display font-bold text-lg ${wr >= 60 ? 'text-val-teal' : wr >= 40 ? 'text-val-gold' : 'text-val-red'}`}>
                      {wr}%
                    </div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-val-muted text-[10px] font-mono uppercase tracking-wider">Avg Rank</div>
                    <div className="text-white font-mono text-sm">{team.rank}</div>
                  </div>
                  <Link
                    to={`/scout?team=${team.id}`}
                    className="btn-primary text-xs py-2 hidden sm:flex items-center gap-1.5"
                  >
                    Scout <ChevronRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Players & map pool */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-val-border">
                {/* Roster */}
                {players.length > 0 && (
                  <div>
                    <div className="section-label mb-2">Roster</div>
                    <div className="space-y-1.5">
                      {players.map(p => (
                        <div key={p.puuid} className="flex items-center justify-between bg-val-darker rounded px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-val-muted font-mono text-xs w-14 truncate">{p.agent}</span>
                            <span className="text-white font-display font-semibold text-sm">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono">
                            <span className="text-val-muted">{p.acs} ACS</span>
                            <span className={p.kd >= 1 ? 'text-val-teal' : 'text-val-muted'}>{p.kd} K/D</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map win rates */}
                {mapData.length > 0 && (
                  <div>
                    <div className="section-label mb-2">Map Pool</div>
                    <ResponsiveContainer width="100%" height={130}>
                      <BarChart data={mapData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#7B9BAF', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                        <YAxis type="category" dataKey="map" tick={{ fill: '#7B9BAF', fontSize: 11, fontFamily: 'JetBrains Mono' }} width={45} />
                        <Tooltip
                          contentStyle={{ background: '#1A2634', border: '1px solid #1F3147', borderRadius: 6 }}
                          formatter={(v) => [`${v}%`, 'Win Rate']}
                          labelStyle={{ color: '#E8F0F7', fontFamily: 'Rajdhani', fontWeight: 700 }}
                        />
                        <Bar dataKey="wr" radius={[0, 3, 3, 0]}>
                          {mapData.map((entry, i) => (
                            <Cell key={i} fill={entry.wr >= 60 ? '#00C8BE' : entry.wr >= 40 ? '#FFD700' : '#FF4655'} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

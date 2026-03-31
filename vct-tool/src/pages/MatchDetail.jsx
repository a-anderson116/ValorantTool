import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Download } from 'lucide-react'
import Header from '../components/Header'
import PlayerRow from '../components/PlayerRow'
import { MOCK_MATCHES, MOCK_PLAYERS } from '../data/mockData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid
} from 'recharts'

const ROUND_TYPE_COLOR = {
  Pistol: '#FFD700', Full: '#00C8BE', Eco: '#FF4655', Force: '#B44FAC'
}

export default function MatchDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('scoreboard')

  const match = MOCK_MATCHES.find(m => m.id === id) || MOCK_MATCHES[0]
  const playersA = MOCK_PLAYERS['sfu-esports']
  const playersB = MOCK_PLAYERS['ubc-thunder']

  const tabs = ['scoreboard', 'rounds', 'economy']

  return (
    <div className="fade-in">
      <Header
        title={`${match.map} — ${match.teamA.name} vs ${match.teamB.name}`}
        subtitle={`${match.mode} · ${new Date(match.date).toLocaleDateString()} · ${match.duration}`}
      />
      <div className="p-6 space-y-5">

        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <Link to="/matches" className="text-val-muted text-sm font-mono flex items-center gap-1.5 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back to matches
          </Link>
          <button className="btn-ghost flex items-center gap-2 text-xs">
            <Download size={13} /> Export Report
          </button>
        </div>

        {/* Score hero */}
        <div className="card p-6 flex items-center justify-between">
          <div>
            <div className="section-label">Team A</div>
            <div className="font-display font-bold text-2xl text-white">{match.teamA.name}</div>
            <div className="text-val-muted text-xs font-mono mt-1">Started {match.teamA.side_start}</div>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-5xl">
              <span className={match.winner === match.teamA.id ? 'text-val-teal' : 'text-white'}>{match.teamA.score}</span>
              <span className="text-val-border mx-3">:</span>
              <span className={match.winner === match.teamB.id ? 'text-val-teal' : 'text-white'}>{match.teamB.score}</span>
            </div>
            <div className="text-val-muted text-xs font-mono mt-1">{match.avgRank} Avg · {match.rounds?.length} Rounds</div>
          </div>
          <div className="text-right">
            <div className="section-label">Team B</div>
            <div className="font-display font-bold text-2xl text-white">{match.teamB.name}</div>
            <div className="flex justify-end mt-1">
              <span className="tag tag-teal">Winner</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-val-border">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 font-display font-semibold text-sm uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-val-red text-white'
                  : 'border-transparent text-val-muted hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Scoreboard */}
        {tab === 'scoreboard' && (
          <div className="space-y-4">
            {[
              { label: `Team A — ${match.teamA.name}`, players: playersA, accent: 'border-l-2 border-blue-500' },
              { label: `Team B — ${match.teamB.name}`, players: playersB, accent: 'border-l-2 border-val-red' }
            ].map(({ label, players, accent }) => (
              <div key={label} className={`card overflow-hidden`}>
                <div className="px-4 py-2.5 bg-val-darker border-b border-val-border text-val-muted text-xs font-mono uppercase tracking-widest">
                  {label}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-val-border/50 text-val-muted text-[10px] font-mono uppercase tracking-widest">
                        <th className="text-left px-4 py-2">Player</th>
                        <th className="px-4 py-2">ACS</th>
                        <th className="px-4 py-2">K/D</th>
                        <th className="px-4 py-2">ADR</th>
                        <th className="px-4 py-2">HS%</th>
                        <th className="px-4 py-2">KAST</th>
                        <th className="px-4 py-2">FK</th>
                        <th className="px-4 py-2">FD</th>
                        <th className="px-4 py-2">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((p, i) => <PlayerRow key={p.puuid} player={p} rank={i + 1} />)}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rounds */}
        {tab === 'rounds' && (
          <div className="card p-5">
            <h3 className="text-white font-display text-base mb-4">Round-by-Round Results</h3>
            <div className="grid grid-cols-12 gap-1 mb-6">
              {match.rounds?.map(r => (
                <div key={r.num} className="flex flex-col items-center gap-1">
                  <span className="text-val-muted text-[8px] font-mono">{r.num}</span>
                  <div
                    className="w-full h-8 rounded text-[8px] font-mono flex items-center justify-center font-bold"
                    style={{
                      background: r.winner === 'A' ? '#185FA520' : '#A32D2D20',
                      color: r.winner === 'A' ? '#378ADD' : '#FF4655',
                      border: `1px solid ${r.winner === 'A' ? '#185FA540' : '#A32D2D40'}`
                    }}
                  >
                    {r.winner}
                  </div>
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: ROUND_TYPE_COLOR[r.type] || '#7B9BAF' }}
                    title={r.type}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(ROUND_TYPE_COLOR).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-val-muted text-xs font-mono">{type}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-val-border text-val-muted text-[10px] font-mono uppercase tracking-widest">
                    <th className="text-left pb-2">Round</th>
                    <th className="pb-2">Winner</th>
                    <th className="pb-2">Buy Type</th>
                    <th className="pb-2">Outcome</th>
                    <th className="pb-2">Econ A</th>
                    <th className="pb-2">Econ B</th>
                  </tr>
                </thead>
                <tbody>
                  {match.rounds?.map(r => (
                    <tr key={r.num} className="border-b border-val-border/30 hover:bg-val-card/50">
                      <td className="py-2 font-mono text-val-muted">#{r.num}</td>
                      <td className="py-2 text-center font-display font-bold" style={{ color: r.winner === 'A' ? '#378ADD' : '#FF4655' }}>{r.winner === 'A' ? match.teamA.name : match.teamB.name}</td>
                      <td className="py-2 text-center"><span className="text-xs font-mono" style={{ color: ROUND_TYPE_COLOR[r.type] }}>{r.type}</span></td>
                      <td className="py-2 text-center text-val-muted text-xs font-mono">{r.outcome}</td>
                      <td className="py-2 text-center font-mono text-xs text-white">${r.economy_a?.toLocaleString()}</td>
                      <td className="py-2 text-center font-mono text-xs text-white">${r.economy_b?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Economy */}
        {tab === 'economy' && (
          <div className="card p-5">
            <h3 className="text-white font-display text-base mb-4">Economy Per Round</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={match.rounds?.map(r => ({ round: r.num, teamA: r.economy_a, teamB: r.economy_b }))}>
                <CartesianGrid stroke="#1F3147" strokeDasharray="3 3" />
                <XAxis dataKey="round" tick={{ fill: '#7B9BAF', fontSize: 11 }} label={{ value: 'Round', fill: '#7B9BAF', fontSize: 11, position: 'insideBottom', offset: -5 }} />
                <YAxis tick={{ fill: '#7B9BAF', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1A2634', border: '1px solid #1F3147', borderRadius: 6 }}
                  labelStyle={{ color: '#7B9BAF', fontFamily: 'JetBrains Mono', fontSize: 11 }}
                  formatter={(v, name) => [`$${v.toLocaleString()}`, name === 'teamA' ? match.teamA.name : match.teamB.name]}
                />
                <Line type="monotone" dataKey="teamA" stroke="#378ADD" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="teamB" stroke="#FF4655" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-3">
              <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-blue-500"/><span className="text-val-muted text-xs font-mono">{match.teamA.name}</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-val-red"/><span className="text-val-muted text-xs font-mono">{match.teamB.name}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

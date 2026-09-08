import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, AlertTriangle, Lock } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { searchPlayer } from '../services/api'
import { aggregateStats } from '../utils/stats'
import { REGIONS } from '../hooks/useMyProfile'
import { AGENT_COLORS } from '../data/mockData'

export default function Players() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [region, setRegion] = useState('na')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Non-admins: opt-in-gated empty state (no arbitrary lookups).
  if (!isAdmin) {
    return (
      <div>
        <Header title="Players" subtitle="Opted-in players" />
        <EmptyState
          icon={Users}
          title="No players yet"
          message="Only players who have signed in and opted in through Riot Sign On are listed here. As players opt in, their profiles and stats become available."
        />
      </div>
    )
  }

  function runSearch(e) {
    e?.preventDefault()
    if (!name.trim() || !tag.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    searchPlayer({ name: name.trim(), tag: tag.trim(), region })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const matches = data?.matches || []
  const stats = matches.length ? aggregateStats(matches) : null

  return (
    <div>
      <Header title="Player Search" subtitle="Admin lookup" />

      <div className="p-6 space-y-6">
        <form onSubmit={runSearch} className="stat-card flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-val-muted text-[10px] font-mono uppercase mb-1">Game Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="On1yRanger"
              className="bg-val-darker border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red w-44" />
          </div>
          <div>
            <label className="block text-val-muted text-[10px] font-mono uppercase mb-1">Tag</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="MAIN"
              className="bg-val-darker border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red w-28" />
          </div>
          <div>
            <label className="block text-val-muted text-[10px] font-mono uppercase mb-1">Region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)}
              className="bg-val-darker border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red uppercase">
              {REGIONS.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-val-red text-white font-display font-semibold uppercase tracking-wider text-sm px-5 py-2 rounded-md hover:brightness-110 transition disabled:opacity-50">
            <Search size={15} /> {loading ? 'Searching…' : 'Search'}
          </button>
          <span className="flex items-center gap-1 text-val-gold text-[10px] font-mono uppercase ml-auto">
            <Lock size={11} /> Admin only
          </span>
        </form>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-val-border border-t-val-red rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <EmptyState icon={AlertTriangle} title="Search failed" message={error} />
        )}

        {!loading && data && stats && (
          <>
            <div className="flex items-baseline justify-between">
              <div className="font-display font-bold text-white text-xl">
                {data.profile.gameName}<span className="text-val-muted text-base">#{data.profile.tagLine}</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-val-muted">
                {data.profile.region.toUpperCase()} · Source: <span className="text-val-teal">{data.source}</span> · last {stats.matchCount} matches
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Matches" value={stats.matchCount} />
              <StatCard label="Win Rate" value={`${stats.winRate}%`} accent={stats.winRate >= 50} />
              <StatCard label="Avg ACS" value={stats.acs} />
              <StatCard label="K/D" value={stats.kd} accent={parseFloat(stats.kd) >= 1} />
              <StatCard label="Avg ADR" value={stats.adr} />
              <StatCard label="HS%" value={`${stats.hsPct}%`} />
            </div>

            {stats.agents.length > 0 && (
              <div className="stat-card">
                <div className="section-label mb-3">Agents</div>
                <div className="flex flex-wrap gap-2">
                  {stats.agents.map((a) => {
                    const c = AGENT_COLORS[a.agent] || '#7B9BAF'
                    return (
                      <span key={a.agent} className="text-xs font-mono px-2.5 py-1 rounded"
                        style={{ background: c + '22', color: c, border: `1px solid ${c}55` }}>
                        {a.agent} · {a.matches}m · {a.wr}% WR
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="stat-card overflow-x-auto">
              <div className="section-label mb-3">Recent Matches</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-val-muted text-[10px] font-mono uppercase">
                    <th className="text-left py-2 px-2">Result</th>
                    <th className="text-left py-2 px-2">Map</th>
                    <th className="text-left py-2 px-2">Mode</th>
                    <th className="text-left py-2 px-2">Agent</th>
                    <th className="text-center py-2 px-2">K/D/A</th>
                    <th className="text-center py-2 px-2">ACS</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id} onClick={() => navigate(`/matches/${m.id}`)}
                      className="border-t border-val-border/50 hover:bg-val-card/60 cursor-pointer">
                      <td className="py-2 px-2">
                        <span className={`font-display font-bold ${m.won ? 'text-val-teal' : 'text-val-red'}`}>{m.won ? 'W' : 'L'}</span>
                      </td>
                      <td className="py-2 px-2 text-white">{m.map || '—'}</td>
                      <td className="py-2 px-2 text-val-muted">{m.mode || '—'}</td>
                      <td className="py-2 px-2 text-val-muted">{m.agent || '—'}</td>
                      <td className="py-2 px-2 text-center font-mono text-white">{m.kills}/{m.deaths}/{m.assists}</td>
                      <td className="py-2 px-2 text-center font-mono text-white">{m.acs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

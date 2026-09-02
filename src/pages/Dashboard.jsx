import { LayoutDashboard, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { useMyProfile, REGIONS } from '../hooks/useMyProfile'
import { AGENT_COLORS } from '../data/mockData'

function RegionSelect({ region, setRegion }) {
  return (
    <select
      value={region}
      onChange={(e) => setRegion(e.target.value)}
      className="bg-val-card border border-val-border text-white text-xs font-mono uppercase px-3 py-1.5 rounded-md focus:outline-none focus:border-val-red"
    >
      {REGIONS.map((r) => (
        <option key={r} value={r}>{r.toUpperCase()}</option>
      ))}
    </select>
  )
}

export default function Dashboard() {
  const { session } = useAuth()
  const riotId = session?.gameName ? `${session.gameName}#${session.tagLine}` : 'your account'
  const { data, loading, error, region, setRegion } = useMyProfile(10)

  const stats = data?.stats
  const matches = data?.matches || []
  const wins = matches.filter((m) => m.won).length
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0

  return (
    <div>
      <Header title="Dashboard" subtitle={`Signed in as ${riotId}`} />

      <div className="flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-2 text-val-muted text-xs font-mono uppercase tracking-wider">
          Region <RegionSelect region={region} setRegion={setRegion} />
        </div>
        {data?.source && data.source !== 'none' && (
          <span className="text-[10px] font-mono uppercase text-val-muted">
            Source: <span className="text-val-teal">{data.source}</span>
          </span>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-val-border border-t-val-red rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load your matches"
          message={`${error}. If your Riot API access is still pending, or your competitive history is private, data may be unavailable. Try a different region above.`}
        />
      )}

      {!loading && !error && matches.length === 0 && (
        <EmptyState
          icon={LayoutDashboard}
          title="No recent matches found"
          message={`We found no recent matches for ${riotId} in ${region.toUpperCase()}. Switch region above if you play elsewhere.`}
        />
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="p-6 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Matches" value={stats.matchCount} />
            <StatCard label="Win Rate" value={`${winRate}%`} accent={winRate >= 50} />
            <StatCard label="Avg ACS" value={stats.acs} />
            <StatCard label="K/D" value={stats.kd} accent={parseFloat(stats.kd) >= 1} />
            <StatCard label="Avg ADR" value={stats.adr} />
            <StatCard label="HS%" value={`${stats.hsPct}%`} />
          </div>

          {/* Top agents */}
          {stats.topAgents?.length > 0 && (
            <div className="stat-card">
              <div className="section-label mb-3">Most Played Agents</div>
              <div className="flex flex-wrap gap-2">
                {stats.topAgents.map((a) => {
                  const c = AGENT_COLORS[a.agent] || '#7B9BAF'
                  return (
                    <span
                      key={a.agent}
                      className="text-xs font-mono px-2.5 py-1 rounded"
                      style={{ background: c + '22', color: c, border: `1px solid ${c}55` }}
                    >
                      {a.agent} · {a.pct}%
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent matches */}
          <div className="stat-card overflow-x-auto">
            <div className="section-label mb-3">Recent Matches</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-val-muted text-[10px] font-mono uppercase">
                  <th className="text-left py-2 px-2">Result</th>
                  <th className="text-left py-2 px-2">Map</th>
                  <th className="text-left py-2 px-2">Agent</th>
                  <th className="text-center py-2 px-2">K / D / A</th>
                  <th className="text-center py-2 px-2">ACS</th>
                  <th className="text-center py-2 px-2">ADR</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-t border-val-border/50">
                    <td className="py-2 px-2">
                      <span className={`font-display font-bold ${m.won ? 'text-val-teal' : 'text-val-red'}`}>
                        {m.won ? 'W' : 'L'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-white">{m.map || '—'}</td>
                    <td className="py-2 px-2 text-val-muted">{m.agent || '—'}</td>
                    <td className="py-2 px-2 text-center font-mono text-white">
                      {m.kills} / {m.deaths} / {m.assists}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-white">{m.acs}</td>
                    <td className="py-2 px-2 text-center font-mono text-val-muted">{m.adr || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

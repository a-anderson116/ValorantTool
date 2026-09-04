import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { useMyProfile, REGIONS } from '../hooks/useMyProfile'
import { aggregateStats, orderModes } from '../utils/stats'
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
  const navigate = useNavigate()
  const riotId = session?.gameName ? `${session.gameName}#${session.tagLine}` : 'your account'
  const { data, loading, error, region, setRegion } = useMyProfile(20)

  const allMatches = data?.matches || []

  // Modes present in the sample, ordered (Competitive, Custom, ... first).
  const modes = useMemo(
    () => orderModes(Array.from(new Set(allMatches.map((m) => m.mode).filter(Boolean)))),
    [allMatches]
  )

  const [mode, setMode] = useState('Competitive')

  // Pick a sensible default once data arrives: Competitive, then Custom, then
  // the first available mode. 'all' is always valid.
  useEffect(() => {
    if (!modes.length) return
    if (mode !== 'all' && !modes.includes(mode)) {
      setMode(modes.includes('Competitive') ? 'Competitive' : modes.includes('Custom') ? 'Custom' : modes[0])
    }
  }, [modes.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  const matches = mode === 'all' ? allMatches : allMatches.filter((m) => m.mode === mode)
  const stats = aggregateStats(matches)

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

      {/* Per-mode tabs */}
      {!loading && !error && allMatches.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {modes.map((m) => (
            <ModePill key={m} label={m} active={mode === m} onClick={() => setMode(m)} />
          ))}
          <ModePill label="All" active={mode === 'all'} onClick={() => setMode('all')} />
        </div>
      )}

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

      {!loading && !error && allMatches.length === 0 && (
        <EmptyState
          icon={LayoutDashboard}
          title="No recent matches found"
          message={`We found no recent matches for ${riotId} in ${region.toUpperCase()}. Switch region above if you play elsewhere.`}
        />
      )}

      {!loading && !error && allMatches.length > 0 && matches.length === 0 && (
        <EmptyState
          icon={LayoutDashboard}
          title={`No ${mode} matches`}
          message={`No ${mode} matches in your last ${allMatches.length}. Pick another mode above.`}
        />
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="p-6 space-y-6">
          <div className="text-val-muted text-xs font-mono uppercase tracking-wider">
            {mode === 'all' ? 'All modes' : mode} · {stats.matchCount} matches
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Matches" value={stats.matchCount} />
            <StatCard label="Win Rate" value={`${stats.winRate}%`} accent={stats.winRate >= 50} />
            <StatCard label="Avg ACS" value={stats.acs} />
            <StatCard label="K/D" value={stats.kd} accent={parseFloat(stats.kd) >= 1} />
            <StatCard label="Avg ADR" value={stats.adr} />
            <StatCard label="HS%" value={`${stats.hsPct}%`} />
          </div>

          {/* Top agents */}
          {stats.topAgents.length > 0 && (
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

          {/* Agent breakdown */}
          {stats.agents.length > 0 && (
            <div className="stat-card overflow-x-auto">
              <div className="section-label mb-3">Agent Breakdown</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-val-muted text-[10px] font-mono uppercase">
                    <th className="text-left py-2 px-2">Agent</th>
                    <th className="text-center py-2 px-2">Matches</th>
                    <th className="text-center py-2 px-2">Win Rate</th>
                    <th className="text-center py-2 px-2">K/D</th>
                    <th className="text-center py-2 px-2">ACS</th>
                    <th className="text-center py-2 px-2">ADR</th>
                    <th className="text-center py-2 px-2">HS%</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.agents.map((a) => {
                    const c = AGENT_COLORS[a.agent] || '#7B9BAF'
                    return (
                      <tr key={a.agent} className="border-t border-val-border/50">
                        <td className="py-2 px-2">
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                            style={{ background: c + '22', color: c, border: `1px solid ${c}55` }}>
                            {a.agent}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-white">{a.matches}</td>
                        <td className="py-2 px-2 text-center font-mono"
                          style={{ color: a.wr >= 50 ? '#00C8BE' : '#FF4655' }}>{a.wr}%</td>
                        <td className="py-2 px-2 text-center font-mono text-white">{a.kd}</td>
                        <td className="py-2 px-2 text-center font-mono text-white">{a.acs}</td>
                        <td className="py-2 px-2 text-center font-mono text-val-muted">{a.adr || '—'}</td>
                        <td className="py-2 px-2 text-center font-mono text-val-muted">{a.hsPct ? `${a.hsPct}%` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Map performance */}
          {stats.maps.length > 0 && (
            <div className="stat-card overflow-x-auto">
              <div className="section-label mb-3">Map Performance</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-val-muted text-[10px] font-mono uppercase">
                    <th className="text-left py-2 px-2">Map</th>
                    <th className="text-left py-2 px-2 w-40">Win Rate</th>
                    <th className="text-center py-2 px-2">Record</th>
                    <th className="text-center py-2 px-2">K/D</th>
                    <th className="text-center py-2 px-2">ACS</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.maps.map((mp) => (
                    <tr key={mp.map} className="border-t border-val-border/50">
                      <td className="py-2 px-2 text-white">{mp.map}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-val-border rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: `${mp.wr}%`, background: mp.wr >= 50 ? '#00C8BE' : '#FF4655' }} />
                          </div>
                          <span className="font-mono text-xs text-val-muted w-9 text-right">{mp.wr}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono text-val-muted">{mp.wins}W–{mp.losses}L</td>
                      <td className="py-2 px-2 text-center font-mono text-white">{mp.kd}</td>
                      <td className="py-2 px-2 text-center font-mono text-white">{mp.acs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <th className="text-center py-2 px-2">HS%</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => navigate(`/matches/${m.id}`)}
                    className="border-t border-val-border/50 hover:bg-val-card/60 cursor-pointer"
                  >
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
                    <td className="py-2 px-2 text-center font-mono text-val-muted">{m.hsPct ? `${m.hsPct}%` : '—'}</td>
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

function ModePill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-display font-semibold uppercase tracking-wider transition ${
        active
          ? 'bg-val-red text-white'
          : 'bg-val-card border border-val-border text-val-muted hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

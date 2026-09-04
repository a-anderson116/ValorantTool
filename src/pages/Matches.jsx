import { useMemo, useState } from 'react'
import { Swords, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { useMyProfile, REGIONS } from '../hooks/useMyProfile'

export default function Matches() {
  const { data, loading, error, region, setRegion } = useMyProfile(20)
  const allMatches = data?.matches || []
  const [mode, setMode] = useState('all')

  // Distinct modes present in the loaded matches, for the filter dropdown.
  const modes = useMemo(() => {
    const set = new Set(allMatches.map((m) => m.mode).filter(Boolean))
    return Array.from(set).sort()
  }, [allMatches])

  const matches = mode === 'all' ? allMatches : allMatches.filter((m) => m.mode === mode)

  return (
    <div>
      <Header title="Matches" subtitle="Your recent matches" />

      <div className="flex flex-wrap items-center gap-4 px-6 pt-5 text-val-muted text-xs font-mono uppercase tracking-wider">
        <div className="flex items-center gap-2">
          Region
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-val-card border border-val-border text-white text-xs font-mono uppercase px-3 py-1.5 rounded-md focus:outline-none focus:border-val-red"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-val-card border border-val-border text-white text-xs font-mono px-3 py-1.5 rounded-md focus:outline-none focus:border-val-red"
          >
            <option value="all">All modes</option>
            {modes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        {!loading && !error && (
          <span className="text-val-muted/70 normal-case">
            {matches.length} of {allMatches.length} matches
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
          title="Couldn't load matches"
          message={`${error}. If your Riot API access is pending or your match history is private, data may be unavailable.`}
        />
      )}

      {!loading && !error && matches.length === 0 && (
        <EmptyState
          icon={Swords}
          title="No matches found"
          message={
            allMatches.length === 0
              ? `No recent matches in ${region.toUpperCase()}. Only your own opted-in data is shown here.`
              : `No ${mode} matches in your recent history. Try a different mode.`
          }
        />
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="p-6">
          <div className="stat-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-val-muted text-[10px] font-mono uppercase">
                  <th className="text-left py-2 px-2">Result</th>
                  <th className="text-left py-2 px-2">Map</th>
                  <th className="text-left py-2 px-2">Mode</th>
                  <th className="text-left py-2 px-2">Agent</th>
                  <th className="text-center py-2 px-2">K / D / A</th>
                  <th className="text-center py-2 px-2">ACS</th>
                  <th className="text-center py-2 px-2">ADR</th>
                  <th className="text-center py-2 px-2">HS%</th>
                  <th className="text-center py-2 px-2">Date</th>
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
                    <td className="py-2 px-2 text-val-muted">{m.mode || '—'}</td>
                    <td className="py-2 px-2 text-val-muted">{m.agent || '—'}</td>
                    <td className="py-2 px-2 text-center font-mono text-white">
                      {m.kills} / {m.deaths} / {m.assists}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-white">{m.acs}</td>
                    <td className="py-2 px-2 text-center font-mono text-val-muted">{m.adr || '—'}</td>
                    <td className="py-2 px-2 text-center font-mono text-val-muted">{m.hsPct ? `${m.hsPct}%` : '—'}</td>
                    <td className="py-2 px-2 text-center font-mono text-val-muted text-xs">
                      {m.startedAt ? String(m.startedAt).split('T')[0] : '—'}
                    </td>
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

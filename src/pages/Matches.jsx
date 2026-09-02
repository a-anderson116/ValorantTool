import { Swords, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { useMyProfile, REGIONS } from '../hooks/useMyProfile'

export default function Matches() {
  const { data, loading, error, region, setRegion } = useMyProfile(20)
  const matches = data?.matches || []

  return (
    <div>
      <Header title="Matches" subtitle="Your recent matches" />

      <div className="flex items-center gap-2 px-6 pt-5 text-val-muted text-xs font-mono uppercase tracking-wider">
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
          message={`No recent matches in ${region.toUpperCase()}. Only your own opted-in data is shown here.`}
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
                    <td className="py-2 px-2 text-val-muted capitalize">{m.mode || '—'}</td>
                    <td className="py-2 px-2 text-val-muted">{m.agent || '—'}</td>
                    <td className="py-2 px-2 text-center font-mono text-white">
                      {m.kills} / {m.deaths} / {m.assists}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-white">{m.acs}</td>
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

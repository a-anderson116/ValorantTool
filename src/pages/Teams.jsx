import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Plus, Trash2, X, BarChart3, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { REGIONS } from '../hooks/useMyProfile'
import { AGENT_COLORS } from '../data/mockData'
import { listTeams, saveTeam, deleteTeam, teamStats } from '../services/api'

const blankRow = () => ({ name: '', tag: '', region: 'na' })

export default function Teams() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Editor state
  const [editing, setEditing] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [rows, setRows] = useState([blankRow()])
  const [saving, setSaving] = useState(false)

  // Stats view
  const [statsFor, setStatsFor] = useState(null)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsErr, setStatsErr] = useState(null)

  function refresh() {
    setLoading(true)
    listTeams()
      .then((r) => setTeams(r.teams || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(refresh, [])

  function startNew() {
    setEditing(true)
    setTeamName('')
    setRows([blankRow()])
  }

  async function submit(e) {
    e.preventDefault()
    if (!teamName.trim()) return
    setSaving(true)
    try {
      const players = rows.filter((r) => r.name.trim() && r.tag.trim())
      await saveTeam({ name: teamName.trim(), players })
      setEditing(false)
      refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    await deleteTeam(id).catch((e) => setError(e.message))
    if (statsFor === id) { setStatsFor(null); setStats(null) }
    refresh()
  }

  function viewStats(team) {
    setStatsFor(team.id)
    setStats(null)
    setStatsErr(null)
    setStatsLoading(true)
    teamStats(team.id)
      .then(setStats)
      .catch((e) => setStatsErr(e.message))
      .finally(() => setStatsLoading(false))
  }

  return (
    <div>
      <Header title="Teams" subtitle="Your saved rosters" />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <span className="text-val-muted text-xs font-mono">{teams.length} team{teams.length === 1 ? '' : 's'}</span>
          {!editing && (
            <button onClick={startNew}
              className="flex items-center gap-2 bg-val-red text-white font-display font-semibold uppercase tracking-wider text-sm px-4 py-2 rounded-md hover:brightness-110 transition">
              <Plus size={15} /> New Team
            </button>
          )}
        </div>

        {/* Editor */}
        {editing && (
          <form onSubmit={submit} className="stat-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="section-label">New Team</div>
              <button type="button" onClick={() => setEditing(false)} className="text-val-muted hover:text-white"><X size={16} /></button>
            </div>
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name (e.g. SFU Esports)"
              className="w-full bg-val-darker border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red" />
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input value={r.name} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Game name" className="bg-val-darker border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red w-40" />
                  <span className="text-val-muted">#</span>
                  <input value={r.tag} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, tag: e.target.value } : x))}
                    placeholder="Tag" className="bg-val-darker border border-val-border text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:border-val-red w-24" />
                  <select value={r.region} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, region: e.target.value } : x))}
                    className="bg-val-darker border border-val-border text-white text-sm px-2 py-2 rounded-md focus:outline-none focus:border-val-red uppercase">
                    {REGIONS.map((rg) => <option key={rg} value={rg}>{rg.toUpperCase()}</option>)}
                  </select>
                  {rows.length > 1 && (
                    <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-val-muted hover:text-val-red"><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setRows([...rows, blankRow()])} disabled={rows.length >= 10}
                className="text-val-teal text-xs font-mono hover:underline disabled:opacity-40">+ add player</button>
              <button type="submit" disabled={saving || !teamName.trim()}
                className="ml-auto bg-val-red text-white font-display font-semibold uppercase tracking-wider text-sm px-5 py-2 rounded-md hover:brightness-110 transition disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Team'}
              </button>
            </div>
          </form>
        )}

        {loading && <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-val-border border-t-val-red rounded-full animate-spin" /></div>}
        {!loading && error && <EmptyState icon={AlertTriangle} title="Something went wrong" message={error} />}

        {!loading && !error && teams.length === 0 && !editing && (
          <EmptyState icon={Trophy} title="No teams yet"
            message="Create a team, add players by Riot ID, and view combined stats. Stats show for opted-in players (your admin account sees everyone)." />
        )}

        {/* Team list */}
        {!loading && teams.map((t) => (
          <div key={t.id} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-white text-lg">{t.name}</div>
                <div className="text-val-muted text-xs font-mono">{t.players?.length || 0} players</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => viewStats(t)} className="flex items-center gap-1.5 text-val-teal text-xs font-mono border border-val-border rounded-md px-3 py-1.5 hover:border-val-teal">
                  <BarChart3 size={13} /> Stats
                </button>
                <button onClick={() => remove(t.id)} className="text-val-muted hover:text-val-red p-1.5"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(t.players || []).map((p, i) => (
                <span key={i} className="text-xs font-mono text-val-muted bg-val-darker border border-val-border rounded px-2 py-1">
                  {p.name}<span className="opacity-60">#{p.tag}</span>
                </span>
              ))}
            </div>

            {/* Stats panel */}
            {statsFor === t.id && (
              <div className="mt-4 border-t border-val-border pt-4">
                {statsLoading && <div className="text-val-muted text-xs font-mono">Loading team stats… (fetching recent matches per player)</div>}
                {statsErr && <div className="text-val-red text-xs font-mono">{statsErr}</div>}
                {stats && (
                  <div className="space-y-4">
                    <div className="text-xs font-mono text-val-muted">
                      Stats from{' '}
                      <span className="text-val-teal font-bold">{stats.sharedMatchCount}</span>{' '}
                      {stats.sharedMatchCount === 1 ? 'match' : 'matches'} the roster played together (recent history).
                    </div>

                    {stats.sharedMatchCount === 0 ? (
                      <div className="text-val-muted text-sm">
                        No recent matches found where these players played together. Add players who queue as a team,
                        or they may need to play more games together.
                      </div>
                    ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-val-muted text-[10px] font-mono uppercase">
                            <th className="text-left py-2 px-2">Player</th>
                            <th className="text-center py-2 px-2">Together</th>
                            <th className="text-center py-2 px-2">WR</th>
                            <th className="text-center py-2 px-2">ACS</th>
                            <th className="text-center py-2 px-2">K/D</th>
                            <th className="text-center py-2 px-2">HS%</th>
                            <th className="text-left py-2 px-2">Agents</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.players.map((p, i) => (
                            <tr key={i} className="border-t border-val-border/50">
                              <td className="py-2 px-2 text-white font-display font-semibold">{p.name}<span className="text-val-muted">#{p.tag}</span></td>
                              {!p.optedIn ? (
                                <td colSpan={6} className="py-2 px-2 text-val-muted italic text-xs">Not opted in — no data</td>
                              ) : !p.sharedMatches ? (
                                <td colSpan={6} className="py-2 px-2 text-val-muted italic text-xs">No shared games in recent history</td>
                              ) : (
                                <>
                                  <td className="py-2 px-2 text-center font-mono text-white">{p.sharedMatches}</td>
                                  <td className="py-2 px-2 text-center font-mono" style={{ color: p.wr >= 50 ? '#00C8BE' : '#FF4655' }}>{p.wr}%</td>
                                  <td className="py-2 px-2 text-center font-mono text-white">{p.acs}</td>
                                  <td className="py-2 px-2 text-center font-mono text-white">{p.kd}</td>
                                  <td className="py-2 px-2 text-center font-mono text-val-muted">{p.hsPct}%</td>
                                  <td className="py-2 px-2">
                                    <div className="flex gap-1 flex-wrap">
                                      {(p.agents || []).map((a) => {
                                        const c = AGENT_COLORS[a.agent] || '#7B9BAF'
                                        return <span key={a.agent} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: c + '22', color: c }}>{a.agent}</span>
                                      })}
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    )}

                    {stats.maps?.length > 0 && (
                      <div>
                        <div className="section-label mb-2">Map Pool — games together</div>
                        <div className="space-y-1.5">
                          {stats.maps.map((mp) => (
                            <div key={mp.map} className="flex items-center gap-3 text-sm">
                              <span className="w-20 text-white">{mp.map}</span>
                              <div className="flex-1 h-1.5 bg-val-border rounded-full overflow-hidden max-w-xs">
                                <div className="h-full rounded-full" style={{ width: `${mp.wr}%`, background: mp.wr >= 50 ? '#00C8BE' : '#FF4655' }} />
                              </div>
                              <span className="font-mono text-xs text-val-muted">{mp.wins}W–{mp.losses}L · {mp.wr}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

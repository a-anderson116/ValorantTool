import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { getMatch } from '../services/api'
import { AGENT_COLORS } from '../data/mockData'

function getRegion() {
  try {
    return localStorage.getItem('vct_region') || 'na'
  } catch {
    return 'na'
  }
}

// Team colors: the signed-in player's team is teal ("your team"), the other red.
function ScoreboardTable({ players, teamId, label, color }) {
  const rows = players.filter((p) => p.team === teamId)
  return (
    <div className="stat-card overflow-x-auto">
      <div className="section-label mb-3" style={{ color }}>{label}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-val-muted text-[10px] font-mono uppercase">
            <th className="text-left py-2 px-2">Agent</th>
            <th className="text-left py-2 px-2">Player</th>
            <th className="text-left py-2 px-2">Rank</th>
            <th className="text-center py-2 px-2">ACS</th>
            <th className="text-center py-2 px-2">K/D/A</th>
            <th className="text-center py-2 px-2">ADR</th>
            <th className="text-center py-2 px-2">HS%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => {
            const c = AGENT_COLORS[p.agent] || '#7B9BAF'
            return (
              <tr key={i} className={`border-t border-val-border/50 ${p.isMe ? 'bg-val-red/10' : ''}`}>
                <td className="py-2 px-2">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ background: c + '22', color: c, border: `1px solid ${c}55` }}>
                    {p.agent}
                  </span>
                </td>
                <td className="py-2 px-2">
                  {p.name ? (
                    <span className="text-white font-display font-semibold">{p.name}</span>
                  ) : (
                    <span className="text-val-muted italic">Hidden (not opted in)</span>
                  )}
                  {p.isMe && <span className="ml-2 text-[9px] font-mono text-val-red uppercase">You</span>}
                </td>
                <td className="py-2 px-2 text-val-muted text-xs">{p.rank || '—'}</td>
                <td className="py-2 px-2 text-center font-display font-bold text-white">{p.acs}</td>
                <td className="py-2 px-2 text-center font-mono text-white">{p.kills}/{p.deaths}/{p.assists}</td>
                <td className="py-2 px-2 text-center font-mono text-val-muted">{p.adr || '—'}</td>
                <td className="py-2 px-2 text-center font-mono text-val-muted">{p.hsPct ? `${p.hsPct}%` : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getMatch(id, { region: getRegion() })
      .then((res) => active && setData(res))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  const meta = data?.meta
  const players = data?.players || []
  const rounds = data?.rounds || []
  const teams = meta?.teams || []
  // Determine the signed-in player's team for coloring.
  const myTeam = players.find((p) => p.isMe)?.team
  const orderedTeams = [...teams].sort((a) => (a.team === myTeam ? -1 : 1))

  return (
    <div>
      <Header title="Match Detail" subtitle={meta ? `${meta.map} · ${meta.mode}` : id} />

      <div className="px-6 pt-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-val-teal hover:underline">
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-val-border border-t-val-red rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <EmptyState icon={AlertTriangle} title="Couldn't load this match"
          message={`${error}. The match may be too old, from a different region, or unavailable via the API.`} />
      )}

      {!loading && !error && meta && (
        <div className="p-6 space-y-6">
          {/* Match summary */}
          <div className="stat-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-display font-bold text-white text-2xl uppercase">{meta.map}</div>
                <div className="text-val-muted text-xs font-mono">
                  {meta.mode}{meta.lengthMin ? ` · ${meta.lengthMin} min` : ''}
                  {meta.startedAt ? ` · ${String(meta.startedAt).split('T')[0]}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {orderedTeams.map((t) => (
                  <div key={t.team} className="text-center">
                    <div className={`font-display font-bold text-3xl ${t.won ? 'text-val-teal' : 'text-val-red'}`}>
                      {t.roundsWon}
                    </div>
                    <div className="text-val-muted text-[10px] font-mono uppercase">
                      {t.team === myTeam ? 'Your team' : t.team}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scoreboards */}
          {orderedTeams.map((t) => (
            <ScoreboardTable
              key={t.team}
              players={players}
              teamId={t.team}
              label={t.team === myTeam ? 'Your Team' : 'Enemy Team'}
              color={t.team === myTeam ? '#00C8BE' : '#FF4655'}
            />
          ))}

          {/* Round timeline */}
          {rounds.length > 0 && (
            <div className="stat-card overflow-x-auto">
              <div className="section-label mb-3">Rounds ({rounds.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {rounds.map((r) => {
                  const mine = r.winner === myTeam
                  return (
                    <div
                      key={r.num}
                      title={`Round ${r.num}: ${r.outcome} — ${r.winner === myTeam ? 'won' : 'lost'}`}
                      className="w-8 h-10 rounded flex flex-col items-center justify-center text-[9px] font-mono"
                      style={{
                        background: (mine ? '#00C8BE' : '#FF4655') + '22',
                        border: `1px solid ${(mine ? '#00C8BE' : '#FF4655')}66`,
                        color: mine ? '#00C8BE' : '#FF4655',
                      }}
                    >
                      <span className="font-bold">{r.num}</span>
                      <span className="opacity-70">{r.outcome.slice(0, 4)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Economy / buys per round (Riot source only) */}
          {rounds.length > 0 && rounds.some((r) => r.buys && Object.values(r.buys).some((v) => v != null)) && (
            <div className="stat-card overflow-x-auto">
              <div className="section-label mb-3">Team Economy (loadout value per round)</div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-val-muted uppercase">
                    <th className="text-left py-1.5 px-2">Round</th>
                    <th className="text-left py-1.5 px-2">Winner</th>
                    {orderedTeams.map((t) => (
                      <th key={t.team} className="text-right py-1.5 px-2">
                        {t.team === myTeam ? 'Your team' : t.team}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr key={r.num} className="border-t border-val-border/40">
                      <td className="py-1.5 px-2 text-white">{r.num}</td>
                      <td className="py-1.5 px-2" style={{ color: r.winner === myTeam ? '#00C8BE' : '#FF4655' }}>
                        {r.outcome}
                      </td>
                      {orderedTeams.map((t) => (
                        <td key={t.team} className="py-1.5 px-2 text-right text-val-muted">
                          {r.buys?.[t.team] != null ? r.buys[t.team].toLocaleString() : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

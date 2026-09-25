import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { StatCard, MiniStat } from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { useMyProfile, REGIONS } from '../hooks/useMyProfile'
import { aggregateStats, orderModes } from '../utils/stats'
import { AGENT_COLORS } from '../data/mockData'

const TABS = ['Overview', 'Matches', 'Agents', 'Maps', 'Weapons']

export default function Profile() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, region, setRegion } = useMyProfile(20)

  const gameName = session?.gameName || 'Player'
  const tagLine = session?.tagLine || ''
  const initials = (gameName || 'ME').slice(0, 2).toUpperCase()

  const allMatches = data?.matches || []
  const modes = useMemo(
    () => orderModes(Array.from(new Set(allMatches.map((m) => m.mode).filter(Boolean)))),
    [allMatches]
  )
  const [mode, setMode] = useState('Competitive')
  useEffect(() => {
    if (!modes.length) return
    if (mode !== 'all' && !modes.includes(mode)) {
      setMode(modes.includes('Competitive') ? 'Competitive' : modes[0])
    }
  }, [modes.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  const [tab, setTab] = useState('Overview')
  const matches = mode === 'all' ? allMatches : allMatches.filter((m) => m.mode === mode)
  const stats = aggregateStats(matches)

  return (
    <div>
      <Header title="Profile" subtitle={tagLine ? `${gameName}#${tagLine}` : gameName} />

      {/* Identity banner */}
      <div className="px-6 pt-5">
        <div className="stat-card flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-val-red/20 border border-val-red/40 flex items-center justify-center">
            <span className="font-display font-bold text-val-red text-xl">{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-white text-2xl leading-tight truncate">
              {gameName}<span className="text-val-muted text-lg">#{tagLine}</span>
            </div>
            <div className="text-val-muted text-xs font-mono uppercase tracking-wider mt-0.5">
              {region.toUpperCase()} · Valorant
              {data?.source && data.source !== 'none' && (
                <> · <span className="text-val-teal">{data.source}</span></>
              )}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-val-muted text-xs font-mono uppercase tracking-wider">
            Region
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-val-card border border-val-border text-white text-xs font-mono uppercase px-3 py-1.5 rounded-md focus:outline-none focus:border-val-red"
            >
              {REGIONS.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Mode pills */}
      {!loading && !error && allMatches.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {modes.map((m) => <ModePill key={m} label={m} active={mode === m} onClick={() => setMode(m)} />)}
          <ModePill label="All" active={mode === 'all'} onClick={() => setMode('all')} />
        </div>
      )}

      {/* Tab bar */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 border-b border-val-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-display font-semibold uppercase tracking-wider border-b-2 -mb-px transition ${
                tab === t ? 'text-white border-val-red' : 'text-val-muted border-transparent hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-val-border border-t-val-red rounded-full animate-spin" /></div>
      )}
      {!loading && error && (
        <EmptyState icon={AlertTriangle} title="Couldn't load your matches"
          message={`${error}. If your Riot API access is pending, or your history is private, data may be unavailable. Try another region above.`} />
      )}
      {!loading && !error && allMatches.length === 0 && (
        <EmptyState icon={LayoutDashboard} title="No recent matches found"
          message={`No recent matches for ${gameName}#${tagLine} in ${region.toUpperCase()}. Switch region above if you play elsewhere.`} />
      )}
      {!loading && !error && allMatches.length > 0 && matches.length === 0 && (
        <EmptyState icon={LayoutDashboard} title={`No ${mode} matches`}
          message={`No ${mode} matches in your last ${allMatches.length}. Pick another mode above.`} />
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="p-6">
          {tab === 'Overview' && <Overview stats={stats} matches={matches} mode={mode} navigate={navigate} />}
          {tab === 'Matches' && <MatchesTab matches={matches} navigate={navigate} />}
          {tab === 'Agents' && <AgentsTab stats={stats} />}
          {tab === 'Maps' && <MapsTab stats={stats} />}
          {tab === 'Weapons' && <WeaponsTab stats={stats} />}
        </div>
      )}
    </div>
  )
}

/* ---------- Tabs ---------- */

function Overview({ stats, matches, mode, navigate }) {
  return (
    <div className="space-y-6">
      <div className="text-val-muted text-xs font-mono uppercase tracking-wider">
        {mode === 'all' ? 'All modes' : mode} · {stats.matchCount} matches
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Matches" value={stats.matchCount} />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} accent={stats.winRate >= 50} />
        <StatCard label="Avg ACS" value={stats.acs} />
        <StatCard label="K/D" value={stats.kd} accent={parseFloat(stats.kd) >= 1} />
        <StatCard label="Avg ADR" value={stats.adr} />
        <StatCard label="HS%" value={`${stats.hsPct}%`} />
      </div>

      {stats.combat?.hasData && (
        <div className="stat-card">
          <div className="section-label mb-3">Combat</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <MiniStat label="First Bloods" value={stats.combat.fk} />
            <MiniStat label="First Deaths" value={stats.combat.fd} />
            <MiniStat label="FK / FD" value={stats.combat.fkfd} color={parseFloat(stats.combat.fkfd) >= 1 ? 'text-val-teal' : 'text-val-red'} />
            <MiniStat label="Aces" value={stats.combat.aces} color="text-val-gold" />
            <MiniStat label="4K" value={stats.combat.k4} />
            <MiniStat label="3K / 2K" value={`${stats.combat.k3} / ${stats.combat.k2}`} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="section-label mb-3">Top Agents</div>
          <div className="space-y-2">
            {stats.agents.slice(0, 5).map((a) => {
              const c = AGENT_COLORS[a.agent] || '#7B9BAF'
              return (
                <div key={a.agent} className="flex items-center gap-3 text-sm">
                  <span className="w-16 font-mono px-1.5 py-0.5 rounded text-xs" style={{ background: c + '22', color: c }}>{a.agent}</span>
                  <span className="text-val-muted text-xs w-14">{a.matches}m · {a.wr}%</span>
                  <div className="flex-1 h-1.5 bg-val-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${a.wr}%`, background: a.wr >= 50 ? '#00C8BE' : '#FF4655' }} />
                  </div>
                  <span className="font-mono text-xs text-white w-16 text-right">{a.kd} KD · {a.acs}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="stat-card">
          <div className="section-label mb-3">Best Maps</div>
          <div className="space-y-2">
            {stats.maps.slice(0, 5).map((mp) => (
              <div key={mp.map} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-white">{mp.map}</span>
                <span className="text-val-muted text-xs w-16">{mp.wins}W–{mp.losses}L</span>
                <div className="flex-1 h-1.5 bg-val-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${mp.wr}%`, background: mp.wr >= 50 ? '#00C8BE' : '#FF4655' }} />
                </div>
                <span className="font-mono text-xs text-white w-10 text-right">{mp.wr}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MatchTable matches={matches.slice(0, 6)} navigate={navigate} title="Recent Matches" />
    </div>
  )
}

function MatchesTab({ matches, navigate }) {
  return <MatchTable matches={matches} navigate={navigate} title={`Match History (${matches.length})`} full />
}

function MatchTable({ matches, navigate, title, full }) {
  return (
    <div className="stat-card overflow-x-auto">
      <div className="section-label mb-3">{title}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-val-muted text-[10px] font-mono uppercase">
            <th className="text-left py-2 px-2">Result</th>
            <th className="text-left py-2 px-2">Map</th>
            {full && <th className="text-left py-2 px-2">Mode</th>}
            <th className="text-left py-2 px-2">Agent</th>
            <th className="text-center py-2 px-2">K / D / A</th>
            <th className="text-center py-2 px-2">ACS</th>
            <th className="text-center py-2 px-2">ADR</th>
            <th className="text-center py-2 px-2">HS%</th>
            {full && <th className="text-center py-2 px-2">Date</th>}
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.id} onClick={() => navigate(`/matches/${m.id}`)} className="border-t border-val-border/50 hover:bg-val-card/60 cursor-pointer">
              <td className="py-2 px-2"><span className={`font-display font-bold ${m.won ? 'text-val-teal' : 'text-val-red'}`}>{m.won ? 'W' : 'L'}</span></td>
              <td className="py-2 px-2 text-white">{m.map || '—'}</td>
              {full && <td className="py-2 px-2 text-val-muted">{m.mode || '—'}</td>}
              <td className="py-2 px-2 text-val-muted">{m.agent || '—'}</td>
              <td className="py-2 px-2 text-center font-mono text-white">{m.kills} / {m.deaths} / {m.assists}</td>
              <td className="py-2 px-2 text-center font-mono text-white">{m.acs}</td>
              <td className="py-2 px-2 text-center font-mono text-val-muted">{m.adr || '—'}</td>
              <td className="py-2 px-2 text-center font-mono text-val-muted">{m.hsPct ? `${m.hsPct}%` : '—'}</td>
              {full && <td className="py-2 px-2 text-center font-mono text-val-muted text-xs">{m.startedAt ? String(m.startedAt).split('T')[0] : '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AgentsTab({ stats }) {
  return (
    <div className="stat-card overflow-x-auto">
      <div className="section-label mb-3">Agents ({stats.agents.length})</div>
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
                <td className="py-2 px-2"><span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: c + '22', color: c, border: `1px solid ${c}55` }}>{a.agent}</span></td>
                <td className="py-2 px-2 text-center font-mono text-white">{a.matches}</td>
                <td className="py-2 px-2 text-center font-mono" style={{ color: a.wr >= 50 ? '#00C8BE' : '#FF4655' }}>{a.wr}%</td>
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
  )
}

function MapsTab({ stats }) {
  return (
    <div className="stat-card overflow-x-auto">
      <div className="section-label mb-3">Maps ({stats.maps.length})</div>
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
                    <div className="h-full rounded-full" style={{ width: `${mp.wr}%`, background: mp.wr >= 50 ? '#00C8BE' : '#FF4655' }} />
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
  )
}

function WeaponsTab({ stats }) {
  if (!stats.weapons.length) {
    return <div className="stat-card text-val-muted text-sm">No weapon data available for this selection.</div>
  }
  return (
    <div className="stat-card">
      <div className="section-label mb-3">Weapon Kills</div>
      <div className="space-y-2">
        {stats.weapons.map((w) => (
          <div key={w.name} className="flex items-center gap-3 text-sm">
            <span className="w-28 text-white truncate" title={w.name}>{w.name}</span>
            <div className="flex-1 h-2 bg-val-border rounded-full overflow-hidden max-w-2xl">
              <div className="h-full rounded-full bg-val-red" style={{ width: `${w.pct}%` }} />
            </div>
            <span className="font-mono text-xs text-val-muted w-24 text-right">{w.kills} · {w.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModePill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-display font-semibold uppercase tracking-wider transition ${
        active ? 'bg-val-red text-white' : 'bg-val-card border border-val-border text-val-muted hover:text-white'
      }`}>
      {label}
    </button>
  )
}

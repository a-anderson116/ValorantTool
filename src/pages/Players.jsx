import { useState } from 'react'
import { Users, Search, Lock, CheckCircle2, XCircle } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import ProfileView from '../components/ProfileView'
import { useAuth } from '../context/AuthContext'
import { searchPlayer } from '../services/api'
import { REGIONS } from '../hooks/useMyProfile'

export default function Players() {
  const { isAdmin } = useAuth()
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [region, setRegion] = useState('na')
  const [query, setQuery] = useState(null) // { name, tag, region } of the active search
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    setQuery({ name: name.trim(), tag: tag.trim().replace(/^#/, ''), region })
    setLoading(true)
    setError(null)
    setData(null)
    searchPlayer({ name: name.trim(), tag: tag.trim(), region })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const optedIn = data?.profile?.optedIn
  const badge = data && (
    optedIn ? (
      <span className="flex items-center gap-1 text-val-teal text-xs font-mono" title="Opted in via Riot Sign On">
        <CheckCircle2 size={15} /> Opted in
      </span>
    ) : (
      <span className="flex items-center gap-1 text-val-red text-xs font-mono" title="Not opted in">
        <XCircle size={15} /> Not opted in
      </span>
    )
  )

  return (
    <div>
      <Header title="Player Search" subtitle="Admin lookup" />

      <div className="px-6 pt-5">
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
      </div>

      {query && (
        <ProfileView
          gameName={data?.profile?.gameName || query.name}
          tagLine={data?.profile?.tagLine || query.tag}
          region={data?.profile?.region || query.region}
          source={data?.source}
          rank={data?.rank}
          matches={data?.matches || []}
          loading={loading}
          error={error}
          badge={badge}
          notFoundName={`${query.name}#${query.tag}`}
        />
      )}
    </div>
  )
}

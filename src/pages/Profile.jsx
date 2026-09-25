import Header from '../components/Header'
import ProfileView from '../components/ProfileView'
import { useAuth } from '../context/AuthContext'
import { useMyProfile, REGIONS } from '../hooks/useMyProfile'

export default function Profile() {
  const { session } = useAuth()
  const { data, loading, error, region, setRegion } = useMyProfile(40)

  const regionSelector = (
    <div className="flex items-center gap-2 text-val-muted text-xs font-mono uppercase tracking-wider">
      Region
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="bg-val-card border border-val-border text-white text-xs font-mono uppercase px-3 py-1.5 rounded-md focus:outline-none focus:border-val-red"
      >
        {REGIONS.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
      </select>
    </div>
  )

  return (
    <div>
      <Header title="Profile" subtitle={session?.tagLine ? `${session.gameName}#${session.tagLine}` : session?.gameName} />
      <ProfileView
        gameName={session?.gameName || 'Player'}
        tagLine={session?.tagLine || ''}
        region={region}
        source={data?.source}
        rank={data?.rank}
        matches={data?.matches || []}
        loading={loading}
        error={error}
        headerRight={regionSelector}
      />
    </div>
  )
}

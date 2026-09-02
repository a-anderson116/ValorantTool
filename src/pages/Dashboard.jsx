import { LayoutDashboard } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { session } = useAuth()
  const riotId = session?.gameName ? `${session.gameName}#${session.tagLine}` : 'your account'

  return (
    <div>
      <Header title="Dashboard" subtitle={`Signed in as ${riotId}`} />
      <EmptyState
        icon={LayoutDashboard}
        title="No match data yet"
        message="Your dashboard populates from your own VALORANT matches once a live data source is connected. Only players who have signed in and opted in via Riot Sign On appear anywhere in VCT Scout."
      />
    </div>
  )
}

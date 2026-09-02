import { Search } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

export default function Scout() {
  return (
    <div>
      <Header title="Scout" subtitle="Opponent scouting reports" />
      <EmptyState
        icon={Search}
        title="Scouting requires opted-in players"
        message="Scouting reports can only be generated for players who have opted in via Riot Sign On. This protects players who have not consented to having their data shown. Reports become available once the players you want to scout have opted in."
      />
    </div>
  )
}

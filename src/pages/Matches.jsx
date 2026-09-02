import { Swords } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

export default function Matches() {
  return (
    <div>
      <Header title="Matches" subtitle="Imported and recent matches" />
      <EmptyState
        icon={Swords}
        title="No matches yet"
        message="Matches for opted-in players will appear here once a live data source is connected. Data is never shown for players who have not opted in via Riot Sign On."
      />
    </div>
  )
}

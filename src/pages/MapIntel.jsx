import { Map } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

export default function MapIntel() {
  return (
    <div>
      <Header title="Map Intel" subtitle="Map pool & win rates" />
      <EmptyState
        icon={Map}
        title="No map data yet"
        message="Map win rates and comparisons are computed from the matches of opted-in players. Connect a data source and have players opt in to populate this view."
      />
    </div>
  )
}

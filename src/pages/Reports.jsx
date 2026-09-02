import { FileText } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

export default function Reports() {
  return (
    <div>
      <Header title="Reports" subtitle="Saved scouting reports" />
      <EmptyState
        icon={FileText}
        title="No reports yet"
        message="Scouting reports you generate for opted-in players will be saved here for export. Generate one from the Scout tab once players have opted in."
      />
    </div>
  )
}

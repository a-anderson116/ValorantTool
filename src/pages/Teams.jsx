import { Trophy } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

export default function Teams() {
  return (
    <div>
      <Header title="Teams" subtitle="Collegiate programs" />
      <EmptyState
        icon={Trophy}
        title="No teams yet"
        message="Teams are built from rosters of opted-in players. Once players sign in and opt in via Riot Sign On, their teams appear here."
      />
    </div>
  )
}

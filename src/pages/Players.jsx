import { Users } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

export default function Players() {
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

import { useParams, useNavigate } from 'react-router-dom'
import { Swords, ArrowLeft } from 'lucide-react'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

export default function MatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <Header title="Match Detail" subtitle={id ? `Match ${id}` : 'Match'} />
      <EmptyState
        icon={Swords}
        title="Match data unavailable"
        message="Detailed match breakdowns load from a live data source for opted-in players only. Connect a data source to view this match."
        action={
          <button
            onClick={() => navigate('/matches')}
            className="inline-flex items-center gap-2 text-sm text-val-teal hover:underline"
          >
            <ArrowLeft size={14} /> Back to matches
          </button>
        }
      />
    </div>
  )
}

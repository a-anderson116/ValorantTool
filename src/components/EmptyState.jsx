import { Inbox } from 'lucide-react'

/**
 * Shown wherever there is no opted-in player data to display yet. Replaces the
 * old fabricated mock data — the app renders real data only once players have
 * signed in and opted in via RSO (and a live data source is connected).
 */
export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-14 h-14 rounded-lg bg-val-card border border-val-border flex items-center justify-center mb-4">
        <Icon size={24} className="text-val-muted" />
      </div>
      <h3 className="font-display font-bold text-white text-lg uppercase tracking-wide mb-2">{title}</h3>
      <p className="text-val-muted text-sm max-w-md leading-relaxed">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

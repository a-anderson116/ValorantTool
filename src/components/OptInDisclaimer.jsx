import { ShieldCheck } from 'lucide-react'

/**
 * Riot RSO opt-in compliance notice.
 *
 * Riot's developer policy requires a VISIBLE disclaimer stating that player
 * stats/gameplay data are only shown for players who have opted in via Riot
 * Sign On (RSO). This bar renders on every page as a persistent footer.
 */
export default function OptInDisclaimer() {
  return (
    <footer className="border-t border-val-border bg-val-darker/90 px-6 py-3">
      <div className="flex items-start gap-2.5 max-w-5xl">
        <ShieldCheck size={14} className="text-val-teal flex-shrink-0 mt-0.5" />
        <p className="text-val-muted text-[11px] leading-relaxed font-body">
          <span className="text-val-teal font-semibold">Opt-in required.</span>{' '}
          VCT Scout only displays VALORANT stats and gameplay data for players who
          have signed in and opted in through Riot Sign On (RSO). Players who have
          not opted in will not have their data shown to others through this site,
          its applications, or any overlay.{' '}
          <a href="/privacy" className="text-val-teal hover:underline">Privacy Policy</a>
          {' · '}
          <a href="/terms" className="text-val-teal hover:underline">Terms</a>
          <span className="block mt-1 text-val-muted/70">
            VCT Scout isn't endorsed by Riot Games and doesn't reflect the views of
            Riot Games or anyone officially involved in producing or managing Riot
            Games properties. VALORANT and Riot Games are trademarks of Riot Games, Inc.
          </span>
        </p>
      </div>
    </footer>
  )
}

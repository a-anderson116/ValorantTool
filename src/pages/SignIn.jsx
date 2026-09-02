import { ShieldCheck, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isConfigured, setSession } from '../services/auth'

export default function SignIn() {
  const { login } = useAuth()
  const configured = isConfigured()

  // Dev-only preview bypass. Stripped from production builds (import.meta.env.DEV
  // is false in `vite build`), so it can never grant access to the deployed app.
  function devPreview() {
    setSession({ session: 'dev-preview', puuid: 'dev', gameName: 'DevPreview', tagLine: 'DEV' })
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-val-darker flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-val-red rounded flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">VCT</span>
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-tight">VCT SCOUT</div>
            <div className="text-val-muted text-[10px] font-mono tracking-widest uppercase">Collegiate Tool</div>
          </div>
        </div>

        <div className="bg-val-card border border-val-border rounded-xl p-8 text-center">
          <h1 className="font-display font-bold text-white text-2xl uppercase tracking-wide mb-2">Sign in to continue</h1>
          <p className="text-val-muted text-sm leading-relaxed mb-6">
            VCT Scout uses Riot Sign On. Your VALORANT stats are only displayed after
            you sign in and opt in — nothing is shown for players who haven't.
          </p>

          <button
            onClick={login}
            disabled={!configured}
            className="w-full flex items-center justify-center gap-2 bg-val-red text-white font-display font-semibold uppercase tracking-wider text-sm py-3 rounded-md hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogIn size={16} />
            Sign in with Riot
          </button>

          {!configured && (
            <p className="text-val-gold text-xs font-mono mt-4 leading-relaxed">
              RSO not configured yet. Set <span className="text-white">VITE_RSO_CLIENT_ID</span> (and the
              backend secret) once your Riot application is approved.
            </p>
          )}

          {import.meta.env.DEV && (
            <button
              onClick={devPreview}
              className="w-full mt-3 text-val-muted hover:text-white text-xs font-mono py-2 border border-dashed border-val-border rounded-md transition"
            >
              Continue without Riot (dev preview only)
            </button>
          )}

          <div className="flex items-start gap-2 mt-6 pt-6 border-t border-val-border text-left">
            <ShieldCheck size={14} className="text-val-teal flex-shrink-0 mt-0.5" />
            <p className="text-val-muted text-[11px] leading-relaxed">
              By signing in you consent to VCT Scout displaying your VALORANT match and
              statistics data for scouting purposes. You can withdraw consent anytime by
              logging out and revoking access in your Riot account settings.
            </p>
          </div>
        </div>

        <p className="text-center text-val-muted text-[11px] mt-6">
          <a href="/privacy" className="text-val-teal hover:underline">Privacy Policy</a>
          {' · '}
          <a href="/terms" className="text-val-teal hover:underline">Terms of Service</a>
        </p>
        <p className="text-center text-val-muted/60 text-[10px] mt-3 leading-relaxed max-w-sm mx-auto">
          VCT Scout isn't endorsed by Riot Games and doesn't reflect the views of Riot Games.
          VALORANT and Riot Games are trademarks of Riot Games, Inc.
        </p>
      </div>
    </div>
  )
}

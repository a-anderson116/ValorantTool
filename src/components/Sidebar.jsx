import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Swords, Map, FileText, Search, Trophy, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/matches', icon: Swords, label: 'Matches' },
  { to: '/teams', icon: Trophy, label: 'Teams' },
  { to: '/players', icon: Users, label: 'Players' },
  { to: '/maps', icon: Map, label: 'Map Intel' },
  { to: '/scout', icon: Search, label: 'Scout' },
  { to: '/reports', icon: FileText, label: 'Reports' },
]

export default function Sidebar() {
  const { session, logout } = useAuth()
  const riotId = session?.gameName ? `${session.gameName}#${session.tagLine}` : 'Signed in'

  return (
    <aside className="w-16 lg:w-56 h-screen bg-val-darker border-r border-val-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center justify-center px-3 py-4 border-b border-val-border">
        <img src="/logo.png" alt="VCT — Valorant Collegiate Tool" className="w-9 lg:w-36 h-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group ${
                isActive
                  ? 'bg-val-red/15 text-val-red border border-val-red/30'
                  : 'text-val-muted hover:text-white hover:bg-val-card'
              }`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="hidden lg:block font-display font-semibold text-sm uppercase tracking-wider">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Signed-in player + logout */}
      <div className="p-3 border-t border-val-border">
        <div className="hidden lg:block mb-2 px-1">
          <div className="text-val-muted text-[10px] font-mono uppercase tracking-widest mb-0.5">Signed in</div>
          <div className="font-display font-semibold text-white text-sm truncate" title={riotId}>{riotId}</div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-val-muted hover:text-white hover:bg-val-card transition-all"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span className="hidden lg:block font-display font-semibold text-sm uppercase tracking-wider">Sign out</span>
        </button>
      </div>
    </aside>
  )
}

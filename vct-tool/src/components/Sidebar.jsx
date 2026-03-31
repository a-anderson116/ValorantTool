import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Swords, Map, FileText, Search, Settings, Trophy } from 'lucide-react'

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
  return (
    <aside className="w-16 lg:w-56 h-screen bg-val-darker border-r border-val-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start px-4 border-b border-val-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-val-red rounded flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-white text-xs">VCT</span>
          </div>
          <div className="hidden lg:block">
            <div className="font-display font-bold text-white text-sm leading-tight">VCT SCOUT</div>
            <div className="text-val-muted text-[10px] font-mono tracking-widest">COLLEGIATE TOOL</div>
          </div>
        </div>
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

      {/* Season badge */}
      <div className="p-4 border-t border-val-border hidden lg:block">
        <div className="text-val-muted text-[10px] font-mono uppercase tracking-widest mb-1">Season</div>
        <div className="font-display font-bold text-white text-sm">Spring 2026</div>
        <div className="text-val-muted text-xs mt-1">CCPL — Week 8</div>
      </div>
    </aside>
  )
}

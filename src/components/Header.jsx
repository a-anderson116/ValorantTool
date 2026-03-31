import { Bell, Search } from 'lucide-react'

export default function Header({ title, subtitle }) {
  return (
    <header className="h-16 border-b border-val-border flex items-center justify-between px-6 bg-val-darker/80 backdrop-blur sticky top-0 z-20">
      <div>
        <h1 className="text-white text-lg font-display font-bold uppercase tracking-wider leading-tight">{title}</h1>
        {subtitle && <p className="text-val-muted text-xs font-mono">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-val-muted" />
          <input
            type="text"
            placeholder="Search players, teams..."
            className="bg-val-card border border-val-border text-white text-sm pl-9 pr-4 py-2 rounded-md w-52 focus:outline-none focus:border-val-red transition-colors placeholder:text-val-muted/50 font-body"
          />
        </div>
        <button className="w-9 h-9 rounded-md border border-val-border flex items-center justify-center text-val-muted hover:text-white hover:border-val-red transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-val-red rounded-full"></span>
        </button>
        <div className="w-9 h-9 rounded-md bg-val-red/20 border border-val-red/40 flex items-center justify-center">
          <span className="font-display font-bold text-val-red text-xs">SFU</span>
        </div>
      </div>
    </header>
  )
}

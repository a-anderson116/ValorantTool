export function StatCard({ label, value, sub, accent, trend }) {
  return (
    <div className="stat-card">
      <div className="section-label">{label}</div>
      <div className={`font-display font-bold text-2xl ${accent ? 'text-val-red' : 'text-white'}`}>
        {value}
      </div>
      {sub && <div className="text-val-muted text-xs mt-0.5">{sub}</div>}
      {trend !== undefined && (
        <div className={`text-xs font-mono mt-1 ${trend >= 0 ? 'text-val-teal' : 'text-val-red'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

export function MiniStat({ label, value, color = 'text-white' }) {
  return (
    <div className="text-center">
      <div className={`font-display font-bold text-lg ${color}`}>{value}</div>
      <div className="text-val-muted text-[10px] font-mono uppercase tracking-wider">{label}</div>
    </div>
  )
}

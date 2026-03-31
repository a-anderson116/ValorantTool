import { AGENT_COLORS, ROLE_COLORS } from '../data/mockData'

export default function PlayerRow({ player, rank }) {
  const agentColor = AGENT_COLORS[player.agent] || '#7B9BAF'
  const roleColor = ROLE_COLORS[player.role] || '#7B9BAF'

  return (
    <tr className="border-b border-val-border/50 hover:bg-val-card/50 transition-colors group">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-val-muted text-xs font-mono w-4">#{rank}</span>
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-display font-bold flex-shrink-0"
            style={{ background: agentColor + '30', color: agentColor, border: `1px solid ${agentColor}50` }}
          >
            {player.agent?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-display font-semibold text-sm leading-tight">
              {player.name}
              <span className="text-val-muted font-body font-normal text-xs ml-1">#{player.tag}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-[9px] font-mono uppercase px-1.5 py-0 rounded"
                style={{ background: roleColor + '25', color: roleColor }}
              >
                {player.role}
              </span>
              <span className="text-val-muted text-[10px] font-mono">{player.agent}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="font-display font-bold text-white text-base">{player.acs}</span>
      </td>
      <td className="py-3 px-4 text-center font-mono text-sm text-white">
        {player.kd >= 1 ? (
          <span className="text-val-teal">{player.kd}</span>
        ) : (
          <span className="text-val-muted">{player.kd}</span>
        )}
      </td>
      <td className="py-3 px-4 text-center font-mono text-sm text-val-muted">{player.adr}</td>
      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <div className="w-16 h-1.5 bg-val-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(player.hs, 100)}%`, background: player.hs > 35 ? '#FF4655' : player.hs > 20 ? '#FFD700' : '#00C8BE' }}
            />
          </div>
          <span className="text-xs font-mono text-val-muted">{player.hs}%</span>
        </div>
      </td>
      <td className="py-3 px-4 text-center font-mono text-sm">
        <span className={player.kast >= 70 ? 'text-val-teal' : player.kast >= 55 ? 'text-val-gold' : 'text-val-red'}>
          {player.kast}%
        </span>
      </td>
      <td className="py-3 px-4 text-center font-mono text-sm text-white">{player.fk}</td>
      <td className="py-3 px-4 text-center font-mono text-sm text-val-muted">{player.fd}</td>
      <td className="py-3 px-4 text-center">
        <span
          className="font-display font-bold text-sm"
          style={{ color: player.rating >= 7 ? '#FF4655' : player.rating >= 5 ? '#FFD700' : '#7B9BAF' }}
        >
          {player.rating}
        </span>
      </td>
    </tr>
  )
}

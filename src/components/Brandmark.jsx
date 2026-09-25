import { BRAND } from '../config/brand'

/** The "TE" square mark on its own. */
export function Mark({ className = 'w-8 h-8', textClass = 'text-xs' }) {
  return (
    <div className={`${className} bg-val-red rounded flex items-center justify-center flex-shrink-0`}>
      <span className={`font-display font-bold text-white ${textClass}`}>{BRAND.mark}</span>
    </div>
  )
}

/** Mark + stacked wordmark (Trine Esports / Performance Analytics). */
export default function Brandmark({ markClass = 'w-8 h-8', markText = 'text-xs', className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Mark className={markClass} textClass={markText} />
      <div>
        <div className="font-display font-bold text-white text-sm leading-tight tracking-wide">{BRAND.wordmarkTop}</div>
        <div className="text-val-muted text-[10px] font-mono tracking-widest uppercase">{BRAND.wordmarkBottom}</div>
      </div>
    </div>
  )
}

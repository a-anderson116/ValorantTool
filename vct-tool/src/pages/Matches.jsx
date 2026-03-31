import { Link } from 'react-router-dom'
import { useState } from 'react'
import { ExternalLink, Plus } from 'lucide-react'
import Header from '../components/Header'
import { MOCK_MATCHES } from '../data/mockData'
import { fetchMatchByID, transformHenrikMatch } from '../services/api'

export default function Matches() {
  const [matchIdInput, setMatchIdInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matches, setMatches] = useState(MOCK_MATCHES)

  async function handleImport(e) {
    e.preventDefault()
    if (!matchIdInput.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data } = await fetchMatchByID(matchIdInput.trim())
      if (data) {
        const transformed = transformHenrikMatch(data)
        setMatches(prev => [transformed, ...prev])
        setMatchIdInput('')
      } else {
        setError('Match not found or API unavailable. Using mock data for demo.')
      }
    } catch (e) {
      setError('Failed to fetch match.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <Header title="Match History" subtitle="Custom & tournament games" />
      <div className="p-6 space-y-6">

        {/* Import form */}
        <div className="card p-5">
          <h3 className="text-white font-display text-base mb-3 flex items-center gap-2">
            <Plus size={14} className="text-val-red" /> Import Match
          </h3>
          <form onSubmit={handleImport} className="flex gap-3">
            <input
              type="text"
              value={matchIdInput}
              onChange={e => setMatchIdInput(e.target.value)}
              placeholder="Paste tracker.gg match URL or Riot Match ID..."
              className="flex-1 bg-val-darker border border-val-border text-white text-sm px-4 py-2.5 rounded-md focus:outline-none focus:border-val-red transition-colors placeholder:text-val-muted/50 font-mono"
            />
            <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
              {loading ? 'Fetching...' : 'Import Match'}
            </button>
          </form>
          {error && <p className="text-val-red text-xs font-mono mt-2">{error}</p>}
          <p className="text-val-muted text-xs font-mono mt-2">
            Supports: tracker.gg/valorant/match/[id] or raw Riot match UUID
          </p>
        </div>

        {/* Match list */}
        <div className="space-y-3">
          {matches.map(m => {
            const sfuIsA = m.teamA?.id === 'sfu-esports'
            const myScore = sfuIsA ? m.teamA?.score : m.teamB?.score
            const oppScore = sfuIsA ? m.teamB?.score : m.teamA?.score
            const opp = sfuIsA ? m.teamB?.name : m.teamA?.name
            const isWin = m.winner === 'sfu-esports'
            const roundCount = m.rounds?.length || (myScore + oppScore)

            return (
              <Link
                key={m.id}
                to={`/matches/${m.id}`}
                className="card p-5 flex items-center justify-between hover:border-val-red/50 transition-all group block"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-1 h-12 rounded-full flex-shrink-0 ${isWin ? 'bg-val-teal' : 'bg-val-red'}`} />
                  <div>
                    <div className="text-white font-display font-bold text-base">vs {opp}</div>
                    <div className="text-val-muted text-xs font-mono mt-0.5">
                      {m.map} · {m.mode} · {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center hidden sm:block">
                    <div className="text-val-muted text-[10px] font-mono uppercase tracking-wider">Rounds</div>
                    <div className="text-white font-mono text-sm">{roundCount}</div>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-val-muted text-[10px] font-mono uppercase tracking-wider">Duration</div>
                    <div className="text-white font-mono text-sm">{m.duration}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-val-muted text-[10px] font-mono uppercase tracking-wider mb-1">Score</div>
                    <div className="font-display font-bold text-xl">
                      <span className={isWin ? 'text-val-teal' : 'text-white'}>{myScore}</span>
                      <span className="text-val-muted mx-1">–</span>
                      <span className={!isWin ? 'text-val-red' : 'text-white'}>{oppScore}</span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-val-muted group-hover:text-val-red transition-colors hidden sm:block" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

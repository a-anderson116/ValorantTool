import { createContext, useContext, useEffect, useState } from 'react'
import { getSession, login, logout, exchangeCodeIfPresent } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession())
  const [loading, setLoading] = useState(true)

  // On load: if the RSO callback left a code, exchange it for a session.
  useEffect(() => {
    let active = true
    ;(async () => {
      const exchanged = await exchangeCodeIfPresent()
      if (!active) return
      if (exchanged) setSessionState(exchanged)
      else setSessionState(getSession())
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [])

  // Re-read the session if another tab updates it.
  useEffect(() => {
    const sync = () => setSessionState(getSession())
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const value = {
    session,
    loading,
    isAuthenticated: Boolean(session?.session),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

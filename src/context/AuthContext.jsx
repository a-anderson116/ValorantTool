import { createContext, useContext, useEffect, useState } from 'react'
import { getSession, login as startLogin, logout, exchangeCodeIfPresent, fetchRsoConfig } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession())
  const [loading, setLoading] = useState(true)
  const [rsoConfig, setRsoConfig] = useState(null)

  // On load: fetch RSO config and, if the callback left a code, exchange it.
  useEffect(() => {
    let active = true
    ;(async () => {
      const [config, exchanged] = await Promise.all([fetchRsoConfig(), exchangeCodeIfPresent()])
      if (!active) return
      setRsoConfig(config)
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
    rsoConfig,
    configured: Boolean(rsoConfig?.configured),
    login: () => startLogin(rsoConfig),
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

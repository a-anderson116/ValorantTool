import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import OptInDisclaimer from './components/OptInDisclaimer'
import SignIn from './pages/SignIn'
import Profile from './pages/Profile'
import MatchDetail from './pages/MatchDetail'
import Teams from './pages/Teams'
import Players from './pages/Players'

function AppShell() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-val-darker flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-val-border border-t-val-red rounded-full animate-spin" />
      </div>
    )
  }

  // Opt-in gate: no player data is rendered until the user signs in with RSO.
  if (!isAuthenticated) return <SignIn />

  return (
    <div className="flex min-h-screen bg-val-darker">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-56 min-h-screen bg-val-darker overflow-x-hidden flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
          </Routes>
        </div>
        <OptInDisclaimer />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}

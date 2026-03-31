import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Teams from './pages/Teams'
import Players from './pages/Players'
import MapIntel from './pages/MapIntel'
import Scout from './pages/Scout'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-val-darker">
        <Sidebar />
        <main className="flex-1 ml-16 lg:ml-56 min-h-screen bg-val-darker overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
            <Route path="/maps" element={<MapIntel />} />
            <Route path="/scout" element={<Scout />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

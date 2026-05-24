import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import BillsPage from './pages/BillsPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/bills" element={<BillsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/bills" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

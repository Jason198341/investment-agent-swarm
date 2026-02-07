import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'

const Board = lazy(() => import('@/pages/Board'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Chart = lazy(() => import('@/pages/Chart'))
const Trading = lazy(() => import('@/pages/Trading'))
const Watchlist = lazy(() => import('@/pages/Watchlist'))
const Briefing = lazy(() => import('@/pages/Briefing'))
const CrossMarket = lazy(() => import('@/pages/CrossMarket'))

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-primary-400 text-lg">Loading...</div>
    </div>
  )
}

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<Board />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/chart/:ticker" element={<Chart />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/briefing" element={<Briefing />} />
          <Route path="/cross-market" element={<CrossMarket />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}

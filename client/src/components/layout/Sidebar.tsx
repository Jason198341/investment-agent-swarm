import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'

const NAV_ITEMS = [
  { to: '/board',        icon: '🤖', key: 'nav.board' },
  { to: '/dashboard',    icon: '📊', key: 'nav.dashboard' },
  { to: '/chart',        icon: '📈', key: 'nav.chart' },
  { to: '/trading',      icon: '💰', key: 'nav.trading' },
  { to: '/watchlist',    icon: '👀', key: 'nav.watchlist' },
  { to: '/briefing',     icon: '🎙️', key: 'nav.briefing' },
  { to: '/cross-market', icon: '🌏', key: 'nav.crossMarket' },
]

export default function Sidebar() {
  const { sidebarOpen, t } = useUIStore()

  return (
    <aside
      className={`flex flex-col bg-surface-light border-r border-surface-border transition-all duration-200 ${
        sidebarOpen ? 'w-56' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-surface-border shrink-0">
        <span className="text-xl">🐝</span>
        {sidebarOpen && (
          <span className="text-sm font-bold text-primary-400 truncate">IAS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-primary-400 bg-primary-500/10 border-r-2 border-primary-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <span className="text-base shrink-0">{icon}</span>
            {sidebarOpen && <span className="truncate">{t(key)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-surface-border">
          <span className="text-[10px] text-slate-600">IAS v1.0.0</span>
        </div>
      )}
    </aside>
  )
}

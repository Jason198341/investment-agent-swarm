import { useUIStore } from '@/stores/uiStore'

export default function TopBar() {
  const { lang, setLang, toggleSidebar, t } = useUIStore()

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-surface-border bg-surface-light shrink-0">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <h1 className="text-sm font-semibold text-slate-200">{t('app.title')}</h1>
      </div>

      {/* Right: lang toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
          className="px-2.5 py-1 text-xs rounded-md bg-surface-lighter text-slate-400 hover:text-white transition-colors border border-surface-border"
        >
          {lang === 'ko' ? 'EN' : 'KO'}
        </button>
      </div>
    </header>
  )
}

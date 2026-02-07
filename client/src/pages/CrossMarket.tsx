import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { SUPPLY_CHAIN_LINKS, SECTORS, findRelatedKr, findRelatedUs } from '@/data/sector-mappings'

export default function CrossMarket() {
  const { t } = useUIStore()
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [searchTicker, setSearchTicker] = useState('')

  const filteredLinks = selectedSector === 'all'
    ? SUPPLY_CHAIN_LINKS
    : SUPPLY_CHAIN_LINKS.filter((l) => l.sector === selectedSector)

  const searchResults = searchTicker.trim()
    ? [...findRelatedKr(searchTicker.trim()), ...findRelatedUs(searchTicker.trim())]
    : []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h2 className="text-lg font-bold text-slate-100">{t('crossMarket.title')}</h2>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchTicker}
          onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
          placeholder="Search ticker (e.g., NVDA, 005930)"
          className="px-3 py-1.5 text-sm rounded-lg bg-surface border border-surface-border text-white placeholder:text-slate-600 w-64"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSector('all')}
            className={`px-2.5 py-1 text-xs rounded-md ${
              selectedSector === 'all' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white bg-surface-lighter'
            }`}
          >
            All
          </button>
          {SECTORS.map((sector) => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-2.5 py-1 text-xs rounded-md ${
                selectedSector === sector ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white bg-surface-lighter'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20 space-y-2">
          <h3 className="text-sm font-semibold text-primary-400">
            {searchTicker} 관련 종목
          </h3>
          {searchResults.map((link, i) => (
            <LinkRow key={i} link={link} />
          ))}
        </div>
      )}

      {/* Supply chain map */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-300">한미 공급망 매핑</h3>
        <div className="grid gap-2">
          {filteredLinks.map((link, i) => (
            <LinkRow key={i} link={link} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LinkRow({ link }: { link: import('@/data/sector-mappings').SupplyChainLink }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-light border border-surface-border">
      {/* US side */}
      <div className="flex-1 text-right">
        <span className="text-sm font-medium text-white">{link.usName}</span>
        <span className="text-xs text-slate-500 ml-1.5">{link.usTicker}</span>
      </div>

      {/* Connection */}
      <div className="flex flex-col items-center px-2 min-w-[140px]">
        <span className="text-[10px] text-primary-400 text-center">{link.relationship}</span>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="h-px w-8 bg-primary-500/40" />
          <span className="text-primary-500">↔</span>
          <div className="h-px w-8 bg-primary-500/40" />
        </div>
        <span className="text-[9px] text-slate-600 mt-0.5">{link.sector}</span>
      </div>

      {/* KR side */}
      <div className="flex-1">
        <span className="text-sm font-medium text-white">{link.krName}</span>
        <span className="text-xs text-slate-500 ml-1.5">{link.krTicker}</span>
      </div>
    </div>
  )
}

import { useUIStore } from '@/stores/uiStore'
import { useBoardStore } from '@/stores/boardStore'
import type { AgentType, Signal } from '@/types/agent'

export default function BoardFiltersBar() {
  const { t } = useUIStore()
  const { filters, setFilters } = useBoardStore()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Market */}
      <FilterSelect
        value={filters.market}
        onChange={(v) => setFilters({ market: v as 'all' | 'us' | 'kr' })}
        options={[
          { value: 'all', label: 'All' },
          { value: 'us', label: t('board.us') },
          { value: 'kr', label: t('board.kr') },
        ]}
      />

      {/* Agent */}
      <FilterSelect
        value={filters.agent}
        onChange={(v) => setFilters({ agent: v as 'all' | AgentType })}
        options={[
          { value: 'all', label: 'All Agents' },
          { value: 'macro', label: t('agent.macro') },
          { value: 'fundamental', label: t('agent.fundamental') },
          { value: 'technical', label: t('agent.technical') },
          { value: 'sentiment', label: t('agent.sentiment') },
        ]}
      />

      {/* Signal */}
      <FilterSelect
        value={filters.signal}
        onChange={(v) => setFilters({ signal: v as 'all' | Signal })}
        options={[
          { value: 'all', label: 'All Signals' },
          { value: 'strong_buy', label: t('signal.strong_buy') },
          { value: 'buy', label: t('signal.buy') },
          { value: 'hold', label: t('signal.hold') },
          { value: 'sell', label: t('signal.sell') },
          { value: 'strong_sell', label: t('signal.strong_sell') },
        ]}
      />

      {/* Search */}
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        placeholder={t('board.selectTicker')}
        className="px-3 py-1.5 text-xs rounded-lg bg-surface border border-surface-border text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50"
      />
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-xs rounded-lg bg-surface border border-surface-border text-slate-300 focus:outline-none focus:border-primary-500/50 appearance-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

import { useState } from 'react'
import { useWatchlistStore } from '@/stores/watchlistStore'
import { useUIStore } from '@/stores/uiStore'
import type { WatchCondition, WatchConditionType } from '@/types/watchlist'

const CONDITION_TYPES: { value: WatchConditionType; label: string }[] = [
  { value: 'price_above', label: '가격 상향 돌파' },
  { value: 'price_below', label: '가격 하향 이탈' },
  { value: 'change_above', label: '등락률 상한' },
  { value: 'change_below', label: '등락률 하한' },
  { value: 'rsi_above', label: 'RSI 과매수' },
  { value: 'rsi_below', label: 'RSI 과매도' },
  { value: 'volume_spike', label: '거래량 급등' },
]

export default function Watchlist() {
  const { t } = useUIStore()
  const { items, alerts, addItem, removeItem, dismissAlert, clearAlerts } = useWatchlistStore()

  const [ticker, setTicker] = useState('')
  const [market, setMarket] = useState<'us' | 'kr'>('us')
  const [condType, setCondType] = useState<WatchConditionType>('price_above')
  const [condValue, setCondValue] = useState(0)

  const handleAdd = () => {
    if (!ticker.trim()) return
    const condition: WatchCondition = { type: condType, value: condValue }
    addItem(ticker.trim().toUpperCase(), ticker.trim().toUpperCase(), market, [condition])
    setTicker('')
    setCondValue(0)
  }

  const activeAlerts = alerts.filter((a) => !a.dismissed)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-lg font-bold text-slate-100">{t('watchlist.title')}</h2>

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-caution-400">Alerts ({activeAlerts.length})</h3>
            <button onClick={clearAlerts} className="text-xs text-slate-500 hover:text-white">Clear All</button>
          </div>
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-caution-500/10 border border-caution-500/30">
              <span className="text-sm text-caution-300">{alert.message}</span>
              <button onClick={() => dismissAlert(alert.id)} className="text-xs text-slate-500">Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* Add watchlist item */}
      <div className="p-4 rounded-xl bg-surface-light border border-surface-border space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">{t('watchlist.add')}</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex rounded-lg overflow-hidden border border-surface-border">
            <button
              onClick={() => setMarket('us')}
              className={`px-3 py-1.5 text-xs ${market === 'us' ? 'bg-primary-500 text-white' : 'bg-surface text-slate-400'}`}
            >
              US
            </button>
            <button
              onClick={() => setMarket('kr')}
              className={`px-3 py-1.5 text-xs ${market === 'kr' ? 'bg-primary-500 text-white' : 'bg-surface text-slate-400'}`}
            >
              KR
            </button>
          </div>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ticker"
            className="px-3 py-1.5 text-sm rounded-lg bg-surface border border-surface-border text-white placeholder:text-slate-600 w-24"
          />
          <select
            value={condType}
            onChange={(e) => setCondType(e.target.value as WatchConditionType)}
            className="px-3 py-1.5 text-xs rounded-lg bg-surface border border-surface-border text-slate-300"
          >
            {CONDITION_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
          <input
            type="number"
            value={condValue}
            onChange={(e) => setCondValue(parseFloat(e.target.value) || 0)}
            className="px-3 py-1.5 text-sm rounded-lg bg-surface border border-surface-border text-white w-24"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-1.5 text-xs rounded-lg bg-primary-500 text-white hover:bg-primary-600"
          >
            Add
          </button>
        </div>
      </div>

      {/* Watchlist items */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-600 text-sm">{t('watchlist.noItems')}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-light border border-surface-border">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">{item.ticker}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400">{item.market.toUpperCase()}</span>
                {item.conditions.map((c, i) => (
                  <span key={i} className="text-[10px] text-slate-500">
                    {c.type.replace(/_/g, ' ')}: {c.value}
                  </span>
                ))}
              </div>
              <button onClick={() => removeItem(item.id)} className="text-xs text-bear-400 hover:text-bear-300">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useMarketStore } from '@/stores/marketStore'
import { useUIStore } from '@/stores/uiStore'
import StockChart from '@/components/chart/StockChart'
import ChartToolbar from '@/components/chart/ChartToolbar'
import { calcIndicators } from '@/lib/indicators'

export default function Chart() {
  const { ticker: paramTicker } = useParams()
  const { t } = useUIStore()
  const { fetchStock, currentStock, isLoading } = useMarketStore()

  const [ticker, setTicker] = useState(paramTicker ?? '')
  const [market, setMarket] = useState<'us' | 'kr'>('us')
  const [period, setPeriod] = useState('6mo')

  useEffect(() => {
    if (paramTicker) {
      setTicker(paramTicker)
      fetchStock(market, paramTicker, period)
    }
  }, [paramTicker, market, period, fetchStock])

  const handleSearch = () => {
    if (ticker.trim()) fetchStock(market, ticker.trim().toUpperCase(), period)
  }

  const indicators = currentStock ? calcIndicators(currentStock.ohlcv) : null

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">{t('chart.title')}</h2>

        <div className="flex items-center gap-2">
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ticker"
            className="px-3 py-1.5 text-sm rounded-lg bg-surface border border-surface-border text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 w-28"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 text-xs rounded-lg bg-primary-500 text-white hover:bg-primary-600"
          >
            Search
          </button>
          <ChartToolbar period={period} onPeriodChange={setPeriod} />
        </div>
      </div>

      {isLoading && <div className="text-center py-8 text-slate-500 animate-pulse">{t('common.loading')}</div>}

      {currentStock && (
        <>
          {/* Stock info header */}
          <div className="flex items-baseline gap-4">
            <span className="text-2xl font-bold text-white">{currentStock.info.name}</span>
            <span className="text-sm text-slate-400">{currentStock.info.ticker}</span>
            <span className="text-xl font-semibold text-white">{currentStock.currentPrice.toLocaleString()}</span>
            <span className={`text-sm font-medium ${currentStock.change >= 0 ? 'text-bull-400' : 'text-bear-400'}`}>
              {currentStock.change >= 0 ? '+' : ''}{currentStock.change} ({currentStock.changePercent >= 0 ? '+' : ''}{currentStock.changePercent}%)
            </span>
          </div>

          {/* Main chart */}
          <StockChart data={currentStock.ohlcv} height={500} />

          {/* Indicators panel */}
          {indicators && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <IndicatorBox label="RSI(14)" value={indicators.rsi14?.toFixed(1)} warn={indicators.rsi14 != null && (indicators.rsi14 > 70 || indicators.rsi14 < 30)} />
              <IndicatorBox label="SMA 20" value={indicators.sma20?.toFixed(2)} />
              <IndicatorBox label="SMA 50" value={indicators.sma50?.toFixed(2)} />
              <IndicatorBox label="SMA 200" value={indicators.sma200?.toFixed(2)} />
              <IndicatorBox label="MACD" value={indicators.macd?.value.toFixed(4)} />
              <IndicatorBox label="BB Middle" value={indicators.bollingerBands?.middle.toFixed(2)} />
            </div>
          )}
        </>
      )}

      {!currentStock && !isLoading && (
        <div className="text-center py-16 text-slate-600">{t('common.empty')}</div>
      )}
    </div>
  )
}

function IndicatorBox({ label, value, warn }: { label: string; value?: string; warn?: boolean }) {
  return (
    <div className={`p-3 rounded-lg bg-surface-light border ${warn ? 'border-caution-500/40' : 'border-surface-border'}`}>
      <div className="text-[10px] text-slate-500 mb-1">{label}</div>
      <div className={`text-sm font-mono ${warn ? 'text-caution-400' : 'text-slate-200'}`}>
        {value ?? '-'}
      </div>
    </div>
  )
}

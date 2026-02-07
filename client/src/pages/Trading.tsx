import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useMarketStore } from '@/stores/marketStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import PortfolioPanel from '@/components/trading/PortfolioPanel'
import TradeDialog from '@/components/trading/TradeDialog'
import TradeHistory from '@/components/trading/TradeHistory'

export default function Trading() {
  const { t } = useUIStore()
  const { fetchStock, currentStock } = useMarketStore()
  const { resetPortfolio } = usePortfolioStore()

  const [ticker, setTicker] = useState('')
  const [market, setMarket] = useState<'us' | 'kr'>('us')
  const [tradeOpen, setTradeOpen] = useState(false)

  const handleSearch = async () => {
    if (ticker.trim()) await fetchStock(market, ticker.trim().toUpperCase())
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">{t('trading.title')}</h2>
        <button
          onClick={resetPortfolio}
          className="px-3 py-1 text-xs rounded-lg text-bear-400 border border-bear-500/30 hover:bg-bear-500/10"
        >
          Reset Portfolio
        </button>
      </div>

      <PortfolioPanel />

      {/* Quick trade */}
      <div className="p-4 rounded-xl bg-surface-light border border-surface-border space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Quick Trade</h3>
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
            className="px-3 py-1.5 text-sm rounded-lg bg-surface border border-surface-border text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 w-28"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 text-xs rounded-lg bg-primary-500 text-white hover:bg-primary-600"
          >
            Search
          </button>
        </div>

        {currentStock && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
            <div>
              <span className="text-white font-medium">{currentStock.info.name}</span>
              <span className="text-slate-500 text-xs ml-2">{currentStock.info.ticker}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-mono">{currentStock.currentPrice.toLocaleString()}</span>
              <span className={`text-xs ${currentStock.change >= 0 ? 'text-bull-400' : 'text-bear-400'}`}>
                {currentStock.changePercent >= 0 ? '+' : ''}{currentStock.changePercent}%
              </span>
              <button
                onClick={() => setTradeOpen(true)}
                className="px-3 py-1 text-xs rounded-lg bg-primary-500 text-white hover:bg-primary-600"
              >
                Trade
              </button>
            </div>
          </div>
        )}
      </div>

      <TradeHistory />

      {tradeOpen && currentStock && (
        <TradeDialog
          ticker={currentStock.info.ticker}
          name={currentStock.info.name}
          market={currentStock.info.market as 'us' | 'kr'}
          currentPrice={currentStock.currentPrice}
          onClose={() => setTradeOpen(false)}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  ticker: string
  name: string
  market: 'us' | 'kr'
  currentPrice: number
  onClose: () => void
}

export default function TradeDialog({ ticker, name, market, currentPrice, onClose }: Props) {
  const { t } = useUIStore()
  const { buy, sell, portfolio } = usePortfolioStore()
  const [type, setType] = useState<'buy' | 'sell'>('buy')
  const [shares, setShares] = useState(1)
  const [price, setPrice] = useState(currentPrice)

  const total = shares * price
  const cash = market === 'us' ? portfolio.cashUsd : portfolio.cashKrw
  const position = portfolio.positions.find((p) => p.ticker === ticker && p.market === market)
  const canBuy = total <= cash
  const canSell = position != null && shares <= position.shares

  const handleExecute = () => {
    let success: boolean
    if (type === 'buy') {
      success = buy(ticker, name, market, shares, price)
    } else {
      success = sell(ticker, market, shares, price)
    }
    if (success) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-surface-light rounded-xl border border-surface-border p-6 w-96 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{ticker} - {name}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white">x</button>
        </div>

        {/* Buy/Sell toggle */}
        <div className="flex rounded-lg overflow-hidden border border-surface-border">
          <button
            onClick={() => setType('buy')}
            className={`flex-1 py-2 text-xs font-medium ${type === 'buy' ? 'bg-bull-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            {t('trading.buy')}
          </button>
          <button
            onClick={() => setType('sell')}
            className={`flex-1 py-2 text-xs font-medium ${type === 'sell' ? 'bg-bear-500 text-white' : 'bg-surface text-slate-400'}`}
          >
            {t('trading.sell')}
          </button>
        </div>

        {/* Shares */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">{t('trading.shares')}</label>
          <input
            type="number"
            min={1}
            value={shares}
            onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-white text-sm"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">{t('trading.price')}</label>
          <input
            type="number"
            min={0}
            step={market === 'us' ? 0.01 : 1}
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-white text-sm"
          />
        </div>

        {/* Total */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{t('trading.total')}</span>
          <span className="text-white font-medium">
            {total.toLocaleString()} {market === 'us' ? 'USD' : 'KRW'}
          </span>
        </div>

        {/* Cash info */}
        <div className="text-xs text-slate-500">
          Available: {cash.toLocaleString()} {market === 'us' ? 'USD' : 'KRW'}
          {position && ` / Position: ${position.shares} shares`}
        </div>

        {/* Execute */}
        <button
          onClick={handleExecute}
          disabled={type === 'buy' ? !canBuy : !canSell}
          className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            type === 'buy' ? 'bg-bull-500 hover:bg-bull-600' : 'bg-bear-500 hover:bg-bear-600'
          }`}
        >
          {t('trading.execute')}
        </button>
      </div>
    </div>
  )
}

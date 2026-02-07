import { usePortfolioStore } from '@/stores/portfolioStore'
import { useUIStore } from '@/stores/uiStore'
import { calcPositionPnL, calcPositionPnLPercent } from '@/types/portfolio'

interface Props {
  getPriceForTicker?: (ticker: string, market: 'us' | 'kr') => number | null
}

export default function PortfolioPanel({ getPriceForTicker }: Props) {
  const { t } = useUIStore()
  const { portfolio } = usePortfolioStore()

  return (
    <div className="space-y-4">
      {/* Cash balances */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-surface-light border border-surface-border">
          <div className="text-[10px] text-slate-500">USD Cash</div>
          <div className="text-lg font-bold text-white">${portfolio.cashUsd.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-lg bg-surface-light border border-surface-border">
          <div className="text-[10px] text-slate-500">KRW Cash</div>
          <div className="text-lg font-bold text-white">{portfolio.cashKrw.toLocaleString()}원</div>
        </div>
      </div>

      {/* Positions */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 mb-2">Positions ({portfolio.positions.length})</h4>
        {portfolio.positions.length === 0 ? (
          <div className="text-xs text-slate-600 py-4 text-center">No positions</div>
        ) : (
          <div className="space-y-1.5">
            {portfolio.positions.map((pos) => {
              const currentPrice = getPriceForTicker?.(pos.ticker, pos.market)
              const pnl = currentPrice ? calcPositionPnL(pos, currentPrice) : null
              const pnlPct = currentPrice ? calcPositionPnLPercent(pos, currentPrice) : null

              return (
                <div key={pos.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-light/50 border border-surface-border">
                  <div>
                    <span className="text-sm font-medium text-white">{pos.ticker}</span>
                    <span className="text-xs text-slate-500 ml-2">{pos.shares} shares @ {pos.avgPrice.toLocaleString()}</span>
                  </div>
                  {pnl != null && (
                    <span className={`text-xs font-medium ${pnl >= 0 ? 'text-bull-400' : 'text-bear-400'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} ({pnlPct!.toFixed(2)}%)
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

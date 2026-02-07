import { usePortfolioStore } from '@/stores/portfolioStore'
import { useUIStore } from '@/stores/uiStore'

export default function TradeHistory() {
  const { t } = useUIStore()
  const { portfolio } = usePortfolioStore()

  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-400 mb-2">{t('trading.history')}</h4>
      {portfolio.trades.length === 0 ? (
        <div className="text-xs text-slate-600 py-4 text-center">No trades yet</div>
      ) : (
        <div className="space-y-1">
          {portfolio.trades.slice(0, 50).map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-light/30 border border-surface-border text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  trade.type === 'buy' ? 'bg-bull-500/20 text-bull-400' : 'bg-bear-500/20 text-bear-400'
                }`}>
                  {trade.type === 'buy' ? t('trading.buy') : t('trading.sell')}
                </span>
                <span className="text-white font-medium">{trade.ticker}</span>
                <span className="text-slate-500">{trade.shares} @ {trade.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">{trade.total.toLocaleString()} {trade.currency}</span>
                <span className="text-slate-600">{new Date(trade.executedAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

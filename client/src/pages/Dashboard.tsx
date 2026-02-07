import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useMarketStore } from '@/stores/marketStore'
import { useOverviewPolling } from '@/hooks/useMarketData'
import { useBoardStore } from '@/stores/boardStore'

export default function Dashboard() {
  const { t } = useUIStore()
  const { portfolio } = usePortfolioStore()
  const { overview, exchangeRate } = useOverviewPolling()
  const { posts } = useBoardStore()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-lg font-bold text-slate-100">{t('dashboard.title')}</h2>

      {/* Portfolio summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="USD Cash" value={`$${portfolio.cashUsd.toLocaleString()}`} />
        <StatCard label="KRW Cash" value={`${portfolio.cashKrw.toLocaleString()}원`} />
        <StatCard label="Positions" value={portfolio.positions.length.toString()} />
        <StatCard label="Total Trades" value={portfolio.trades.length.toString()} />
      </div>

      {/* Market overview */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <IndexCard name="S&P 500" value={overview.sp500.value} change={overview.sp500.change} />
          <IndexCard name="NASDAQ" value={overview.nasdaq.value} change={overview.nasdaq.change} />
          <IndexCard name="KOSPI" value={overview.kospi.value} change={overview.kospi.change} />
          <IndexCard name="KOSDAQ" value={overview.kosdaq.value} change={overview.kosdaq.change} />
          <IndexCard name="VIX" value={overview.vix} change={0} />
          <IndexCard name="USD/KRW" value={overview.usdKrw} change={0} />
        </div>
      )}

      {/* Active positions */}
      {portfolio.positions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Active Positions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {portfolio.positions.map((pos) => (
              <div key={pos.id} className="p-3 rounded-lg bg-surface-light border border-surface-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{pos.ticker}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400">
                    {pos.market.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {pos.shares} shares @ {pos.avgPrice.toLocaleString()} {pos.currency}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent analyses */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Recent Analyses</h3>
        {posts.length === 0 ? (
          <div className="text-xs text-slate-600 py-4 text-center">{t('board.noResults')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {posts.slice(0, 6).map((post) => (
              <div key={post.id} className="p-3 rounded-lg bg-surface-light/50 border border-surface-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">{post.ticker}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    post.signal.includes('buy') ? 'bg-bull-500/15 text-bull-400' :
                    post.signal.includes('sell') ? 'bg-bear-500/15 text-bear-400' : 'bg-caution-500/15 text-caution-400'
                  }`}>
                    {post.signal.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">{post.agentType} / {new Date(post.createdAt).toLocaleDateString('ko-KR')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg bg-surface-light border border-surface-border">
      <div className="text-[10px] text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  )
}

function IndexCard({ name, value, change }: { name: string; value: number; change: number }) {
  const positive = change >= 0
  return (
    <div className="p-3 rounded-lg bg-surface-light border border-surface-border">
      <div className="text-[10px] text-slate-500 mb-1">{name}</div>
      <div className="text-sm font-bold text-white">{value.toLocaleString()}</div>
      {change !== 0 && (
        <div className={`text-[10px] ${positive ? 'text-bull-400' : 'text-bear-400'}`}>
          {positive ? '+' : ''}{change.toLocaleString()}
        </div>
      )}
    </div>
  )
}

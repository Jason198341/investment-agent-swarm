import { useState } from 'react'
import { AGENT_CONFIG as AGENT_CONFIG_IMPORT, SIGNAL_LABELS as SIGNAL_LABELS_IMPORT } from '@/types/agent'
import { useAgentSwarm } from '@/hooks/useAgentSwarm'
import { useBoardStore } from '@/stores/boardStore'
import { useUIStore } from '@/stores/uiStore'
import AgentCard from '@/components/board/AgentCard'
import ConsensusBar from '@/components/board/ConsensusBar'
import BoardFiltersBar from '@/components/board/BoardFilters'
import type { AgentType } from '@/types/agent'

export default function Board() {
  const { t } = useUIStore()
  const { analyze, cancelSwarm, results, consensus, isRunning } = useAgentSwarm()
  const { addPostsFromSwarm, getFilteredPosts } = useBoardStore()

  const [ticker, setTicker] = useState('')
  const [market, setMarket] = useState<'us' | 'kr'>('us')

  const handleAnalyze = async () => {
    if (!ticker.trim()) return
    await analyze(ticker.trim().toUpperCase(), market)
  }

  // Save to board when consensus arrives
  const prevConsensusRef = useState<number | null>(null)
  if (consensus && consensus.analyzedAt !== prevConsensusRef[0]) {
    prevConsensusRef[1](consensus.analyzedAt)
    addPostsFromSwarm(consensus)
  }

  const agentOrder: AgentType[] = ['macro', 'fundamental', 'technical', 'sentiment']
  const hasResults = agentOrder.some((t) => results[t] !== null)
  const filteredPosts = getFilteredPosts()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">{t('board.title')}</h2>

        <div className="flex items-center gap-2">
          {/* Market toggle */}
          <div className="flex rounded-lg overflow-hidden border border-surface-border">
            <button
              onClick={() => setMarket('us')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                market === 'us' ? 'bg-primary-500 text-white' : 'bg-surface text-slate-400 hover:text-white'
              }`}
            >
              {t('board.us')}
            </button>
            <button
              onClick={() => setMarket('kr')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                market === 'kr' ? 'bg-primary-500 text-white' : 'bg-surface text-slate-400 hover:text-white'
              }`}
            >
              {t('board.kr')}
            </button>
          </div>

          {/* Ticker input */}
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder={market === 'us' ? 'NVDA, AAPL...' : '005930, 035420...'}
            className="px-3 py-1.5 text-sm rounded-lg bg-surface border border-surface-border text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 w-36"
          />

          {/* Analyze button */}
          {isRunning ? (
            <button
              onClick={cancelSwarm}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-bear-500/20 text-bear-400 hover:bg-bear-500/30 transition-colors"
            >
              {t('board.cancel')}
            </button>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!ticker.trim()}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('board.analyze')}
            </button>
          )}
        </div>
      </div>

      {/* Consensus */}
      {consensus && <ConsensusBar consensus={consensus} />}

      {/* Live Agent Cards */}
      {hasResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agentOrder.map((type) => {
            const result = results[type]
            if (!result) return null
            return <AgentCard key={type} result={result} />
          })}
        </div>
      )}

      {/* Historical Board */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">분석 히스토리</h3>
          <BoardFiltersBar />
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-sm">{t('board.noResults')}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredPosts.slice(0, 20).map((post) => (
              <HistoryCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HistoryCard({ post }: { post: import('@/types/board').BoardPost }) {
  const [expanded, setExpanded] = useState(false)
  const config = AGENT_CONFIG_IMPORT[post.agentType]
  const signal = SIGNAL_LABELS_IMPORT[post.signal]
  const isBull = post.signal.includes('buy')
  const isBear = post.signal.includes('sell')

  return (
    <div className="rounded-lg border border-surface-border bg-surface-light/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{config.icon}</span>
          <span className={`text-xs font-medium text-${config.color}`}>{config.labelKo}</span>
          <span className="text-xs text-slate-500">{post.ticker}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            isBull ? 'bg-bull-500/15 text-bull-400' : isBear ? 'bg-bear-500/15 text-bear-400' : 'bg-caution-500/15 text-caution-400'
          }`}>
            {signal.labelKo}
          </span>
          <span className="text-[10px] text-slate-600">
            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
      <div className={`text-xs text-slate-400 overflow-hidden ${expanded ? '' : 'max-h-16'}`}>
        {post.markdown.replace(/```json[\s\S]*?```/, '').slice(0, expanded ? undefined : 200)}
      </div>
      {post.markdown.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-[10px] text-primary-400"
        >
          {expanded ? '접기' : '더 보기'}
        </button>
      )}
    </div>
  )
}

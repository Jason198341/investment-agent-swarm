import type { SwarmConsensus } from '@/types/agent'
import { SIGNAL_LABELS } from '@/types/agent'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  consensus: SwarmConsensus
}

export default function ConsensusBar({ consensus }: Props) {
  const { lang, t } = useUIStore()
  const signal = SIGNAL_LABELS[consensus.overallSignal]
  const isBull = consensus.overallSignal.includes('buy')
  const isBear = consensus.overallSignal.includes('sell')

  return (
    <div className="bg-surface-light rounded-xl border border-surface-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300">{t('board.consensus')}</h3>
        <span className="text-xs text-slate-500">
          {consensus.ticker} / {new Date(consensus.analyzedAt).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Signal badge */}
        <div
          className={`px-4 py-2 rounded-lg text-lg font-bold ${
            isBull ? 'bg-bull-500/20 text-bull-400' : isBear ? 'bg-bear-500/20 text-bear-400' : 'bg-caution-500/20 text-caution-400'
          }`}
        >
          {lang === 'ko' ? signal.labelKo : signal.label}
        </div>

        {/* Confidence bar */}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>확신도</span>
            <span>{consensus.avgConfidence}%</span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isBull ? 'bg-bull-500' : isBear ? 'bg-bear-500' : 'bg-caution-500'
              }`}
              style={{ width: `${consensus.avgConfidence}%` }}
            />
          </div>
        </div>

        {/* Vote counts */}
        <div className="flex gap-3 text-xs">
          <span className="text-bull-400">매수 {consensus.bullCount}</span>
          <span className="text-caution-400">중립 {consensus.agents.length - consensus.bullCount - consensus.bearCount}</span>
          <span className="text-bear-400">매도 {consensus.bearCount}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{consensus.summary}</p>
    </div>
  )
}

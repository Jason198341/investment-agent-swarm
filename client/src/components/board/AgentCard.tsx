import { useState } from 'react'
import type { AgentResult, AgentType } from '@/types/agent'
import { AGENT_CONFIG, SIGNAL_LABELS } from '@/types/agent'
import { useUIStore } from '@/stores/uiStore'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'

interface Props {
  result: AgentResult
}

export default function AgentCard({ result }: Props) {
  const { lang } = useUIStore()
  const [expanded, setExpanded] = useState(false)
  const config = AGENT_CONFIG[result.type]
  const signal = SIGNAL_LABELS[result.meta.signal]

  const isBull = result.meta.signal.includes('buy')
  const isBear = result.meta.signal.includes('sell')
  const isStreaming = result.status === 'streaming'
  const isError = result.status === 'error'

  return (
    <div className={`rounded-xl border bg-surface-light transition-all ${
      isStreaming ? 'border-' + config.color + '/50 animate-pulse' : 'border-surface-border'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`text-sm font-semibold text-${config.color}`}>
            {lang === 'ko' ? config.labelKo : config.label}
          </span>
          {isStreaming && (
            <span className="inline-block w-2 h-2 rounded-full bg-primary-400 animate-ping" />
          )}
        </div>

        {result.status === 'done' && (
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                isBull ? 'bg-bull-500/20 text-bull-400' : isBear ? 'bg-bear-500/20 text-bear-400' : 'bg-caution-500/20 text-caution-400'
              }`}
            >
              {lang === 'ko' ? signal.labelKo : signal.label}
            </span>
            <span className="text-xs text-slate-500">{result.meta.confidence}%</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {isError ? (
          <p className="text-bear-400 text-sm">{result.error}</p>
        ) : (
          <>
            <div className={`overflow-hidden transition-all ${expanded ? '' : 'max-h-48'}`}>
              <MarkdownRenderer content={result.markdown} />
            </div>
            {result.markdown.length > 300 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs text-primary-400 hover:text-primary-300"
              >
                {expanded ? '접기' : '더 보기'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer: key factors & risks */}
      {result.status === 'done' && (result.meta.keyFactors.length > 0 || result.meta.risks.length > 0) && (
        <div className="px-4 pb-4 flex flex-wrap gap-1.5">
          {result.meta.keyFactors.map((f, i) => (
            <span key={`f-${i}`} className="px-2 py-0.5 text-[11px] rounded-full bg-bull-500/10 text-bull-400">
              {f}
            </span>
          ))}
          {result.meta.risks.map((r, i) => (
            <span key={`r-${i}`} className="px-2 py-0.5 text-[11px] rounded-full bg-bear-500/10 text-bear-400">
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

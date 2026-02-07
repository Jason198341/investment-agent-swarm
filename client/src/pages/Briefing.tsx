import { useState } from 'react'
import { useBriefingStore } from '@/stores/briefingStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useUIStore } from '@/stores/uiStore'
import { speak, stop, isSpeaking } from '@/lib/tts'

export default function Briefing() {
  const { t } = useUIStore()
  const { briefings, currentBriefing, isGenerating, generateBriefing } = useBriefingStore()
  const { portfolio } = usePortfolioStore()
  const [speaking, setSpeaking] = useState(false)

  const handleGenerate = async () => {
    const positionSummary = portfolio.positions
      .map((p) => `${p.ticker} (${p.market.toUpperCase()}): ${p.shares}주 @ ${p.avgPrice}`)
      .join('\n')

    const context = `
## 포트폴리오 현황
USD 잔고: $${portfolio.cashUsd.toLocaleString()}
KRW 잔고: ${portfolio.cashKrw.toLocaleString()}원
보유 포지션:
${positionSummary || '없음'}

## 최근 거래
${portfolio.trades.slice(0, 5).map((t) => `${t.type} ${t.ticker} ${t.shares}주 @ ${t.price}`).join('\n') || '없음'}
`
    await generateBriefing(context)
  }

  const handleSpeak = () => {
    if (isSpeaking()) {
      stop()
      setSpeaking(false)
      return
    }
    if (currentBriefing) {
      speak(currentBriefing, 'ko')
      setSpeaking(true)
      // reset when done
      const check = setInterval(() => {
        if (!isSpeaking()) {
          setSpeaking(false)
          clearInterval(check)
        }
      }, 500)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-100">{t('briefing.title')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-1.5 text-xs rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40"
          >
            {isGenerating ? t('common.loading') : t('briefing.generate')}
          </button>
          {currentBriefing && (
            <button
              onClick={handleSpeak}
              className={`px-4 py-1.5 text-xs rounded-lg border transition-colors ${
                speaking
                  ? 'border-bear-500/50 text-bear-400 hover:bg-bear-500/10'
                  : 'border-primary-500/50 text-primary-400 hover:bg-primary-500/10'
              }`}
            >
              {speaking ? t('briefing.stop') : t('briefing.speak')}
            </button>
          )}
        </div>
      </div>

      {/* Current briefing */}
      {currentBriefing && (
        <div className="p-6 rounded-xl bg-surface-light border border-surface-border">
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{currentBriefing}</div>
        </div>
      )}

      {/* History */}
      {briefings.length > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-3">이전 브리핑</h3>
          <div className="space-y-2">
            {briefings.slice(1, 10).map((b) => (
              <div key={b.id} className="p-3 rounded-lg bg-surface-light/50 border border-surface-border">
                <div className="text-[10px] text-slate-600 mb-1">
                  {new Date(b.createdAt).toLocaleString('ko-KR')}
                </div>
                <div className="text-xs text-slate-400 line-clamp-3">{b.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentBriefing && !isGenerating && (
        <div className="text-center py-16 text-slate-600 text-sm">
          브리핑 생성 버튼을 눌러 오늘의 투자 브리핑을 받으세요.
        </div>
      )}
    </div>
  )
}

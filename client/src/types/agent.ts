export type AgentType = 'macro' | 'fundamental' | 'technical' | 'sentiment'

export type Signal = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'

export interface AgentMeta {
  signal: Signal
  confidence: number       // 0-100
  priceTarget?: number
  keyFactors: string[]
  risks: string[]
}

export interface AgentResult {
  type: AgentType
  markdown: string         // full analysis
  meta: AgentMeta
  status: 'streaming' | 'done' | 'error'
  error?: string
  startedAt: number
  completedAt?: number
}

export interface SwarmConsensus {
  overallSignal: Signal
  avgConfidence: number
  bullCount: number
  bearCount: number
  summary: string
  agents: AgentResult[]
  ticker: string
  market: 'us' | 'kr'
  analyzedAt: number
}

export const AGENT_CONFIG: Record<AgentType, { label: string; labelKo: string; color: string; icon: string }> = {
  macro:       { label: 'Macro',       labelKo: '거시경제', color: 'agent-macro',       icon: '🌍' },
  fundamental: { label: 'Fundamental', labelKo: '재무분석', color: 'agent-fundamental', icon: '📊' },
  technical:   { label: 'Technical',   labelKo: '기술분석', color: 'agent-technical',   icon: '📈' },
  sentiment:   { label: 'Sentiment',   labelKo: '시장심리', color: 'agent-sentiment',   icon: '💬' },
}

export const SIGNAL_LABELS: Record<Signal, { label: string; labelKo: string; color: string }> = {
  strong_buy:  { label: 'Strong Buy',  labelKo: '강력 매수', color: 'bull-500' },
  buy:         { label: 'Buy',         labelKo: '매수',     color: 'bull-400' },
  hold:        { label: 'Hold',        labelKo: '보유',     color: 'caution-500' },
  sell:        { label: 'Sell',        labelKo: '매도',     color: 'bear-400' },
  strong_sell: { label: 'Strong Sell', labelKo: '강력 매도', color: 'bear-500' },
}

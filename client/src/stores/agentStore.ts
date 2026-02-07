import { create } from 'zustand'
import type { AgentType, AgentResult, AgentMeta, Signal, SwarmConsensus } from '@/types/agent'
import { streamCompletion } from '@/lib/fireworks'
import { AGENT_IDENTITY, buildUserPrompt } from '@/data/prompts/agent-core'
import { MACRO_SYSTEM } from '@/data/prompts/macro-agent'
import { FUNDAMENTAL_SYSTEM } from '@/data/prompts/fundamental-agent'
import { TECHNICAL_SYSTEM } from '@/data/prompts/technical-agent'
import { SENTIMENT_SYSTEM } from '@/data/prompts/sentiment-agent'

const AGENT_SYSTEMS: Record<AgentType, string> = {
  macro: MACRO_SYSTEM,
  fundamental: FUNDAMENTAL_SYSTEM,
  technical: TECHNICAL_SYSTEM,
  sentiment: SENTIMENT_SYSTEM,
}

interface AgentStore {
  results: Record<AgentType, AgentResult | null>
  consensus: SwarmConsensus | null
  isRunning: boolean
  abortController: AbortController | null

  runSwarm: (ticker: string, market: 'us' | 'kr', stockData: string, fundamentalsData?: string, indicatorsData?: string) => Promise<void>
  cancelSwarm: () => void
  clearResults: () => void
}

function parseAgentMeta(markdown: string): AgentMeta {
  const defaults: AgentMeta = {
    signal: 'hold',
    confidence: 50,
    keyFactors: [],
    risks: [],
  }

  const jsonMatch = markdown.match(/```json\s*([\s\S]*?)```/)
  if (!jsonMatch?.[1]) return defaults

  try {
    const parsed = JSON.parse(jsonMatch[1])
    return {
      signal: parsed.signal ?? 'hold',
      confidence: parsed.confidence ?? 50,
      priceTarget: parsed.priceTarget ?? undefined,
      keyFactors: parsed.keyFactors ?? [],
      risks: parsed.risks ?? [],
    }
  } catch {
    return defaults
  }
}

function synthesizeConsensus(
  results: Record<AgentType, AgentResult | null>,
  ticker: string,
  market: 'us' | 'kr',
): SwarmConsensus {
  const agents = Object.values(results).filter((r): r is AgentResult => r !== null && r.status === 'done')

  const signalScore: Record<Signal, number> = {
    strong_buy: 2,
    buy: 1,
    hold: 0,
    sell: -1,
    strong_sell: -2,
  }

  let totalScore = 0
  let totalConfidence = 0
  let bullCount = 0
  let bearCount = 0

  for (const agent of agents) {
    const score = signalScore[agent.meta.signal]
    totalScore += score
    totalConfidence += agent.meta.confidence
    if (score > 0) bullCount++
    if (score < 0) bearCount++
  }

  const avgScore = agents.length > 0 ? totalScore / agents.length : 0
  const avgConfidence = agents.length > 0 ? Math.round(totalConfidence / agents.length) : 0

  let overallSignal: Signal = 'hold'
  if (avgScore >= 1.5) overallSignal = 'strong_buy'
  else if (avgScore >= 0.5) overallSignal = 'buy'
  else if (avgScore <= -1.5) overallSignal = 'strong_sell'
  else if (avgScore <= -0.5) overallSignal = 'sell'

  const signalLabels: Record<Signal, string> = {
    strong_buy: '강력 매수',
    buy: '매수',
    hold: '보유',
    sell: '매도',
    strong_sell: '강력 매도',
  }

  const summary = `4개 에이전트 합산 의견: **${signalLabels[overallSignal]}** (평균 확신도: ${avgConfidence}%). ` +
    `매수 ${bullCount}표, 매도 ${bearCount}표, 중립 ${agents.length - bullCount - bearCount}표.`

  return {
    overallSignal,
    avgConfidence,
    bullCount,
    bearCount,
    summary,
    agents,
    ticker,
    market,
    analyzedAt: Date.now(),
  }
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  results: { macro: null, fundamental: null, technical: null, sentiment: null },
  consensus: null,
  isRunning: false,
  abortController: null,

  runSwarm: async (ticker, market, stockData, fundamentalsData, indicatorsData) => {
    const ac = new AbortController()
    set({
      isRunning: true,
      abortController: ac,
      consensus: null,
      results: { macro: null, fundamental: null, technical: null, sentiment: null },
    })

    const agentTypes: AgentType[] = ['macro', 'fundamental', 'technical', 'sentiment']

    const additionalContextMap: Record<AgentType, string> = {
      macro: '',
      fundamental: fundamentalsData ? `### 재무 데이터\n${fundamentalsData}` : '',
      technical: indicatorsData ? `### 기술적 지표\n${indicatorsData}` : '',
      sentiment: '',
    }

    const promises = agentTypes.map(async (agentType) => {
      set((s) => ({
        results: {
          ...s.results,
          [agentType]: {
            type: agentType,
            markdown: '',
            meta: { signal: 'hold' as Signal, confidence: 0, keyFactors: [], risks: [] },
            status: 'streaming',
            startedAt: Date.now(),
          } satisfies AgentResult,
        },
      }))

      try {
        const fullText = await streamCompletion({
          messages: [
            { role: 'system', content: AGENT_IDENTITY + '\n\n' + AGENT_SYSTEMS[agentType] },
            { role: 'user', content: buildUserPrompt(ticker, market, stockData, additionalContextMap[agentType]) },
          ],
          onChunk: (chunk) => {
            set((s) => {
              const prev = s.results[agentType]
              if (!prev) return s
              return {
                results: {
                  ...s.results,
                  [agentType]: { ...prev, markdown: prev.markdown + chunk },
                },
              }
            })
          },
          signal: ac.signal,
          maxTokens: 4096,
          temperature: 0.4,
        })

        const meta = parseAgentMeta(fullText)
        set((s) => ({
          results: {
            ...s.results,
            [agentType]: {
              ...s.results[agentType]!,
              markdown: fullText,
              meta,
              status: 'done',
              completedAt: Date.now(),
            },
          },
        }))
      } catch (err: any) {
        if (err.name === 'AbortError') return
        set((s) => ({
          results: {
            ...s.results,
            [agentType]: {
              ...s.results[agentType]!,
              status: 'error',
              error: err.message,
              completedAt: Date.now(),
            },
          },
        }))
      }
    })

    await Promise.allSettled(promises)

    if (!ac.signal.aborted) {
      const finalResults = get().results
      const consensus = synthesizeConsensus(finalResults, ticker, market)
      set({ consensus, isRunning: false, abortController: null })
    }
  },

  cancelSwarm: () => {
    const { abortController } = get()
    abortController?.abort()
    set({ isRunning: false, abortController: null })
  },

  clearResults: () => {
    set({
      results: { macro: null, fundamental: null, technical: null, sentiment: null },
      consensus: null,
    })
  },
}))

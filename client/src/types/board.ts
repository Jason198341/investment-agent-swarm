import type { AgentType, Signal, SwarmConsensus } from './agent'

export interface BoardPost {
  id: string
  ticker: string
  name: string
  market: 'us' | 'kr'
  agentType: AgentType
  signal: Signal
  confidence: number
  markdown: string
  keyFactors: string[]
  risks: string[]
  priceTarget?: number
  createdAt: string
}

export interface BoardFilters {
  market: 'all' | 'us' | 'kr'
  agent: 'all' | AgentType
  signal: 'all' | Signal
  search: string
}

export interface BoardState {
  posts: BoardPost[]
  latestConsensus: SwarmConsensus | null
  filters: BoardFilters
}

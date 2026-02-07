export interface Position {
  id: string
  ticker: string
  name: string
  market: 'us' | 'kr'
  shares: number
  avgPrice: number
  currency: 'USD' | 'KRW'
  openedAt: string   // ISO date
}

export interface Trade {
  id: string
  ticker: string
  name: string
  market: 'us' | 'kr'
  type: 'buy' | 'sell'
  shares: number
  price: number
  currency: 'USD' | 'KRW'
  total: number
  executedAt: string  // ISO date
  agentSource?: string  // which agent suggested this
}

export interface Portfolio {
  cashUsd: number
  cashKrw: number
  positions: Position[]
  trades: Trade[]
  initialCashUsd: number
  initialCashKrw: number
  createdAt: string
}

export function calcPositionValue(p: Position, currentPrice: number): number {
  return p.shares * currentPrice
}

export function calcPositionPnL(p: Position, currentPrice: number): number {
  return (currentPrice - p.avgPrice) * p.shares
}

export function calcPositionPnLPercent(p: Position, currentPrice: number): number {
  if (p.avgPrice === 0) return 0
  return ((currentPrice - p.avgPrice) / p.avgPrice) * 100
}

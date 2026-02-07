export type WatchConditionType =
  | 'price_above'
  | 'price_below'
  | 'change_above'
  | 'change_below'
  | 'rsi_above'
  | 'rsi_below'
  | 'volume_spike'

export interface WatchCondition {
  type: WatchConditionType
  value: number
}

export interface WatchlistItem {
  id: string
  ticker: string
  name: string
  market: 'us' | 'kr'
  conditions: WatchCondition[]
  triggered: boolean
  lastChecked?: string
  addedAt: string
}

export interface WatchAlert {
  id: string
  watchId: string
  ticker: string
  condition: WatchCondition
  currentValue: number
  message: string
  createdAt: string
  dismissed: boolean
}

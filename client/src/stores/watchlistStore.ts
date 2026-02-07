import { create } from 'zustand'
import type { WatchlistItem, WatchAlert, WatchCondition } from '@/types/watchlist'

const STORAGE_KEY = 'ias_watchlist'

function load(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(items: WatchlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

interface WatchlistStore {
  items: WatchlistItem[]
  alerts: WatchAlert[]

  addItem: (ticker: string, name: string, market: 'us' | 'kr', conditions: WatchCondition[]) => void
  removeItem: (id: string) => void
  updateConditions: (id: string, conditions: WatchCondition[]) => void
  checkConditions: (ticker: string, currentPrice: number, changePercent: number, rsi?: number, volume?: number, avgVolume?: number) => void
  dismissAlert: (id: string) => void
  clearAlerts: () => void
}

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  items: load(),
  alerts: [],

  addItem: (ticker, name, market, conditions) => {
    set((s) => {
      const items = [
        ...s.items,
        {
          id: genId(),
          ticker,
          name,
          market,
          conditions,
          triggered: false,
          addedAt: new Date().toISOString(),
        },
      ]
      save(items)
      return { items }
    })
  },

  removeItem: (id) => {
    set((s) => {
      const items = s.items.filter((i) => i.id !== id)
      save(items)
      return { items }
    })
  },

  updateConditions: (id, conditions) => {
    set((s) => {
      const items = s.items.map((i) => (i.id === id ? { ...i, conditions } : i))
      save(items)
      return { items }
    })
  },

  checkConditions: (ticker, currentPrice, changePercent, rsi, volume, avgVolume) => {
    const { items } = get()
    const item = items.find((i) => i.ticker === ticker)
    if (!item) return

    const newAlerts: WatchAlert[] = []

    for (const cond of item.conditions) {
      let triggered = false
      let currentValue = 0
      let message = ''

      switch (cond.type) {
        case 'price_above':
          triggered = currentPrice > cond.value
          currentValue = currentPrice
          message = `${ticker} price ${currentPrice} > ${cond.value}`
          break
        case 'price_below':
          triggered = currentPrice < cond.value
          currentValue = currentPrice
          message = `${ticker} price ${currentPrice} < ${cond.value}`
          break
        case 'change_above':
          triggered = changePercent > cond.value
          currentValue = changePercent
          message = `${ticker} change ${changePercent}% > ${cond.value}%`
          break
        case 'change_below':
          triggered = changePercent < -cond.value
          currentValue = changePercent
          message = `${ticker} change ${changePercent}% < -${cond.value}%`
          break
        case 'rsi_above':
          if (rsi != null) { triggered = rsi > cond.value; currentValue = rsi; message = `${ticker} RSI ${rsi.toFixed(1)} > ${cond.value}` }
          break
        case 'rsi_below':
          if (rsi != null) { triggered = rsi < cond.value; currentValue = rsi; message = `${ticker} RSI ${rsi.toFixed(1)} < ${cond.value}` }
          break
        case 'volume_spike':
          if (volume != null && avgVolume != null && avgVolume > 0) {
            const ratio = volume / avgVolume
            triggered = ratio > cond.value
            currentValue = ratio
            message = `${ticker} volume ${ratio.toFixed(1)}x average`
          }
          break
      }

      if (triggered) {
        newAlerts.push({
          id: genId(),
          watchId: item.id,
          ticker,
          condition: cond,
          currentValue,
          message,
          createdAt: new Date().toISOString(),
          dismissed: false,
        })
      }
    }

    if (newAlerts.length > 0) {
      set((s) => ({ alerts: [...newAlerts, ...s.alerts].slice(0, 100) }))
    }
  },

  dismissAlert: (id) => {
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    }))
  },

  clearAlerts: () => set({ alerts: [] }),
}))

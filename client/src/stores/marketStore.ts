import { create } from 'zustand'
import type { StockData, ExchangeRate, MarketOverview } from '@/types/market'
import * as api from '@/lib/api'

interface MarketStore {
  currentStock: StockData | null
  exchangeRate: ExchangeRate | null
  overview: MarketOverview | null
  isLoading: boolean
  error: string | null

  fetchStock: (market: 'us' | 'kr', ticker: string, period?: string) => Promise<StockData | null>
  fetchExchangeRate: () => Promise<void>
  fetchOverview: () => Promise<void>
  clearError: () => void
}

export const useMarketStore = create<MarketStore>((set) => ({
  currentStock: null,
  exchangeRate: null,
  overview: null,
  isLoading: false,
  error: null,

  fetchStock: async (market, ticker, period) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.getStock(market, ticker, period)
      set({ currentStock: data, isLoading: false })
      return data
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      return null
    }
  },

  fetchExchangeRate: async () => {
    try {
      const rate = await api.getExchangeRate()
      set({ exchangeRate: rate })
    } catch (err: any) {
      console.error('Failed to fetch exchange rate:', err)
    }
  },

  fetchOverview: async () => {
    try {
      const overview = await api.getMarketOverview()
      set({ overview })
    } catch (err: any) {
      console.error('Failed to fetch market overview:', err)
    }
  },

  clearError: () => set({ error: null }),
}))

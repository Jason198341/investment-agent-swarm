import { create } from 'zustand'
import type { Portfolio, Position, Trade } from '@/types/portfolio'

const STORAGE_KEY = 'ias_portfolio'

const DEFAULT_PORTFOLIO: Portfolio = {
  cashUsd: 100_000,
  cashKrw: 100_000_000,
  positions: [],
  trades: [],
  initialCashUsd: 100_000,
  initialCashKrw: 100_000_000,
  createdAt: new Date().toISOString(),
}

function load(): Portfolio {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { ...DEFAULT_PORTFOLIO }
  } catch {
    return { ...DEFAULT_PORTFOLIO }
  }
}

function save(portfolio: Portfolio) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio))
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

interface PortfolioStore {
  portfolio: Portfolio

  buy: (ticker: string, name: string, market: 'us' | 'kr', shares: number, price: number, agentSource?: string) => boolean
  sell: (ticker: string, market: 'us' | 'kr', shares: number, price: number) => boolean
  resetPortfolio: () => void
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolio: load(),

  buy: (ticker, name, market, shares, price, agentSource) => {
    const { portfolio } = get()
    const currency = market === 'us' ? 'USD' : 'KRW'
    const total = shares * price
    const cash = market === 'us' ? portfolio.cashUsd : portfolio.cashKrw

    if (total > cash) return false

    // Update or create position
    const existingIdx = portfolio.positions.findIndex(
      (p) => p.ticker === ticker && p.market === market,
    )
    const positions = [...portfolio.positions]

    if (existingIdx >= 0) {
      const existing = positions[existingIdx]!
      const totalShares = existing.shares + shares
      const totalCost = existing.shares * existing.avgPrice + shares * price
      positions[existingIdx] = {
        ...existing,
        shares: totalShares,
        avgPrice: totalCost / totalShares,
      }
    } else {
      positions.push({
        id: genId(),
        ticker,
        name,
        market,
        shares,
        avgPrice: price,
        currency,
        openedAt: new Date().toISOString(),
      })
    }

    const trade: Trade = {
      id: genId(),
      ticker,
      name,
      market,
      type: 'buy',
      shares,
      price,
      currency,
      total,
      executedAt: new Date().toISOString(),
      agentSource,
    }

    const updated: Portfolio = {
      ...portfolio,
      cashUsd: market === 'us' ? portfolio.cashUsd - total : portfolio.cashUsd,
      cashKrw: market === 'kr' ? portfolio.cashKrw - total : portfolio.cashKrw,
      positions,
      trades: [trade, ...portfolio.trades],
    }

    save(updated)
    set({ portfolio: updated })
    return true
  },

  sell: (ticker, market, shares, price) => {
    const { portfolio } = get()
    const existingIdx = portfolio.positions.findIndex(
      (p) => p.ticker === ticker && p.market === market,
    )
    if (existingIdx < 0) return false

    const existing = portfolio.positions[existingIdx]!
    if (shares > existing.shares) return false

    const positions = [...portfolio.positions]
    const total = shares * price

    if (shares === existing.shares) {
      positions.splice(existingIdx, 1)
    } else {
      positions[existingIdx] = { ...existing, shares: existing.shares - shares }
    }

    const trade: Trade = {
      id: genId(),
      ticker,
      name: existing.name,
      market,
      type: 'sell',
      shares,
      price,
      currency: market === 'us' ? 'USD' : 'KRW',
      total,
      executedAt: new Date().toISOString(),
    }

    const updated: Portfolio = {
      ...portfolio,
      cashUsd: market === 'us' ? portfolio.cashUsd + total : portfolio.cashUsd,
      cashKrw: market === 'kr' ? portfolio.cashKrw + total : portfolio.cashKrw,
      positions,
      trades: [trade, ...portfolio.trades],
    }

    save(updated)
    set({ portfolio: updated })
    return true
  },

  resetPortfolio: () => {
    const fresh = { ...DEFAULT_PORTFOLIO, createdAt: new Date().toISOString() }
    save(fresh)
    set({ portfolio: fresh })
  },
}))

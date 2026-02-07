import type { StockData, ExchangeRate, Fundamentals, MarketOverview, Indicators } from '@/types/market'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, body || res.statusText)
  }
  return res.json()
}

// ─── Stock Data ──────────────────────────────

export function getUsStock(ticker: string, period = '6mo'): Promise<StockData> {
  return fetchJson(`/api/stocks/us/${ticker}?period=${period}`)
}

export function getKrStock(ticker: string, period = '6mo'): Promise<StockData> {
  return fetchJson(`/api/stocks/kr/${ticker}?period=${period}`)
}

export function getStock(market: 'us' | 'kr', ticker: string, period = '6mo'): Promise<StockData> {
  return market === 'us' ? getUsStock(ticker, period) : getKrStock(ticker, period)
}

// ─── Exchange Rate ───────────────────────────

export function getExchangeRate(): Promise<ExchangeRate> {
  return fetchJson('/api/exchange/usd-krw')
}

// ─── Fundamentals ────────────────────────────

export function getUsFundamentals(ticker: string): Promise<Fundamentals> {
  return fetchJson(`/api/fundamentals/us/${ticker}`)
}

export function getKrFundamentals(ticker: string): Promise<Fundamentals> {
  return fetchJson(`/api/fundamentals/kr/${ticker}`)
}

export function getFundamentals(market: 'us' | 'kr', ticker: string): Promise<Fundamentals> {
  return market === 'us' ? getUsFundamentals(ticker) : getKrFundamentals(ticker)
}

// ─── Market Overview ─────────────────────────

export function getMarketOverview(): Promise<MarketOverview> {
  return fetchJson('/api/market/overview')
}

// ─── Technical Indicators ────────────────────

export function getIndicators(market: 'us' | 'kr', ticker: string): Promise<Indicators> {
  return fetchJson(`/api/market/indicators/${market}/${ticker}`)
}

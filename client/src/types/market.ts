export interface OHLCV {
  date: string       // YYYY-MM-DD
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockInfo {
  ticker: string
  name: string
  market: 'us' | 'kr'
  sector?: string
  industry?: string
  marketCap?: number
  currency: 'USD' | 'KRW'
}

export interface StockData {
  info: StockInfo
  ohlcv: OHLCV[]
  currentPrice: number
  change: number        // absolute
  changePercent: number  // percentage
}

export interface ExchangeRate {
  usdKrw: number
  updatedAt: string
  source: 'bok' | 'yfinance'
}

export interface Fundamentals {
  ticker: string
  pe?: number
  forwardPe?: number
  pb?: number
  ps?: number
  roe?: number
  revenueGrowth?: number
  earningsGrowth?: number
  dividendYield?: number
  debtToEquity?: number
  freeCashFlow?: number
  marketCap?: number
}

export interface MarketOverview {
  sp500: { value: number; change: number }
  kospi: { value: number; change: number }
  nasdaq: { value: number; change: number }
  kosdaq: { value: number; change: number }
  vix: number
  usdKrw: number
  updatedAt: string
}

export interface Indicators {
  rsi14?: number
  macd?: { value: number; signal: number; histogram: number }
  bollingerBands?: { upper: number; middle: number; lower: number }
  sma20?: number
  sma50?: number
  sma200?: number
}

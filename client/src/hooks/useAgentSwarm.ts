import { useCallback } from 'react'
import { useAgentStore } from '@/stores/agentStore'
import * as api from '@/lib/api'
import { calcIndicators } from '@/lib/indicators'
import type { StockData, Fundamentals } from '@/types/market'

export function useAgentSwarm() {
  const { runSwarm, cancelSwarm, clearResults, results, consensus, isRunning } = useAgentStore()

  const analyze = useCallback(async (ticker: string, market: 'us' | 'kr') => {
    try {
      // Fetch stock data + fundamentals + indicators in parallel
      const [stockData, fundamentals] = await Promise.allSettled([
        api.getStock(market, ticker, '6mo'),
        api.getFundamentals(market, ticker),
      ])

      const stock = stockData.status === 'fulfilled' ? stockData.value : null
      const funds = fundamentals.status === 'fulfilled' ? fundamentals.value : null

      if (!stock) {
        throw new Error(`Failed to fetch data for ${ticker}`)
      }

      // Build data strings for agents
      const stockDataStr = formatStockData(stock)
      const fundamentalsStr = funds ? formatFundamentals(funds) : undefined
      const indicators = calcIndicators(stock.ohlcv)
      const indicatorsStr = formatIndicators(indicators)

      await runSwarm(ticker, market, stockDataStr, fundamentalsStr, indicatorsStr)
    } catch (err: any) {
      console.error('Swarm analysis failed:', err)
    }
  }, [runSwarm])

  return { analyze, cancelSwarm, clearResults, results, consensus, isRunning }
}

function formatStockData(data: StockData): string {
  const { info, ohlcv, currentPrice, change, changePercent } = data
  const recent = ohlcv.slice(-20)
  const ohlcvStr = recent
    .map((d) => `${d.date}: O=${d.open} H=${d.high} L=${d.low} C=${d.close} V=${d.volume}`)
    .join('\n')

  return `종목: ${info.name} (${info.ticker})
시장: ${info.market === 'us' ? '미국' : '한국'}
섹터: ${info.sector ?? 'N/A'}
현재가: ${currentPrice} ${info.currency}
전일대비: ${change > 0 ? '+' : ''}${change} (${changePercent > 0 ? '+' : ''}${changePercent}%)
시가총액: ${info.marketCap ? formatNumber(info.marketCap) : 'N/A'}

### 최근 20일 OHLCV
${ohlcvStr}`
}

function formatFundamentals(f: Fundamentals): string {
  const lines: string[] = []
  if (f.pe != null) lines.push(`PER: ${f.pe.toFixed(2)}`)
  if (f.forwardPe != null) lines.push(`Forward PER: ${f.forwardPe.toFixed(2)}`)
  if (f.pb != null) lines.push(`PBR: ${f.pb.toFixed(2)}`)
  if (f.ps != null) lines.push(`PSR: ${f.ps.toFixed(2)}`)
  if (f.roe != null) lines.push(`ROE: ${(f.roe * 100).toFixed(2)}%`)
  if (f.revenueGrowth != null) lines.push(`매출 성장률: ${(f.revenueGrowth * 100).toFixed(2)}%`)
  if (f.earningsGrowth != null) lines.push(`이익 성장률: ${(f.earningsGrowth * 100).toFixed(2)}%`)
  if (f.dividendYield != null) lines.push(`배당수익률: ${(f.dividendYield * 100).toFixed(2)}%`)
  if (f.debtToEquity != null) lines.push(`부채비율: ${f.debtToEquity.toFixed(2)}`)
  if (f.freeCashFlow != null) lines.push(`FCF: ${formatNumber(f.freeCashFlow)}`)
  return lines.join('\n') || '재무 데이터 없음'
}

function formatIndicators(ind: ReturnType<typeof calcIndicators>): string {
  const lines: string[] = []
  if (ind.rsi14 != null) lines.push(`RSI(14): ${ind.rsi14.toFixed(2)}`)
  if (ind.macd) {
    lines.push(`MACD: ${ind.macd.value.toFixed(4)} / Signal: ${ind.macd.signal.toFixed(4)} / Histogram: ${ind.macd.histogram.toFixed(4)}`)
  }
  if (ind.bollingerBands) {
    lines.push(`볼린저: Upper=${ind.bollingerBands.upper.toFixed(2)} Middle=${ind.bollingerBands.middle.toFixed(2)} Lower=${ind.bollingerBands.lower.toFixed(2)}`)
  }
  if (ind.sma20 != null) lines.push(`SMA20: ${ind.sma20.toFixed(2)}`)
  if (ind.sma50 != null) lines.push(`SMA50: ${ind.sma50.toFixed(2)}`)
  if (ind.sma200 != null) lines.push(`SMA200: ${ind.sma200.toFixed(2)}`)
  return lines.join('\n') || '지표 데이터 없음'
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(2)}K`
  return n.toFixed(2)
}

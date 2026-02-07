import type { OHLCV } from '@/types/market'

/** Simple Moving Average */
export function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null
    const slice = data.slice(i - period + 1, i + 1)
    return slice.reduce((a, b) => a + b, 0) / period
  })
}

/** Exponential Moving Average */
export function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = []
  let prev = data[0] ?? 0
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[0]!)
      continue
    }
    prev = (data[i]! - prev) * k + prev
    result.push(prev)
  }
  return result
}

/** RSI (Wilder's method) */
export function rsi(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(closes.length).fill(null)
  if (closes.length < period + 1) return result

  let avgGain = 0
  let avgLoss = 0

  for (let i = 1; i <= period; i++) {
    const diff = closes[i]! - closes[i - 1]!
    if (diff > 0) avgGain += diff
    else avgLoss -= diff
  }
  avgGain /= period
  avgLoss /= period

  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i]! - closes[i - 1]!
    if (diff > 0) {
      avgGain = (avgGain * (period - 1) + diff) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) - diff) / period
    }
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }
  return result
}

/** MACD (12, 26, 9) */
export function macd(closes: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = ema(closes, 12)
  const ema26 = ema(closes, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i]!)
  const signalLine = ema(macdLine, 9)
  const hist = macdLine.map((v, i) => v - signalLine[i]!)
  return { macd: macdLine, signal: signalLine, histogram: hist }
}

/** Bollinger Bands (20, 2) */
export function bollingerBands(
  closes: number[],
  period = 20,
  mult = 2,
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = sma(closes, period)
  const upper: (number | null)[] = []
  const lower: (number | null)[] = []

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1 || middle[i] == null) {
      upper.push(null)
      lower.push(null)
      continue
    }
    const slice = closes.slice(i - period + 1, i + 1)
    const mean = middle[i]!
    const std = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period)
    upper.push(mean + mult * std)
    lower.push(mean - mult * std)
  }

  return { upper, middle, lower }
}

/** Extract latest indicator values from OHLCV */
export function calcIndicators(ohlcv: OHLCV[]) {
  const closes = ohlcv.map((d) => d.close)
  const rsiVals = rsi(closes)
  const macdVals = macd(closes)
  const bb = bollingerBands(closes)
  const sma20 = sma(closes, 20)
  const sma50 = sma(closes, 50)
  const sma200 = sma(closes, 200)
  const last = closes.length - 1

  return {
    rsi14: rsiVals[last] ?? undefined,
    macd: {
      value: macdVals.macd[last] ?? 0,
      signal: macdVals.signal[last] ?? 0,
      histogram: macdVals.histogram[last] ?? 0,
    },
    bollingerBands: {
      upper: bb.upper[last] ?? 0,
      middle: bb.middle[last] ?? 0,
      lower: bb.lower[last] ?? 0,
    },
    sma20: sma20[last] ?? undefined,
    sma50: sma50[last] ?? undefined,
    sma200: sma200[last] ?? undefined,
  }
}

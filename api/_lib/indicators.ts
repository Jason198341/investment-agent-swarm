/** Pure-math technical indicator calculations (no numpy dependency). */

export function calcSMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null
  const slice = closes.slice(-period)
  return Math.round((slice.reduce((a, b) => a + b, 0) / period) * 10000) / 10000
}

function calcEMA(closes: number[], period: number): number[] {
  if (!closes.length) return []
  const k = 2 / (period + 1)
  const result = [closes[0]]
  for (let i = 1; i < closes.length; i++) {
    result.push(closes[i] * k + result[i - 1] * (1 - k))
  }
  return result
}

export function calcRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null
  const gains: number[] = []
  const losses: number[] = []
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    gains.push(Math.max(diff, 0))
    losses.push(Math.max(-diff, 0))
  }
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
  }
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return Math.round((100 - 100 / (1 + rs)) * 100) / 100
}

export function calcMACD(
  closes: number[],
): { value: number; signal: number; histogram: number } | null {
  if (closes.length < 35) return null
  const ema12 = calcEMA(closes, 12)
  const ema26 = calcEMA(closes, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signalLine = calcEMA(macdLine, 9)
  if (!signalLine.length) return null
  const value = Math.round(macdLine[macdLine.length - 1] * 10000) / 10000
  const signal = Math.round(signalLine[signalLine.length - 1] * 10000) / 10000
  return {
    value,
    signal,
    histogram: Math.round((value - signal) * 10000) / 10000,
  }
}

export function calcBollinger(
  closes: number[],
  period = 20,
  mult = 2,
): { upper: number; middle: number; lower: number } | null {
  if (closes.length < period) return null
  const window = closes.slice(-period)
  const mean = window.reduce((a, b) => a + b, 0) / period
  const variance = window.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period
  const std = Math.sqrt(variance)
  return {
    upper: Math.round((mean + mult * std) * 10000) / 10000,
    middle: Math.round(mean * 10000) / 10000,
    lower: Math.round((mean - mult * std) * 10000) / 10000,
  }
}

export function computeIndicators(closes: number[]) {
  const rsi = calcRSI(closes)
  const macd = calcMACD(closes)
  const bb = calcBollinger(closes)
  return {
    rsi14: rsi,
    macd_value: macd?.value ?? null,
    macd_signal: macd?.signal ?? null,
    macd_histogram: macd?.histogram ?? null,
    bb_upper: bb?.upper ?? null,
    bb_middle: bb?.middle ?? null,
    bb_lower: bb?.lower ?? null,
    sma20: calcSMA(closes, 20),
    sma50: calcSMA(closes, 50),
    sma200: calcSMA(closes, 200),
  }
}

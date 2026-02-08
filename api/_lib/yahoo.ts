/** Shared Yahoo Finance v8 API utilities for Vercel serverless functions. */

const YAHOO_BASE = 'https://query1.finance.yahoo.com'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const PERIOD_MAP: Record<string, string> = {
  '1d': '1d',
  '5d': '5d',
  '1mo': '1mo',
  '3mo': '3mo',
  '6mo': '6mo',
  '1y': '1y',
  '2y': '2y',
  '5y': '5y',
}

export interface ChartResult {
  meta: Record<string, any>
  timestamp: number[]
  indicators: {
    quote: Array<{
      open: (number | null)[]
      high: (number | null)[]
      low: (number | null)[]
      close: (number | null)[]
      volume: (number | null)[]
    }>
  }
}

export interface OHLCVItem {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function fetchChart(
  ticker: string,
  period = '6mo',
  interval = '1d',
): Promise<ChartResult> {
  const range = PERIOD_MAP[period] ?? '6mo'
  const url = `${YAHOO_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) throw new Error(`Yahoo API ${res.status}`)
  const data = await res.json()
  const result = data?.chart?.result
  if (!result?.[0]) throw new Error(`No data for ${ticker}`)
  return result[0]
}

export async function fetchQuoteSummary(
  ticker: string,
): Promise<Record<string, any>> {
  const url = `${YAHOO_BASE}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=assetProfile,defaultKeyStatistics,financialData,summaryDetail,price`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    })
    if (!res.ok) return {}
    const data = await res.json()
    return data?.quoteSummary?.result?.[0] ?? {}
  } catch {
    return {}
  }
}

export function parseOHLCV(chart: ChartResult): OHLCVItem[] {
  const timestamps = chart.timestamp ?? []
  const quote = chart.indicators?.quote?.[0] ?? {}
  const opens = quote.open ?? []
  const highs = quote.high ?? []
  const lows = quote.low ?? []
  const closes = quote.close ?? []
  const volumes = quote.volume ?? []

  const items: OHLCVItem[] = []
  for (let i = 0; i < timestamps.length; i++) {
    const o = opens[i] ?? 0
    const h = highs[i] ?? 0
    const l = lows[i] ?? 0
    const c = closes[i] ?? 0
    const v = volumes[i] ?? 0
    if (c === 0) continue

    const dt = new Date(timestamps[i] * 1000)
    items.push({
      date: dt.toISOString().slice(0, 10),
      open: Math.round(o * 100) / 100,
      high: Math.round(h * 100) / 100,
      low: Math.round(l * 100) / 100,
      close: Math.round(c * 100) / 100,
      volume: Math.round(v),
    })
  }
  return items
}

/** Fetch index last close + change (for market overview). */
export async function fetchIndex(
  ticker: string,
): Promise<{ value: number; change: number }> {
  try {
    const chart = await fetchChart(ticker, '5d')
    const closes =
      chart.indicators?.quote?.[0]?.close?.filter(
        (c): c is number => c !== null,
      ) ?? []
    if (!closes.length) return { value: 0, change: 0 }
    const last = Math.round(closes[closes.length - 1] * 100) / 100
    const prev =
      closes.length >= 2
        ? Math.round(closes[closes.length - 2] * 100) / 100
        : last
    return { value: last, change: Math.round((last - prev) * 100) / 100 }
  } catch {
    return { value: 0, change: 0 }
  }
}

/** Helper to get raw value from Yahoo's nested { raw, fmt } structure. */
export function rawVal(d: Record<string, any>, key: string): number | null {
  const v = d?.[key]
  if (v === undefined || v === null) return null
  if (typeof v === 'object' && 'raw' in v) return v.raw
  if (typeof v === 'number') return v
  return null
}

/** JSON response helper. */
export function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Error response helper. */
export function errorJson(message: string, status = 400): Response {
  return json({ error: message }, status)
}

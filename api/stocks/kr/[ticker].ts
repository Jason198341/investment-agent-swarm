import { fetchChart, parseOHLCV, json, errorJson } from '../../_lib/yahoo'

export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const ticker = url.pathname.split('/').pop()!
  const period = url.searchParams.get('period') ?? '6mo'

  // Try KOSPI (.KS) first, then KOSDAQ (.KQ)
  let chart
  let suffix = '.KS'
  try {
    chart = await fetchChart(`${ticker}.KS`, period)
  } catch {
    try {
      chart = await fetchChart(`${ticker}.KQ`, period)
      suffix = '.KQ'
    } catch (e: any) {
      return errorJson(`No data for KR ticker ${ticker}: ${e.message}`, 404)
    }
  }

  try {
    const meta = chart.meta ?? {}
    const ohlcv = parseOHLCV(chart)

    // KR stocks: round to whole numbers (won)
    for (const item of ohlcv) {
      item.open = Math.round(item.open)
      item.high = Math.round(item.high)
      item.low = Math.round(item.low)
      item.close = Math.round(item.close)
    }

    if (!ohlcv.length) return errorJson(`No OHLCV data for ${ticker}`)

    const last = ohlcv[ohlcv.length - 1]
    const prev = ohlcv.length >= 2 ? ohlcv[ohlcv.length - 2] : last
    const change = Math.round(last.close - prev.close)
    const changePercent = prev.close
      ? Math.round(((change / prev.close) * 100) * 100) / 100
      : 0

    return json({
      info: {
        ticker,
        name: meta.shortName || meta.symbol || ticker,
        market: 'kr',
        sector: null,
        industry: null,
        marketCap: null,
        currency: 'KRW',
      },
      ohlcv,
      currentPrice: last.close,
      change,
      changePercent,
    })
  } catch (e: any) {
    return errorJson(e.message ?? 'Failed to parse KR stock', 500)
  }
}

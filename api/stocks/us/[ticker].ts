import { fetchChart, parseOHLCV, json, errorJson } from '../../_lib/yahoo'

export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const ticker = url.pathname.split('/').pop()!.toUpperCase()
  const period = url.searchParams.get('period') ?? '6mo'

  try {
    const chart = await fetchChart(ticker, period)
    const meta = chart.meta ?? {}
    const ohlcv = parseOHLCV(chart)

    if (!ohlcv.length) return errorJson(`No OHLCV data for ${ticker}`)

    const last = ohlcv[ohlcv.length - 1]
    const prev = ohlcv.length >= 2 ? ohlcv[ohlcv.length - 2] : last
    const change = Math.round((last.close - prev.close) * 100) / 100
    const changePercent = prev.close
      ? Math.round(((change / prev.close) * 100) * 100) / 100
      : 0

    return json({
      info: {
        ticker: ticker,
        name: meta.shortName || meta.symbol || ticker,
        market: 'us',
        sector: null,
        industry: null,
        marketCap: null,
        currency: meta.currency ?? 'USD',
      },
      ohlcv,
      currentPrice: last.close,
      change,
      changePercent,
    })
  } catch (e: any) {
    return errorJson(e.message ?? 'Failed to fetch US stock', 500)
  }
}

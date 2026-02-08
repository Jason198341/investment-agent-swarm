import { fetchChart, parseOHLCV, json, errorJson } from '../../../_lib/yahoo'
import { computeIndicators } from '../../../_lib/indicators'

export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const parts = url.pathname.split('/')
  // /api/market/indicators/{market}/{ticker}
  const ticker = parts[parts.length - 1]
  const market = parts[parts.length - 2]

  try {
    let yahooTicker = ticker.toUpperCase()

    // For KR stocks, try .KS then .KQ suffix
    if (market === 'kr') {
      let chart
      try {
        chart = await fetchChart(`${ticker}.KS`, '1y')
      } catch {
        chart = await fetchChart(`${ticker}.KQ`, '1y')
      }
      const ohlcv = parseOHLCV(chart)
      const closes = ohlcv.map((d) => d.close)
      return json(computeIndicators(closes))
    }

    // US stocks
    const chart = await fetchChart(yahooTicker, '1y')
    const ohlcv = parseOHLCV(chart)
    const closes = ohlcv.map((d) => d.close)
    return json(computeIndicators(closes))
  } catch (e: any) {
    return errorJson(e.message ?? 'Failed to compute indicators', 500)
  }
}

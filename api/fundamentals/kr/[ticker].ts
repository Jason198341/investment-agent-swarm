import { json } from '../../_lib/yahoo'

export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const ticker = url.pathname.split('/').pop()!

  // KR fundamentals not readily available via free APIs
  // Return minimal stub (can be enriched later with KRX API)
  return json({
    ticker,
    pe: null,
    forwardPe: null,
    pb: null,
    ps: null,
    roe: null,
    revenueGrowth: null,
    earningsGrowth: null,
    dividendYield: null,
    debtToEquity: null,
    freeCashFlow: null,
    marketCap: null,
  })
}

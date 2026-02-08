import { fetchChart, json, errorJson } from '../_lib/yahoo'

export const config = { runtime: 'edge' }

export default async function handler() {
  // Try BOK API first if key is set
  const bokKey = process.env.BOK_API_KEY
  if (bokKey) {
    try {
      const result = await fetchFromBOK(bokKey)
      return json(result)
    } catch {
      // fall through to Yahoo
    }
  }

  // Fallback: Yahoo Finance KRW=X
  try {
    const chart = await fetchChart('KRW=X', '5d')
    const closes =
      chart.indicators?.quote?.[0]?.close?.filter(
        (c): c is number => c !== null,
      ) ?? []

    let rate: number | null = null
    for (let i = closes.length - 1; i >= 0; i--) {
      if (closes[i] !== null) {
        rate = Math.round(closes[i] * 100) / 100
        break
      }
    }

    if (rate === null) return errorJson('No exchange rate data', 500)

    return json({
      usdKrw: rate,
      updatedAt: new Date().toISOString(),
      source: 'yfinance',
    })
  } catch (e: any) {
    return errorJson(e.message ?? 'Failed to fetch exchange rate', 500)
  }
}

async function fetchFromBOK(
  apiKey: string,
): Promise<{ usdKrw: number; updatedAt: string; source: string }> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${apiKey}/json/kr/1/1/731Y001/D/${today}/${today}/0000001`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BOK API ${res.status}`)
  const data = await res.json()
  const rows = data?.StatisticSearch?.row
  if (!rows?.length) throw new Error('No BOK data')
  return {
    usdKrw: parseFloat(rows[0].DATA_VALUE),
    updatedAt: new Date().toISOString(),
    source: 'bok',
  }
}

import { fetchIndex, fetchChart, json, errorJson } from '../_lib/yahoo'

export const config = { runtime: 'edge' }

export default async function handler() {
  try {
    // Fetch all indices in parallel
    const [sp500, nasdaq, kospi, kosdaq, vixData, krwChart] = await Promise.all([
      fetchIndex('^GSPC'),
      fetchIndex('^IXIC'),
      fetchIndex('^KS11'),
      fetchIndex('^KQ11'),
      fetchIndex('^VIX'),
      fetchChart('KRW=X', '5d').catch(() => null),
    ])

    // Parse USD/KRW from chart
    let usdKrw = 0
    if (krwChart) {
      const closes =
        krwChart.indicators?.quote?.[0]?.close?.filter(
          (c): c is number => c !== null,
        ) ?? []
      if (closes.length) {
        usdKrw = Math.round(closes[closes.length - 1] * 100) / 100
      }
    }

    return json({
      sp500,
      nasdaq,
      kospi,
      kosdaq,
      vix: vixData.value,
      usdKrw,
      updatedAt: new Date().toISOString(),
    })
  } catch (e: any) {
    return errorJson(e.message ?? 'Failed to fetch market overview', 500)
  }
}

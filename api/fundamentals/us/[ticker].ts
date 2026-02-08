import { fetchQuoteSummary, rawVal, json, errorJson } from '../../_lib/yahoo'

export const config = { runtime: 'edge' }

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const ticker = url.pathname.split('/').pop()!.toUpperCase()

  try {
    const summary = await fetchQuoteSummary(ticker)
    const stats = summary.defaultKeyStatistics ?? {}
    const fin = summary.financialData ?? {}
    const detail = summary.summaryDetail ?? {}
    const priceInfo = summary.price ?? {}

    return json({
      ticker,
      pe: rawVal(detail, 'trailingPE'),
      forwardPe: rawVal(stats, 'forwardPE') ?? rawVal(detail, 'forwardPE'),
      pb: rawVal(stats, 'priceToBook'),
      ps: rawVal(detail, 'priceToSalesTrailing12Months'),
      roe: rawVal(fin, 'returnOnEquity'),
      revenueGrowth: rawVal(fin, 'revenueGrowth'),
      earningsGrowth: rawVal(fin, 'earningsGrowth'),
      dividendYield: rawVal(detail, 'dividendYield'),
      debtToEquity: rawVal(fin, 'debtToEquity'),
      freeCashFlow: rawVal(fin, 'freeCashflow'),
      marketCap: rawVal(priceInfo, 'marketCap'),
    })
  } catch (e: any) {
    return errorJson(e.message ?? 'Failed to fetch fundamentals', 500)
  }
}

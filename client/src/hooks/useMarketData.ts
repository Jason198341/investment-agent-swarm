import { useEffect, useRef } from 'react'
import { useMarketStore } from '@/stores/marketStore'

export function useMarketData(market: 'us' | 'kr', ticker: string, pollInterval = 300_000) {
  const { fetchStock, currentStock, isLoading, error } = useMarketStore((s) => s)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (!ticker) return

    fetchStock(market, ticker)

    intervalRef.current = setInterval(() => {
      fetchStock(market, ticker)
    }, pollInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [market, ticker, pollInterval, fetchStock])

  return { data: currentStock, isLoading, error }
}

export function useOverviewPolling(pollInterval = 300_000) {
  const { fetchOverview, fetchExchangeRate, overview, exchangeRate } = useMarketStore((s) => s)

  useEffect(() => {
    fetchOverview()
    fetchExchangeRate()

    const id = setInterval(() => {
      fetchOverview()
      fetchExchangeRate()
    }, pollInterval)

    return () => clearInterval(id)
  }, [pollInterval, fetchOverview, fetchExchangeRate])

  return { overview, exchangeRate }
}

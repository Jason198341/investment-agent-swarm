import { useEffect, useRef } from 'react'
import { useWatchlistStore } from '@/stores/watchlistStore'
import { useMarketStore } from '@/stores/marketStore'
import { useUIStore } from '@/stores/uiStore'
import { calcIndicators } from '@/lib/indicators'
import * as api from '@/lib/api'

export function useWatchlistAlerts(pollInterval = 60_000) {
  const { items, checkConditions } = useWatchlistStore((s) => s)
  const { addToast } = useUIStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const prevAlertCountRef = useRef(0)

  useEffect(() => {
    if (items.length === 0) return

    const check = async () => {
      for (const item of items) {
        try {
          const data = await api.getStock(item.market, item.ticker, '3mo')
          const indicators = calcIndicators(data.ohlcv)
          const volumes = data.ohlcv.slice(-20).map((d) => d.volume)
          const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
          const lastVolume = data.ohlcv[data.ohlcv.length - 1]?.volume ?? 0

          checkConditions(
            item.ticker,
            data.currentPrice,
            data.changePercent,
            indicators.rsi14 ?? undefined,
            lastVolume,
            avgVolume,
          )
        } catch {
          // silently skip failed checks
        }
      }
    }

    check()
    intervalRef.current = setInterval(check, pollInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [items, pollInterval, checkConditions])

  // Show toast on new alerts
  const { alerts } = useWatchlistStore((s) => s)
  useEffect(() => {
    const activeCount = alerts.filter((a) => !a.dismissed).length
    if (activeCount > prevAlertCountRef.current) {
      const latest = alerts.find((a) => !a.dismissed)
      if (latest) addToast(latest.message, 'warning')
    }
    prevAlertCountRef.current = activeCount
  }, [alerts, addToast])
}

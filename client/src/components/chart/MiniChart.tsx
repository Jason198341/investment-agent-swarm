import { useEffect, useRef } from 'react'
import { createChart, ColorType } from 'lightweight-charts'
import type { OHLCV } from '@/types/market'

interface Props {
  data: OHLCV[]
  width?: number
  height?: number
  positive?: boolean
}

export default function MiniChart({ data, width = 120, height = 40, positive = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false,
      width,
      height,
    })

    const lineSeries = chart.addAreaSeries({
      lineColor: positive ? '#22c55e' : '#ef4444',
      topColor: positive ? '#22c55e22' : '#ef444422',
      bottomColor: 'transparent',
      lineWidth: 1,
    })

    lineSeries.setData(
      data.map((d) => ({ time: d.date as any, value: d.close })),
    )

    chart.timeScale().fitContent()

    return () => chart.remove()
  }, [data, width, height, positive])

  return <div ref={containerRef} />
}

interface Props {
  period: string
  onPeriodChange: (period: string) => void
}

const PERIODS = [
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '6mo', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: '2y', label: '2Y' },
  { value: '5y', label: '5Y' },
]

export default function ChartToolbar({ period, onPeriodChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            period === p.value
              ? 'bg-primary-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

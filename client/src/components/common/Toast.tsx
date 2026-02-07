import { useUIStore } from '@/stores/uiStore'

const TYPE_STYLES = {
  info: 'bg-primary-500/20 border-primary-500/40 text-primary-300',
  success: 'bg-bull-500/20 border-bull-500/40 text-bull-400',
  error: 'bg-bear-500/20 border-bear-500/40 text-bear-400',
  warning: 'bg-caution-500/20 border-caution-500/40 text-caution-400',
}

export default function Toast() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg border text-sm animate-in slide-in-from-right ${TYPE_STYLES[toast.type]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-60 hover:opacity-100 shrink-0"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

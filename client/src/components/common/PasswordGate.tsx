import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'

export default function PasswordGate() {
  const { showPasswordModal, setAiPassword, setShowPasswordModal } = useUIStore((s) => s)
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)

  if (!showPasswordModal) return null

  const handleSubmit = () => {
    if (!pw.trim()) return
    setError(false)
    setAiPassword(pw.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-light border border-surface-border rounded-xl p-6 w-80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">AI 인증</h3>
        <p className="text-xs text-slate-400">AI 분석 기능을 사용하려면 비밀번호를 입력하세요.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="비밀번호"
          autoFocus
          className="w-full px-3 py-2 text-sm rounded-lg bg-surface border border-surface-border text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50"
        />
        {error && <p className="text-xs text-bear-400">비밀번호가 틀렸습니다.</p>}
        <div className="flex gap-2">
          <button
            onClick={() => setShowPasswordModal(false)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-surface-border text-slate-400 hover:text-white transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

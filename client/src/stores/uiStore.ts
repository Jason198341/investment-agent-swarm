import { create } from 'zustand'
import en from '@/data/i18n/en.json'
import ko from '@/data/i18n/ko.json'

type Lang = 'en' | 'ko'
type TranslationMap = Record<string, string>

const translations: Record<Lang, TranslationMap> = { en, ko }

interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

interface UIStore {
  lang: Lang
  sidebarOpen: boolean
  toasts: Toast[]

  setLang: (lang: Lang) => void
  t: (key: string) => string
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

const PREFS_KEY = 'ias_ui_prefs'

function loadPrefs(): { lang: Lang } {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { lang: 'ko' }
}

function savePrefs(prefs: { lang: Lang }) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export const useUIStore = create<UIStore>((set, get) => ({
  lang: loadPrefs().lang,
  sidebarOpen: true,
  toasts: [],

  setLang: (lang) => {
    set({ lang })
    savePrefs({ lang })
  },

  t: (key) => {
    const { lang } = get()
    return translations[lang]?.[key] ?? key
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (message, type = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

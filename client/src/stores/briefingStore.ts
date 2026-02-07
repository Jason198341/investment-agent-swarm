import { create } from 'zustand'
import { chatCompletion } from '@/lib/fireworks'

const STORAGE_KEY = 'ias_briefings'

interface Briefing {
  id: string
  content: string
  createdAt: string
}

function loadBriefings(): Briefing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveBriefings(briefings: Briefing[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(briefings))
}

interface BriefingStore {
  briefings: Briefing[]
  isGenerating: boolean
  currentBriefing: string | null

  generateBriefing: (context: string) => Promise<string>
  clearBriefings: () => void
}

export const useBriefingStore = create<BriefingStore>((set, get) => ({
  briefings: loadBriefings(),
  isGenerating: false,
  currentBriefing: null,

  generateBriefing: async (context) => {
    set({ isGenerating: true })
    try {
      const content = await chatCompletion([
        {
          role: 'system',
          content: `You are a professional financial briefing anchor.
Generate a concise market briefing in Korean (2-3 minutes reading time).
Structure:
1. 시장 개요 (주요 지수 동향)
2. 주요 이슈 (오늘의 핵심 테마)
3. 포트폴리오 점검 (보유 종목 상태)
4. 주목할 이벤트 (향후 일정)

Style: 간결하고 전문적으로. 불필요한 수식어 없이 핵심만.
TTS로 읽힐 텍스트이므로 마크다운 없이 평문으로 작성.`,
        },
        { role: 'user', content: `아래 데이터를 기반으로 오늘의 투자 브리핑을 생성해주세요:\n\n${context}` },
      ], { maxTokens: 2048, temperature: 0.5 })

      const briefing: Briefing = {
        id: Date.now().toString(36),
        content,
        createdAt: new Date().toISOString(),
      }

      set((s) => {
        const briefings = [briefing, ...s.briefings].slice(0, 30)
        saveBriefings(briefings)
        return { briefings, currentBriefing: content, isGenerating: false }
      })

      return content
    } catch (err: any) {
      set({ isGenerating: false })
      throw err
    }
  },

  clearBriefings: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ briefings: [], currentBriefing: null })
  },
}))

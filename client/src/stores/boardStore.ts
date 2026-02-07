import { create } from 'zustand'
import type { BoardPost, BoardFilters, BoardState } from '@/types/board'
import type { SwarmConsensus } from '@/types/agent'

const STORAGE_KEY = 'ias_board_posts'

function loadPosts(): BoardPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePosts(posts: BoardPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

interface BoardStore extends BoardState {
  addPostsFromSwarm: (consensus: SwarmConsensus) => void
  setFilters: (filters: Partial<BoardFilters>) => void
  deletePost: (id: string) => void
  clearPosts: () => void
  getFilteredPosts: () => BoardPost[]
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  posts: loadPosts(),
  latestConsensus: null,
  filters: { market: 'all', agent: 'all', signal: 'all', search: '' },

  addPostsFromSwarm: (consensus) => {
    const newPosts: BoardPost[] = consensus.agents.map((agent) => ({
      id: `${consensus.ticker}-${agent.type}-${Date.now()}`,
      ticker: consensus.ticker,
      name: consensus.ticker,
      market: consensus.market,
      agentType: agent.type,
      signal: agent.meta.signal,
      confidence: agent.meta.confidence,
      markdown: agent.markdown,
      keyFactors: agent.meta.keyFactors,
      risks: agent.meta.risks,
      priceTarget: agent.meta.priceTarget,
      createdAt: new Date().toISOString(),
    }))

    set((s) => {
      const posts = [...newPosts, ...s.posts].slice(0, 200) // keep last 200
      savePosts(posts)
      return { posts, latestConsensus: consensus }
    })
  },

  setFilters: (filters) => {
    set((s) => ({ filters: { ...s.filters, ...filters } }))
  },

  deletePost: (id) => {
    set((s) => {
      const posts = s.posts.filter((p) => p.id !== id)
      savePosts(posts)
      return { posts }
    })
  },

  clearPosts: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ posts: [], latestConsensus: null })
  },

  getFilteredPosts: () => {
    const { posts, filters } = get()
    return posts.filter((p) => {
      if (filters.market !== 'all' && p.market !== filters.market) return false
      if (filters.agent !== 'all' && p.agentType !== filters.agent) return false
      if (filters.signal !== 'all' && p.signal !== filters.signal) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        return p.ticker.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      }
      return true
    })
  },
}))

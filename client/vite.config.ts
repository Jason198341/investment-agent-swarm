import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/fireworks': {
        target: 'https://api.fireworks.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fireworks/, ''),
      },
      '/api/stocks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/exchange': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/fundamentals': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/market': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://article-backend-6o7aa24lb-cqhs-projects-63c79c7e.vercel.app',
        changeOrigin: true
      },
      '^/plagwise/.*': {
        target: 'https://plagwise.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/plagwise/, '')
      }
    }
  }
})

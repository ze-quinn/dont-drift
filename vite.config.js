import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors out of the entry chunk so they cache
        // independently of app-code deploys.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'supabase'
            if (/react|react-dom|react-router/.test(id)) return 'react'
            return 'vendor'
          }
        },
      },
    },
  },
})

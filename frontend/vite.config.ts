import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    include: [
      'lucide-react',
      'recharts',
      'clsx',
      'tailwind-merge',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'canvas-confetti'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

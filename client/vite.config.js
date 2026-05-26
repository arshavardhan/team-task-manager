import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer()
      ],
    },
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['frontend-block-production.up.railway.app']
  }
})
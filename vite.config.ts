import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Static prerender is handled by vite-react-ssg (see src/main.tsx).
// Every route ships as crawlable HTML for Google and AI answer engines.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  ssr: {
    // gsap ships ESM that is safe to externalize during SSG.
    noExternal: ['gsap'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
})

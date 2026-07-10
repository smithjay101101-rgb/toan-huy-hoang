import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Static prerender is handled by vite-react-ssg (see src/main.tsx).
// Every route ships as crawlable HTML for Google and AI answer engines.
export default defineConfig({
  plugins: [react()],
  // Single source of truth for the live origin. The same SITE_URL drives the
  // sitemap (scripts/gen-sitemap.mjs) and the canonical/OG tags (via SITE.url),
  // so they can never disagree. The custom domain (Cloudflare -> GitHub Pages).
  define: {
    __SITE_URL__: JSON.stringify(process.env.SITE_URL || 'https://toanrealestate.com'),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Split the framework libs into their own long-lived, parallel-loaded
        // chunks so they cache across deploys and don't sit in the app chunk.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]react(-dom|-router|-router-dom)?[\\/]|[\\/]scheduler[\\/]/.test(id)) return 'react-vendor'
          if (id.includes('i18next')) return 'i18n'
        },
      },
    },
  },
})

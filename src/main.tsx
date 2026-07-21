import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import { reloadOnceForStaleDeploy } from '@/lib/staleDeploy'
import '@/i18n'
import './styles/index.css'

// A deploy replaces every hashed chunk; a tab loaded before it 404s when it
// lazy-imports a route chunk on navigation. Vite reports that here — reload
// to pick up the new deploy (RouteError covers the loader-data variant).
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (e) => {
    if (reloadOnceForStaleDeploy()) e.preventDefault()
  })
}

// Static prerender entry. vite-react-ssg renders every route to crawlable HTML.
export const createRoot = ViteReactSSG({ routes })

import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import '@/i18n'
import './styles/index.css'

// Static prerender entry. vite-react-ssg renders every route to crawlable HTML.
export const createRoot = ViteReactSSG({ routes })

import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLocale } from '@/lib/locale'
import { CurrencyProvider } from '@/lib/currency'
import Nav from './Nav'
import Footer from './Footer'
import JsonLd from './JsonLd'
import { organizationSchema, realEstateAgentSchema } from '@/lib/schema'

export default function Layout() {
  const locale = useLocale()
  const { pathname } = useLocation()

  // Scroll to top on route change (preserve for in-page anchors only).
  useEffect(() => {
    if (typeof window !== 'undefined' && !pathname.includes('#')) {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return (
    <CurrencyProvider>
      {/* Site-wide structured data for search and answer engines. */}
      <JsonLd data={[realEstateAgentSchema(), organizationSchema()]} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-card focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Nav locale={locale} />
      {/* Keyed by path so each page mounts fresh and fades in (route-fade). */}
      <main id="main" key={pathname} className="route-fade">
        <Outlet />
      </main>
      <Footer locale={locale} />
    </CurrencyProvider>
  )
}

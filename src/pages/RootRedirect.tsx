import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { DEFAULT_LOCALE } from '@/i18n'
import { SITE } from '@/config/site'

/**
 * Root redirects to the default locale. Cloudflare Pages does this at the edge
 * via public/_redirects (a 302 before index.html is ever served). This component
 * covers the client case after hydration and points the canonical at the real
 * locale URL. A meta-refresh is deliberately avoided: as a persistent helmet tag
 * in the SPA it would cause a refresh loop.
 */
const TITLE = 'Toan Huy Hoang - Luxury Real Estate in Da Nang'
const DESCRIPTION =
  'Luxury properties, investment opportunities, and exceptional living in Da Nang, Vietnam. Private guidance from Toan Huy Hoang.'

export default function RootRedirect() {
  const target = `/${DEFAULT_LOCALE}`
  const navigate = useNavigate()

  useEffect(() => {
    navigate(target, { replace: true })
  }, [navigate, target])

  return (
    <Head>
      {/* The bare domain is what people paste into WhatsApp/Zalo/Facebook, so
          this page carries the full social preview, matching /en (Toan approved
          "Toan Huy Hoang - Luxury Real Estate in Da Nang", 2026-11). */}
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <link rel="canonical" href={SITE.url + target} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={SITE.url + target} />
      <meta property="og:image" content={SITE.url + SITE.ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={SITE.url + SITE.ogImage} />
    </Head>
  )
}

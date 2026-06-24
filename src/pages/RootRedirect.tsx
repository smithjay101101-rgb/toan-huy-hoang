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
export default function RootRedirect() {
  const target = `/${DEFAULT_LOCALE}`
  const navigate = useNavigate()

  useEffect(() => {
    navigate(target, { replace: true })
  }, [navigate, target])

  return (
    <Head>
      <title>Toan Huy Hoang. Luxury Real Estate in Da Nang.</title>
      <link rel="canonical" href={SITE.url + target} />
    </Head>
  )
}

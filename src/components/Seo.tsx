import { Head } from 'vite-react-ssg'
import { useLocation } from 'react-router-dom'
import { SITE } from '@/config/site'
import { LOCALES, swapLocaleInPath, type Locale } from '@/i18n'
import { localeFromPath } from '@/lib/locale'

interface SeoProps {
  title: string
  description: string
  image?: string
  /** Override the canonical path (defaults to current path). */
  path?: string
  type?: 'website' | 'article'
}

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', vi: 'vi_VN' }

/**
 * Per page title, description, Open Graph, canonical, and full hreflang set
 * (each locale links to its twin plus x-default to EN). Rendered into static
 * HTML by vite-react-ssg so crawlers and answer engines read it directly.
 */
export default function Seo({ title, description, image, path, type = 'website' }: SeoProps) {
  const { pathname } = useLocation()
  const current = path ?? pathname
  const locale = localeFromPath(current)
  const url = SITE.url + current
  const img = SITE.url + (image ?? SITE.ogImage)

  return (
    <Head>
      <html lang={locale} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {LOCALES.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={SITE.url + swapLocaleInPath(current, l)}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={SITE.url + swapLocaleInPath(current, 'en')} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content={OG_LOCALE[locale]} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </Head>
  )
}

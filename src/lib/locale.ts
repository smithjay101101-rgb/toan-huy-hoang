import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import i18n, { DEFAULT_LOCALE, isLocale, swapLocaleInPath, type Locale } from '@/i18n'
import { getListingBySlug, slugFor } from '@/data'
import { getGuideBySlug, guideSlugFor } from '@/data/guides'

/** Read the active locale from the first path segment. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0]
  return isLocale(first) ? first : DEFAULT_LOCALE
}

/**
 * Hook used inside the router. Returns the current locale and keeps the shared
 * i18n instance in sync so prerender and client render agree.
 */
export function useLocale(): Locale {
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)
  // Keep i18n in sync synchronously on first run during SSG.
  if (i18n.language !== locale) {
    i18n.changeLanguage(locale)
  }
  useEffect(() => {
    if (i18n.language !== locale) i18n.changeLanguage(locale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])
  return locale
}

/** Build a locale-prefixed path. localePath('en', 'buy') -> '/en/buy' */
export function localePath(locale: Locale, sub = ''): string {
  const clean = sub.replace(/^\/+/, '')
  return clean ? `/${locale}/${clean}` : `/${locale}`
}

/**
 * The equivalent of the current path in another locale — the single source of
 * truth for every language switcher. Detail pages map their slug to the
 * TARGET locale's own slug (localized URLs); guides missing in the target
 * locale fall back to that language's guides index; everything else just
 * swaps the locale prefix.
 */
export function localeHref(pathname: string, target: Locale): string {
  const propSlug = pathname.match(/^\/[a-z]{2}\/property\/([^/]+)\/?$/)?.[1]
  if (propSlug) {
    const listing = getListingBySlug(decodeURIComponent(propSlug))
    if (listing) return localePath(target, `property/${slugFor(listing, target)}`)
  }
  const guideSlug = pathname.match(/^\/[a-z]{2}\/guides\/([^/]+)\/?$/)?.[1]
  if (guideSlug) {
    const guide = getGuideBySlug(decodeURIComponent(guideSlug))
    if (guide) {
      return guide.locales[target]
        ? localePath(target, `guides/${guideSlugFor(guide, target)}`)
        : localePath(target, 'guides')
    }
  }
  return swapLocaleInPath(pathname, target)
}

import { Link, useLocation } from 'react-router-dom'
import { LOCALES, LOCALE_LABEL, swapLocaleInPath, type Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { getGuideBySlug } from '@/data/guides'

/**
 * Language switch that preserves the current path in the target locale. Guides
 * only exist in the locales they are translated into, so on a guide page the
 * switch sends missing locales to that language's guides index instead of a
 * URL that would 404 on the static host.
 */
export default function LanguageSwitcher({ current }: { current: Locale }) {
  const { pathname } = useLocation()
  const guideSlug = pathname.match(/^\/[a-z]{2}\/guides\/([^/]+)$/)?.[1]
  const guide = guideSlug ? getGuideBySlug(guideSlug) : undefined
  const hrefFor = (l: Locale) =>
    guide && !guide.locales[l] ? localePath(l, 'guides') : swapLocaleInPath(pathname, l)
  return (
    <div className="flex items-center gap-1 text-[0.7rem] font-medium tracking-[0.18em]" aria-label="Language">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-text/30">/</span>}
          {l === current ? (
            <span aria-current="true" className="px-1 py-2.5 text-gold">
              {LOCALE_LABEL[l]}
            </span>
          ) : (
            // Padded tap area: the visible label is small, the target is not.
            <Link
              to={hrefFor(l)}
              className="px-1 py-2.5 text-text/55 transition-colors duration-200 hover:text-text"
              hrefLang={l}
            >
              {LOCALE_LABEL[l]}
            </Link>
          )}
        </span>
      ))}
    </div>
  )
}

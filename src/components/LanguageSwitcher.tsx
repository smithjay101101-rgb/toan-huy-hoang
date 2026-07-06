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
export default function LanguageSwitcher({ current, compact = false }: { current: Locale; compact?: boolean }) {
  const { pathname } = useLocation()
  const guideSlug = pathname.match(/^\/[a-z]{2}\/guides\/([^/]+)$/)?.[1]
  const guide = guideSlug ? getGuideBySlug(guideSlug) : undefined
  const hrefFor = (l: Locale) =>
    guide && !guide.locales[l] ? localePath(l, 'guides') : swapLocaleInPath(pathname, l)
  // Touch contexts (mobile menu, footer) get 44x44 tap boxes with an 8px gap.
  // The desktop nav bar passes `compact`: mouse context on a tight horizontal
  // budget — the wide boxes there squeeze the menu until VI labels wrap.
  const boxCls = compact
    ? 'px-1 py-2.5'
    : 'flex min-h-[44px] min-w-[44px] items-center justify-center px-1'
  const gapCls = compact ? 'gap-1' : 'gap-2'
  return (
    <div
      className={`flex items-center ${gapCls} ${compact ? 'text-[0.7rem]' : 'text-[0.72rem]'} font-medium tracking-[0.18em]`}
      aria-label="Language"
    >
      {LOCALES.map((l, i) => (
        <span key={l} className={`flex items-center ${gapCls}`}>
          {i > 0 && <span className="text-text/30">/</span>}
          {l === current ? (
            <span aria-current="true" className={`${boxCls} text-gold`}>
              {LOCALE_LABEL[l]}
            </span>
          ) : (
            <Link
              to={hrefFor(l)}
              className={`${boxCls} text-text/55 transition-colors duration-200 hover:text-text`}
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

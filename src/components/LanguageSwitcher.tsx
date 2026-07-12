import { Link, useLocation } from 'react-router-dom'
import { LOCALES, LOCALE_LABEL, type Locale } from '@/i18n'
import { localeHref } from '@/lib/locale'

/**
 * Language switch that preserves the current page in the target locale.
 * localeHref maps detail-page slugs to each locale's own slug and sends
 * guides missing in a locale to that language's guides index.
 */
export default function LanguageSwitcher({ current, compact = false }: { current: Locale; compact?: boolean }) {
  const { pathname } = useLocation()
  const hrefFor = (l: Locale) => localeHref(pathname, l)
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

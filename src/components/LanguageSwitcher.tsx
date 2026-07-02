import { Link, useLocation } from 'react-router-dom'
import { LOCALES, LOCALE_LABEL, swapLocaleInPath, type Locale } from '@/i18n'

/** EN | VI switch that preserves the current path in the other locale. */
export default function LanguageSwitcher({ current }: { current: Locale }) {
  const { pathname } = useLocation()
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
              to={swapLocaleInPath(pathname, l)}
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

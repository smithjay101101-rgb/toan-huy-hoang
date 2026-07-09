import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { LOCALES, LOCALE_LABEL, swapLocaleInPath, type Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { getGuideBySlug } from '@/data/guides'

/**
 * Mobile-only language control for the top bar, sitting beside the hamburger.
 * Frosted like the hero's Buy Property CTA (white hairline over blurred glass,
 * reads on the transparent-over-hero and the condensed-dark states alike). Taps
 * open a small dropdown of the four locales; picking one preserves the current
 * path (guides fall back to the guides index in languages they lack).
 */
export default function NavLocaleButton({ current }: { current: Locale }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on route change and on a tap outside.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const guideSlug = pathname.match(/^\/[a-z]{2}\/guides\/([^/]+)$/)?.[1]
  const guide = guideSlug ? getGuideBySlug(guideSlug) : undefined
  const hrefFor = (l: Locale) =>
    guide && !guide.locales[l] ? localePath(l, 'guides') : swapLocaleInPath(pathname, l)

  return (
    <div ref={ref} className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-[2px] text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white"
        style={{
          minHeight: 44,
          padding: '0 14px',
          border: '1px solid rgba(255,255,255,0.65)',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        {LOCALE_LABEL[current]}
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[96px] overflow-hidden rounded-[2px] border"
          style={{
            borderColor: 'rgba(255,255,255,0.18)',
            background: 'rgba(13,22,30,0.97)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
          }}
        >
          {LOCALES.map((l) =>
            l === current ? (
              <span
                key={l}
                aria-current="true"
                className="block px-4 py-3 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-gold"
              >
                {LOCALE_LABEL[l]}
              </span>
            ) : (
              <Link
                key={l}
                to={hrefFor(l)}
                hrefLang={l}
                className="block px-4 py-3 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-text/80 transition-colors hover:bg-white/5 hover:text-text"
              >
                {LOCALE_LABEL[l]}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  )
}

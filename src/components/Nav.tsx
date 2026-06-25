import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import LanguageSwitcher from './LanguageSwitcher'
import ZaloButton from './ZaloButton'
import WhatsAppButton from './WhatsAppButton'

const ITEMS = [
  { key: 'buy', sub: 'buy' },
  { key: 'rent', sub: 'rent' },
  { key: 'projects', sub: 'projects' },
  { key: 'about', sub: 'about' },
  { key: 'contact', sub: 'contact' },
] as const

export default function Nav({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // Apple-style sticky header: transparent over the hero, condenses to a
  // frosted dark bar as soon as the page moves (scrollY > 40).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname])

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Pages that open on a light (cream) section have no dark header for the
  // transparent nav to sit over, so the nav gets a solid dark bar at the top
  // there (a light frost isn't dark enough for the white nav text on cream).
  const lightTop = pathname.endsWith('/about')
  const condensed = scrolled || open || lightTop
  const headerBg = !condensed
    ? 'rgba(13,22,30,0)'
    : lightTop && !scrolled
      ? 'rgba(13,22,30,0.94)'
      : 'rgba(13,22,30,0.72)'
  const isActive = (sub: string) => pathname.startsWith(localePath(locale, sub))

  return (
    <>
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        background: headerBg,
        backdropFilter: condensed ? 'blur(16px) saturate(140%)' : 'none',
        WebkitBackdropFilter: condensed ? 'blur(16px) saturate(140%)' : 'none',
        borderBottom: `1px solid ${condensed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0)'}`,
        transition: 'background .35s ease, border-color .35s ease',
      }}
    >
      <nav
        className="container-lux flex items-center justify-between"
        style={{
          paddingTop: scrolled ? 16 : 26,
          paddingBottom: scrolled ? 16 : 26,
          transition: 'padding .35s ease',
        }}
      >
        <Link
          to={localePath(locale)}
          className="font-display text-[1.05rem] font-semibold uppercase tracking-[0.28em] text-text"
          aria-label={t('footer.signature')}
        >
          Toan Huy Hoang
        </Link>

        {/* Desktop menu */}
        <div className="hidden items-center gap-9 lg:flex">
          <ul className="flex items-center gap-8">
            {ITEMS.map((it) => (
              <li key={it.key}>
                <Link
                  to={localePath(locale, it.sub)}
                  className={`text-[0.82rem] font-normal tracking-[0.04em] transition-colors duration-200 hover:text-gold ${
                    isActive(it.sub) ? 'text-gold' : 'text-text/85'
                  }`}
                >
                  {t(`nav.${it.key}`)}
                </Link>
              </li>
            ))}
          </ul>
          <span className="h-4 w-px bg-line" aria-hidden="true" />
          <LanguageSwitcher current={locale} />
          <ZaloButton />
          <WhatsAppButton />
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className="flex items-center justify-center text-text lg:hidden"
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label={open ? t('nav.close') : t('nav.menu')}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </nav>
    </header>

      {/* Mobile overlay. Rendered as a sibling of the header (not a child) so its
          fixed positioning resolves to the viewport: the header's backdrop-filter
          would otherwise become the containing block and trap it. */}
      {open && (
        <div
          className="fixed left-0 right-0 top-0 z-40 lg:hidden"
          style={{
            height: '100dvh',
            background: 'rgba(13,22,30,0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="container-lux flex h-full flex-col justify-between pb-12 pt-28">
            <ul className="flex flex-col gap-2">
              {ITEMS.map((it) => (
                <li key={it.key}>
                  <Link
                    to={localePath(locale, it.sub)}
                    className={`block py-3 font-display text-3xl tracking-[0.04em] ${
                      isActive(it.sub) ? 'text-gold' : 'text-text'
                    }`}
                  >
                    {t(`nav.${it.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line pt-6">
              <LanguageSwitcher current={locale} />
              <div className="flex items-center gap-3">
                <ZaloButton />
                <WhatsAppButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

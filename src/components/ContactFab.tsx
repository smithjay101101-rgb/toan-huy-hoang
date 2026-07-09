import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'

/**
 * Floating "Contact" pill for phones, pinned in the thumb zone above the safe
 * area. Frosted dark glass (not the hero's white glass): it floats over cream
 * sections too, where white-on-white would vanish. Hidden on desktop
 * (channels live in the nav), on the contact page itself, and on property
 * pages (they carry their own fixed inquiry bar).
 */
export default function ContactFab({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  if (pathname.includes('/property/') || pathname.endsWith('/contact')) return null
  return (
    <Link
      to={localePath(locale, 'contact')}
      className="btn fixed z-30 lg:hidden"
      style={{
        right: 16,
        bottom: 'calc(20px + env(safe-area-inset-bottom))',
        minHeight: 48,
        padding: '13px 26px',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.65)',
        background: 'rgba(13,22,30,0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
      }}
    >
      {t('nav.contact')}
    </Link>
  )
}

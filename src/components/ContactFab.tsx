import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@/i18n'
import { contactFor } from '@/config/site'
import { ChannelIcon } from './icons'

/**
 * Floating one-tap contact button for phones: the locale's primary channel,
 * pinned in the thumb zone above the safe area. Hidden on desktop (channels
 * live in the nav), on the contact page (the page IS the contact actions),
 * and on property pages (they carry their own fixed inquiry bar).
 */
export default function ContactFab({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  if (pathname.includes('/property/') || pathname.endsWith('/contact')) return null
  const ch = contactFor(locale).channels[0]
  const external = ch.href.startsWith('http')
  return (
    <a
      href={ch.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={t('detail.inquireOn', { channel: ch.label })}
      className="fixed z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-bg shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-colors hover:bg-gold-2 lg:hidden"
      style={{ right: 16, bottom: 'calc(20px + env(safe-area-inset-bottom))' }}
    >
      <ChannelIcon kind={ch.kind} size={26} />
    </a>
  )
}

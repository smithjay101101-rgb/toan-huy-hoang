import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import type { Locale } from '@/i18n'
import { consultChannelsFor } from '@/config/site'
import { ChannelIcon } from './icons'

/**
 * "Book a Consultation" popup: each locale leads with the messengers its
 * audience actually uses (see CONSULT_CHANNELS in src/config/site.ts).
 * Rendered only after a click, so it never exists in the prerendered HTML.
 */
export default function ConsultModal({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const { t } = useTranslation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('consult.title')}
      className="fixed inset-0 z-[100] flex items-center justify-center p-5"
      style={{
        background: 'rgba(10, 16, 22, 0.82)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] bg-card"
        style={{ color: '#eef0f0', fontFamily: "'Jost', sans-serif", padding: '48px 40px 40px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          autoFocus
          aria-label="Close"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-white/70 transition-colors duration-200 hover:text-gold-2"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="text-[12px] uppercase" style={{ letterSpacing: '0.3em', color: 'var(--gold-2)', marginBottom: 14 }}>
          {t('footer.eyebrow')}
        </div>
        <h3 className="font-display font-semibold" style={{ fontSize: 26, lineHeight: 1.15 }}>
          {t('consult.title')}
        </h3>
        <p className="mt-3 text-[14px] font-light leading-[1.7]" style={{ color: 'rgba(238,240,240,0.72)' }}>
          {t('consult.body')}
        </p>

        <div className="mt-7 flex flex-col gap-3">
          {consultChannelsFor(locale, t('contact.prefill')).map((ch) => (
            <a
              key={ch.kind}
              href={ch.href}
              target={ch.href.startsWith('http') ? '_blank' : undefined}
              rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center justify-center gap-3 border border-white/25 px-6 text-[13px] font-semibold uppercase tracking-[0.22em] transition-colors duration-200 hover:border-gold-2 hover:text-gold-2"
              style={{ minHeight: 52 }}
            >
              <ChannelIcon kind={ch.kind} size={18} />
              {ch.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

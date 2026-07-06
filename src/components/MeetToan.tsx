import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { mediaSrcSet } from '@/lib/media'

/**
 * Section 3 — "Meet Toan". A cream, light-on-dark-relief tonal break between the
 * coastal photography above and the slate footer below. Two columns: portrait
 * slot and the agent introduction with two headline stats.
 */
export default function MeetToan({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  return (
    <section className="bg-cream text-ink" style={{ fontFamily: "'Jost', sans-serif" }}>
      <div className="grid items-start lg:grid-cols-2">
        {/* Founder portrait (Toan). The 2:3 studio portrait is center-cropped by
            object-cover to fill the section's fixed ratio box; the subject sits
            centered with headroom, so no face or hands are lost in the crop. */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '120 / 149', background: '#e7ddcb' }}>
          <picture>
            <source
              srcSet={mediaSrcSet('/media/toan-portrait', 'avif')}
              type="image/avif"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <source
              srcSet={mediaSrcSet('/media/toan-portrait', 'webp')}
              type="image/webp"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <img
              src="/media/toan-portrait.jpg"
              alt={t('meet.name')}
              width={1066}
              height={1600}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </picture>
        </div>

        <div
          className="flex flex-col justify-center"
          style={{ padding: '120px clamp(40px,7vw,120px)' }}
        >
          <p
            className="text-[13px] uppercase"
            style={{ letterSpacing: '0.4em', color: 'var(--gold-ink)', marginBottom: 28 }}
          >
            {t('meet.eyebrow')}
          </p>
          <h2
            className="font-display font-semibold"
            style={{ fontSize: 'clamp(44px,5vw,76px)', lineHeight: 1.02, letterSpacing: '0.01em', marginBottom: 32 }}
          >
            {t('meet.name')}
          </h2>
          <p style={{ maxWidth: '32ch', fontSize: 19, lineHeight: 1.7, fontWeight: 300, color: 'var(--cream-muted)' }}>
            {t('meet.bio')}
          </p>

          <div className="flex" style={{ gap: 56, marginTop: 48 }}>
            <div>
              <div className="font-display font-semibold" style={{ fontSize: 44, lineHeight: 1 }}>
                12<span style={{ color: 'var(--gold-ink)' }}>+</span>
              </div>
              <div className="text-[12px] uppercase" style={{ letterSpacing: '0.2em', color: 'var(--cream-faint)', marginTop: 8 }}>
                {t('meet.statYears')}
              </div>
            </div>
            <div>
              <div className="font-display font-semibold" style={{ fontSize: 44, lineHeight: 1 }}>
                1,000<span style={{ color: 'var(--gold-ink)' }}>+</span>
              </div>
              <div className="text-[12px] uppercase" style={{ letterSpacing: '0.2em', color: 'var(--cream-faint)', marginTop: 8 }}>
                {t('meet.statHomes')}
              </div>
            </div>
          </div>

          <Link
            to={localePath(locale, 'contact')}
            className="mt-[52px] inline-flex items-center gap-3 self-start bg-ink px-[38px] py-[17px] text-[13px] font-medium uppercase tracking-[0.22em] text-white transition-colors duration-200 hover:bg-gold-ink"
          >
            {t('meet.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowDown } from 'lucide-react'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { mediaSrcSet } from '@/lib/media'

/**
 * Full viewport hero. The poster still is the LCP element: it is eager, painted
 * immediately, and sits behind the headline. Content is top-anchored just below
 * the fixed nav, per the approved Da Nang hero handoff.
 */
export default function Hero({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: 'max(100dvh, 720px)', background: '#0d1a24' }}
    >
      {/* Poster / LCP. Da Nang beachfront skyline (Higgsfield, 4K), ~3pm grade. */}
      <picture>
        <source srcSet={mediaSrcSet('/media/hero-city', 'avif')} type="image/avif" sizes="100vw" />
        <source srcSet={mediaSrcSet('/media/hero-city', 'webp')} type="image/webp" sizes="100vw" />
        <img
          src="/media/hero-city.jpg"
          alt=""
          aria-hidden="true"
          width={1800}
          height={1013}
          {...{ fetchpriority: 'high' }}
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {/* Vertical readability scrim. The content is top-anchored, so the middle
          band stays dark enough for the white subhead to hold WCAG AA in
          daylight; text shadows below do the rest. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,16,24,0.6) 0%, rgba(8,16,24,0.32) 45%, rgba(8,16,24,0.42) 100%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      <div
        className="container-lux relative z-10"
        style={{ paddingTop: 'clamp(150px, 20vh, 210px)' }}
      >
        <h1
          className="font-display font-semibold text-text"
          style={{
            fontSize: 'clamp(64px, 9vw, 148px)',
            // 1.03, not tighter: Vietnamese stacked diacritics (Đà Nẵng) and
            // Korean glyphs clip against the line above below ~1.0.
            lineHeight: 1.03,
            letterSpacing: '0.01em',
            textShadow: '0 4px 40px rgba(0,0,0,0.45)',
          }}
        >
          <span className="block uppercase">{t('hero.line1')}</span>
          <span className="block uppercase">{t('hero.line2')}</span>
          <span className="block">{t('hero.line3')}</span>
        </h1>

        <p
          style={{
            maxWidth: 640,
            marginTop: 36,
            fontSize: 20,
            lineHeight: 1.6,
            fontWeight: 400,
            color: '#fff',
            textShadow: '0 2px 20px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7)',
          }}
        >
          {t('hero.subhead')}
        </p>

        <div className="flex flex-wrap" style={{ marginTop: 44, gap: 20 }}>
          <Link to={localePath(locale, 'buy')} className="btn btn-frost">
            {t('hero.buy')}
          </Link>
          <Link to={localePath(locale, 'rent')} className="btn btn-frost">
            {t('hero.rent')}
          </Link>
        </div>
      </div>

      <div
        className="absolute inset-x-0 z-10 flex justify-center"
        style={{ bottom: 30, color: 'rgba(255,255,255,0.85)' }}
        aria-hidden="true"
      >
        <span className="flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.3em]">
          {t('hero.scroll')}
          <ArrowDown size={16} strokeWidth={1.5} className="animate-bounce" />
        </span>
      </div>
    </section>
  )
}

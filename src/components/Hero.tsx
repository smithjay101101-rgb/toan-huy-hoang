import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowDown } from 'lucide-react'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'

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
        <source srcSet="/media/hero-city.avif" type="image/avif" />
        <source srcSet="/media/hero-city.webp" type="image/webp" />
        <img
          src="/media/hero-city.jpg"
          alt=""
          aria-hidden="true"
          width={2600}
          height={1463}
          {...{ fetchpriority: 'high' }}
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {/* Vertical readability scrim. Keeps the bright daytime image bright;
          legibility comes mostly from the text shadows below. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,16,24,0.55) 0%, rgba(8,16,24,0.15) 35%, rgba(8,16,24,0.35) 100%)',
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
            lineHeight: 0.96,
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

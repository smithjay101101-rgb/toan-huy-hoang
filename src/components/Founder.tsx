import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'

/** A fine gold signature mark. SVG, never a font, so it stays crisp. */
function SignatureMark() {
  return (
    <svg width="180" height="48" viewBox="0 0 180 48" fill="none" aria-hidden="true" className="text-gold">
      <path
        d="M6 34c14-2 22-18 30-18s4 18 14 18 16-22 26-22 6 22 16 22 18-16 30-18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M150 12c8 0 12 6 12 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export default function Founder() {
  const { t } = useTranslation()
  const stats = [
    t('founder.stats.years', { returnObjects: true }) as { value: string; label: string },
    t('founder.stats.listings', { returnObjects: true }) as { value: string; label: string },
    t('founder.stats.districts', { returnObjects: true }) as { value: string; label: string },
  ]

  return (
    <section className="bg-bg-2">
      <div className="container-lux grid items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20 lg:py-40">
        {/* Portrait. SWAP: replace with high resolution dark-friendly portrait. */}
        <Reveal className="order-1 lg:order-none">
          <div className="relative">
            <img
              src="/placeholders/founder.svg"
              alt="Toan Huy Hoang"
              width={1200}
              height={1500}
              loading="lazy"
              decoding="async"
              className="w-full rounded-[4px] border border-line object-cover"
              style={{ aspectRatio: '4 / 5' }}
            />
            <div className="absolute -bottom-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </Reveal>

        <Reveal stagger>
          <p className="eyebrow">{t('founder.eyebrow')}</p>
          <h2 className="mt-5 max-w-[16ch] font-display text-text" style={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3.5rem)' }}>
            {t('founder.headline')}
          </h2>
          <p className="mt-6 max-w-prose text-muted">{t('founder.body')}</p>

          <blockquote className="mt-8 border-l border-gold pl-6">
            <p className="font-display text-lg leading-relaxed text-text/90" style={{ fontStyle: 'italic' }}>
              {t('founder.quote')}
            </p>
          </blockquote>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl text-gold lg:text-4xl">{s.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <SignatureMark />
            <p className="mt-1 font-display text-sm uppercase tracking-[0.28em] text-text/80">
              {t('founder.name')}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

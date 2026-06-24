import { useTranslation } from 'react-i18next'
import Reveal from './Reveal'

/**
 * Second section: the Son Tra peninsula coastline. A single full-bleed
 * photograph (regenerated from the real reference to keep the true coastline,
 * road, and resort layout), graded to just before golden hour. Static and
 * restrained, no video.
 */
export default function CoastSection() {
  const { t } = useTranslation()
  return (
    <section className="relative bg-bg" aria-label={t('coast.eyebrow')}>
      <div className="relative h-[84vh] min-h-[520px] overflow-hidden">
        <picture>
          <source srcSet="/media/coast-cove.avif" type="image/avif" />
          <source srcSet="/media/coast-cove.webp" type="image/webp" />
          <img
            src="/media/coast-cove.jpg"
            alt="The Son Tra peninsula coastline, Da Nang, at golden hour"
            width={2200}
            height={1238}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>

        {/* Readability scrim, darker at the bottom where the caption sits. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,7,7,0.4) 0%, transparent 28%, rgba(7,7,7,0.45) 66%, rgba(7,7,7,0.92) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="container-lux absolute inset-x-0 bottom-0 z-10 pb-14 lg:pb-20">
          <Reveal stagger>
            <p className="eyebrow">{t('coast.eyebrow')}</p>
            {/* Subtle, thick statement. Restrained size, heavy weight. */}
            <h2
              className="mt-4 max-w-[26ch] font-display font-bold text-text"
              style={{ fontSize: 'clamp(1.25rem, 1rem + 0.9vw, 1.75rem)', lineHeight: 1.25, letterSpacing: '0.01em' }}
            >
              {t('coast.headline')}
            </h2>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

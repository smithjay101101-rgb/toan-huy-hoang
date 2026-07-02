import type { ReactNode } from 'react'

export interface HeaderImage {
  jpg: string
  webp?: string
  avif?: string
  alt?: string
}

/**
 * Inner-page header. Two modes:
 *  - text (default): editorial eyebrow + serif headline on the dark page.
 *  - photo: pass `image` for a full-bleed cinematic header in the homepage's
 *    language (scrim + gold eyebrow + white serif headline, bottom-aligned).
 */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  image,
  children,
}: {
  eyebrow?: string
  title: string
  lead?: string
  image?: HeaderImage
  children?: ReactNode
}) {
  if (image) {
    return (
      <header
        className="relative overflow-hidden"
        style={{ minHeight: 'clamp(440px, 62vh, 620px)', background: 'var(--bg)' }}
      >
        <picture>
          {image.avif && <source srcSet={image.avif} type="image/avif" />}
          {image.webp && <source srcSet={image.webp} type="image/webp" />}
          <img
            src={image.jpg}
            alt={image.alt ?? ''}
            aria-hidden={image.alt ? undefined : 'true'}
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
          />
        </picture>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(13,26,36,0.62) 0%, rgba(13,26,36,0.16) 32%, rgba(13,26,36,0.82) 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="container-lux relative z-10 flex flex-col justify-end"
          style={{ minHeight: 'clamp(440px, 62vh, 620px)', paddingTop: 140, paddingBottom: 84 }}
        >
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1
            className="mt-5 max-w-[18ch] font-display font-semibold text-text"
            style={{ fontSize: 'clamp(2.5rem, 1.6rem + 4vw, 5rem)', lineHeight: 1.0, letterSpacing: '0.01em', textShadow: '0 4px 40px rgba(0,0,0,0.45)' }}
          >
            {title}
          </h1>
          {lead && (
            <p
              className="mt-6 max-w-[52ch] text-text"
              style={{ fontSize: 'clamp(1.05rem, 1rem + 0.4vw, 1.3rem)', lineHeight: 1.6, fontWeight: 300, textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}
            >
              {lead}
            </p>
          )}
          {children}
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-line">
      <div className="container-lux pb-14 pt-36 lg:pb-20 lg:pt-48">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-[18ch] font-display text-text" style={{ fontSize: 'clamp(2.25rem, 1.6rem + 3.4vw, 4.5rem)', lineHeight: 1.04 }}>
          {title}
        </h1>
        {lead && <p className="lead mt-6">{lead}</p>}
        {children}
      </div>
    </header>
  )
}

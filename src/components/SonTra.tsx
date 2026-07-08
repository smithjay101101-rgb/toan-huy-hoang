import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Locale } from '@/i18n'
import { listings } from '@/data'
import { localePath } from '@/lib/locale'
import { formatPriceParts, pick } from '@/lib/format'
import { useCurrency } from '@/lib/currency'
import { mediaSrcSet } from '@/lib/media'
import { localizeDistrict } from '@/data/locations'
import PropertyImage from './PropertyImage'

/**
 * Section 2 — the Son Tra peninsula. A full-viewport coastline photograph with
 * a scroll-driven headline that travels down and fades through the section, plus
 * a frosted-glass card featuring the single most exclusive Son Tra listing.
 *
 * The scroll/reveal animation writes to the DOM directly through refs rather than
 * React state, so the section never re-renders while scrolling. Respects
 * prefers-reduced-motion. The static (SSR / no-JS) markup shows the headline
 * settled and visible.
 */
export default function SonTra({ locale }: { locale: Locale }) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const headRef = useRef<HTMLHeadingElement | null>(null)

  // The hero listing for the card: always the single most expensive property
  // site-wide (developments excluded). Auto-selected by price, no manual flag.
  const listing = useMemo(() => {
    // Rented/sold properties never headline the homepage.
    const active = listings.filter((l) => !l.availability)
    const houses = active.filter((l) => l.category !== 'Project')
    const pool = houses.length ? houses : active.length ? active : listings
    return [...pool].sort((a, b) => b.price - a.price)[0]
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    const head = headRef.current
    const img = imgRef.current
    if (!el || !head) return

    const mobile = window.matchMedia('(max-width: 1023px)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // On mobile (and reduced-motion) the headline is static so it never travels
    // down into the listing card. Scroll-driven travel is desktop-only.
    if (reduce || mobile) {
      if (img) img.style.transform = 'scale(1)'
      head.style.transform = mobile ? 'translateY(13vh)' : 'translateY(calc(58vh - 40px))'
      head.style.opacity = '1'
      return
    }

    // Scale-in on first reveal.
    let io: IntersectionObserver | undefined
    if (img && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting && img) img.style.transform = 'scale(1)' }),
        { threshold: 0.35 },
      )
      io.observe(el)
    } else if (img) {
      img.style.transform = 'scale(1)'
    }

    // Scroll-driven headline travel + fade envelope. Direct DOM writes, rAF-throttled.
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const prog = Math.max(0, Math.min(1, (vh - r.top) / (r.height + vh)))
      const topPct = 12 + prog * 58 // travels 12vh -> 70vh
      const fadeIn = Math.min(1, prog / 0.12)
      const fadeOut = Math.min(1, (1 - prog) / 0.16)
      // transform (compositor-friendly) + scroll-linked opacity, no CSS
      // transition, so the motion tracks the scroll position exactly.
      head.style.transform = `translateY(calc(${topPct.toFixed(2)}vh - 40px))`
      head.style.opacity = String(Math.max(0, Math.min(fadeIn, fadeOut)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()

    return () => {
      io?.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const href = localePath(locale, `property/${listing.slug}`)
  // The featured card leads with its price (toggled currency first).
  const { currency } = useCurrency()
  const { usd, vnd } = formatPriceParts(listing, locale)
  const cardPrice =
    listing.price > 0 ? (currency === 'vnd' && vnd ? vnd : usd) : t('listings.priceOnRequest')

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: 'max(100vh, 720px)', background: 'var(--bg)', fontFamily: "'Jost', sans-serif" }}
      aria-label={t('coast.eyebrow')}
    >
      <picture>
        <source srcSet={mediaSrcSet('/media/coast-cove', 'avif')} type="image/avif" sizes="100vw" />
        <source srcSet={mediaSrcSet('/media/coast-cove', 'webp')} type="image/webp" sizes="100vw" />
        <img
          ref={imgRef}
          src="/media/coast-cove.jpg"
          alt="The Son Tra peninsula coastline, Da Nang, at golden hour"
          width={1760}
          height={990}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: 'scale(1.08)', transition: 'transform 1.6s cubic-bezier(0.2,0.7,0.2,1)' }}
        />
      </picture>

      {/* Diagonal readability scrim, kept light so the photo stays bright. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, rgba(8,16,24,0.45) 0%, rgba(8,16,24,0.05) 38%, rgba(8,16,24,0) 60%)',
        }}
        aria-hidden="true"
      />

      {/* Top seam: dark-to-dark blend from the hero above. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: '20vh',
          background: 'linear-gradient(180deg, #0d1a24 0%, rgba(13,26,36,0) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Scroll-driven headline. */}
      <div className="pointer-events-none absolute inset-0 z-[3] text-text">
        <h2
          ref={headRef}
          className="absolute font-display font-semibold"
          style={{
            top: 0,
            left: 'clamp(24px, 5vw, 56px)',
            transform: 'translateY(13vh)',
            willChange: 'transform, opacity',
            maxWidth: '18ch',
            paddingRight: 24,
            fontSize: 'clamp(37px, 7vw, 114px)',
            lineHeight: 1.04,
            letterSpacing: '0.01em',
            textWrap: 'balance',
            textShadow: '0 4px 40px rgba(0,0,0,0.45), 0 2px 12px rgba(0,0,0,0.4)',
            opacity: 1,
          }}
        >
          {t('coast.headline')}
        </h2>
      </div>

      {/* Floating listing card. */}
      <div className="absolute z-[5] bottom-6 left-1/2 w-[88%] max-w-[340px] -translate-x-1/2 translate-y-0 lg:bottom-auto lg:left-auto lg:right-[6%] lg:top-1/2 lg:w-[340px] lg:-translate-y-1/2 lg:translate-x-0">
        <Link
          to={href}
          className="group block overflow-hidden text-text shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:hover:scale-[1.04]"
          style={{
            background: 'rgba(13,22,30,0.58)',
            backdropFilter: 'blur(18px) saturate(120%)',
            WebkitBackdropFilter: 'blur(18px) saturate(120%)',
            border: '1px solid rgba(255,255,255,0.22)',
          }}
        >
          <div className="h-[190px] w-full overflow-hidden">
            <PropertyImage image={listing.heroImage} sizes="340px" className="h-full w-full object-cover" />
          </div>
          <div className="px-6 pb-6 pt-5">
            <div
              className="mb-3 text-[12px] font-medium uppercase tracking-[0.3em]"
              style={{ color: '#f4d488', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
            >
              {t('sontra.cardEyebrow')} · {localizeDistrict(listing.district, locale)}
            </div>
            <div
              className="mb-2 font-display text-[2rem] font-semibold leading-[1.04]"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
            >
              {pick(listing.title, locale)}
            </div>
            {/* Price up front (user-visible pricing everywhere a listing shows). */}
            <div
              className="mb-3 font-display text-[1.55rem] font-semibold tabular-nums"
              style={{ color: '#f4d488', textShadow: '0 2px 14px rgba(0,0,0,0.55)' }}
            >
              {cardPrice}
            </div>
            <div className="mb-4 flex gap-3 text-[14px] font-light text-white/90">
              <span>
                {listing.bedrooms} {t('listings.beds')}
              </span>
              <span className="opacity-40">·</span>
              <span>
                {listing.bathrooms} {t('listings.baths')}
              </span>
              <span className="opacity-40">·</span>
              <span>{listing.areaM2} m²</span>
            </div>
            <p className="mb-5 text-[14px] font-light leading-[1.6] text-white/80">
              {pick(listing.shortDesc, locale)}
            </p>
            <div className="flex items-center justify-end border-t border-white/25 pt-4">
              <span
                className="text-[12px] tracking-[0.22em] transition-colors group-hover:text-white"
                style={{ color: '#f4d488' }}
              >
                {t('sontra.viewListing')}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom seam: melt into the cream Meet Toan section below. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6]"
        style={{
          height: '26vh',
          background: 'linear-gradient(180deg, rgba(244,239,230,0) 0%, #f4efe6 100%)',
        }}
        aria-hidden="true"
      />
    </section>
  )
}

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BedDouble, Bath, Maximize } from 'lucide-react'
import type { Listing } from '@/data/types'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { formatPrice, pick } from '@/lib/format'
import PropertyImage from './PropertyImage'

interface Props {
  listing: Listing
  locale: Locale
  /** A larger editorial treatment for the first item in a showcase. */
  feature?: boolean
  priority?: boolean
}

export default function PropertyCard({ listing, locale, feature = false, priority = false }: Props) {
  const { t } = useTranslation()
  const href = localePath(locale, `property/${listing.slug}`)
  const price = formatPrice(listing, locale)
  const isRent = listing.dealType === 'rent'

  return (
    <Link to={href} className="feature-card group block">
      <div className="relative overflow-hidden">
        <div className={feature ? 'aspect-[16/10]' : 'aspect-[4/3]'}>
          <PropertyImage
            image={listing.heroImage}
            priority={priority}
            sizes={feature ? '100vw' : '(min-width: 768px) 50vw, 100vw'}
            className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 45%, rgba(7,7,7,0.7) 100%)' }}
          aria-hidden="true"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-[2px] border border-line bg-bg/60 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-text/85 backdrop-blur-sm">
            {listing.category}
          </span>
          {listing.featured && (
            <span className="rounded-[2px] border border-gold/50 bg-bg/60 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
              {t('showcase.featured')}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{listing.district}</p>
        <h3 className="mt-2 font-display text-text transition-colors group-hover:text-gold" style={{ fontSize: feature ? '1.75rem' : '1.35rem', lineHeight: 1.15 }}>
          {pick(listing.title, locale)}
        </h3>
        <p className="mt-3 line-clamp-2 max-w-prose text-sm text-muted">
          {pick(listing.shortDesc, locale)}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
          <div className="font-display text-gold">
            {price}
            {isRent && <span className="ml-1 text-xs text-muted">{t('listings.perMonth')}</span>}
          </div>
          {listing.category !== 'Land' && (
            <div className="flex items-center gap-4 text-xs text-muted">
              {listing.bedrooms > 0 && (
                <span className="inline-flex items-center gap-1.5" title={t('listings.beds')}>
                  <BedDouble size={15} strokeWidth={1.5} /> {listing.bedrooms}
                </span>
              )}
              {listing.bathrooms > 0 && (
                <span className="inline-flex items-center gap-1.5" title={t('listings.baths')}>
                  <Bath size={15} strokeWidth={1.5} /> {listing.bathrooms}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5" title={t('listings.area')}>
                <Maximize size={15} strokeWidth={1.5} /> {listing.areaM2}m²
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

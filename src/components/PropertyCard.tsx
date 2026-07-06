import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Listing, ImageAsset } from '@/data/types'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { formatPriceParts, pick } from '@/lib/format'
import { useCurrency } from '@/lib/currency'
import { mediaSrcSet } from '@/lib/media'
import { localizeDistrict } from '@/data/locations'
import PropertyImage from './PropertyImage'

interface Props {
  listing: Listing
  locale: Locale
  /** A larger editorial treatment for a lead card. */
  feature?: boolean
  priority?: boolean
}

export default function PropertyCard({ listing, locale, feature = false, priority = false }: Props) {
  const { t } = useTranslation()
  const href = localePath(locale, `property/${listing.slug}`)
  const { usd, vnd } = formatPriceParts(listing, locale)
  const { currency } = useCurrency()
  // The toggled currency leads; the other stays as the small line below.
  const primary = currency === 'vnd' && vnd ? vnd : usd
  const secondary = currency === 'vnd' && vnd ? usd : vnd
  const isRent = listing.dealType === 'rent'

  // TEST ONLY: until real Airtable photos exist, swap placeholder hero images for
  // generic stock photos so the cards look populated. Real photos (placeholder
  // false) pass through untouched.
  const hero: ImageAsset = listing.heroImage.placeholder
    ? (() => {
        let h = 0
        for (const c of listing.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0
        const base = `/media/placeholders/prop-${(h % 8) + 1}`
        return {
          src: `${base}.jpg`,
          avif: `${base}.avif`,
          webp: `${base}.webp`,
          avifSet: mediaSrcSet(base, 'avif'),
          webpSet: mediaSrcSet(base, 'webp'),
          width: 800,
          height: 600,
          alt: pick(listing.title, locale),
        }
      })()
    : listing.heroImage

  return (
    <Link
      to={href}
      className="group block overflow-hidden border border-ink/10 bg-white transition-[transform,box-shadow,border-color] duration-300 ease-lux-out hover:-translate-y-1 hover:border-gold-ink/40 hover:shadow-[0_24px_60px_rgba(28,38,48,0.16)]"
    >
      <div className={`relative overflow-hidden ${feature ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
        <PropertyImage
          image={hero}
          priority={priority}
          sizes={feature ? '100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
          className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        {listing.featured && (
          <span className="absolute left-4 top-4 rounded-[2px] bg-ink/55 px-3 py-1 text-[0.72rem] uppercase tracking-[0.24em] text-gold-2 backdrop-blur-sm">
            {t('showcase.featured')}
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-baseline justify-between gap-3 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-gold-ink">
          <span>
            {localizeDistrict(listing.district, locale)} ·{' '}
            {t(`listings.categoryNames.${listing.category.toLowerCase()}`, { defaultValue: listing.category })}
          </span>
          {/* Property reference, searchable via the Code filter. */}
          {listing.code && <span className="shrink-0 tracking-[0.14em] text-ink/70">#{listing.code}</span>}
        </div>
        <h3
          className="mt-3 font-display font-semibold text-ink transition-colors group-hover:text-gold-ink"
          style={{ fontSize: feature ? '2rem' : '1.6rem', lineHeight: 1.1 }}
        >
          {pick(listing.title, locale)}
        </h3>

        {listing.category !== 'Land' && (
          <div className="mt-3 flex items-center gap-3 text-sm text-ink/70">
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
        )}

        {/* Price row. flex-wrap + ml-auto: the view-listing label drops to its
            own right-aligned line when a long translation (RU) runs out of
            room, so it can never squeeze or clip the price. */}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t border-ink/12 pt-4">
          <div className="min-w-0">
            {listing.price > 0 ? (
              <>
                <div className="font-display text-2xl font-semibold text-ink tabular-nums whitespace-nowrap">
                  {listing.category === 'Project' && (
                    <span className="mr-1.5 font-sans text-xs font-normal uppercase tracking-[0.1em] text-ink/70">
                      {t('listings.from')}
                    </span>
                  )}
                  {primary}
                  {isRent && (
                    <span className="ml-1 font-sans text-sm font-normal text-ink/80">{t('listings.perMonth')}</span>
                  )}
                </div>
                {secondary && (
                  <div className="mt-0.5 whitespace-nowrap text-sm text-ink/70 tabular-nums">{secondary}</div>
                )}
              </>
            ) : (
              <div className="font-display text-xl font-semibold text-ink">{t('listings.priceOnRequest')}</div>
            )}
          </div>
          <span className="ml-auto text-[0.72rem] uppercase tracking-[0.2em] text-gold-ink transition-colors group-hover:text-ink">
            {t('sontra.viewListing')}
          </span>
        </div>
      </div>
    </Link>
  )
}

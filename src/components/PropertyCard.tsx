import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Listing, ImageAsset } from '@/data/types'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { formatPriceParts, pick } from '@/lib/format'
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
  const isRent = listing.dealType === 'rent'

  // TEST ONLY: until real Airtable photos exist, swap placeholder hero images for
  // generic stock photos so the cards look populated. Real photos (placeholder
  // false) pass through untouched.
  const hero: ImageAsset = listing.heroImage.placeholder
    ? (() => {
        let h = 0
        for (const c of listing.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0
        const base = `/media/placeholders/prop-${(h % 8) + 1}`
        return { src: `${base}.jpg`, avif: `${base}.avif`, webp: `${base}.webp`, width: 800, height: 600, alt: pick(listing.title, locale) }
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
          <span className="absolute left-4 top-4 rounded-[2px] bg-ink/55 px-3 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-gold-2 backdrop-blur-sm">
            {t('showcase.featured')}
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="text-[0.68rem] font-medium uppercase tracking-[0.26em] text-gold-ink">
          {localizeDistrict(listing.district, locale)} · {listing.category}
        </div>
        <h3
          className="mt-3 font-display font-semibold text-ink transition-colors group-hover:text-gold-ink"
          style={{ fontSize: feature ? '2rem' : '1.6rem', lineHeight: 1.1 }}
        >
          {pick(listing.title, locale)}
        </h3>

        {listing.category !== 'Land' && (
          <div className="mt-3 flex items-center gap-3 text-[0.82rem] font-light text-ink/60">
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

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-ink/12 pt-4">
          <div className="min-w-0">
            <div className="font-display text-lg text-ink whitespace-nowrap">
              {usd}
              {isRent && <span className="ml-1 font-sans text-xs text-ink/50">{t('listings.perMonth')}</span>}
            </div>
            {vnd && <div className="mt-0.5 whitespace-nowrap text-xs text-ink/55">{vnd}</div>}
          </div>
          <span className="shrink-0 self-end text-[0.7rem] uppercase tracking-[0.2em] text-gold-ink transition-colors group-hover:text-ink">
            {t('sontra.viewListing')}
          </span>
        </div>
      </div>
    </Link>
  )
}

import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BedDouble, Bath, Maximize, MapPin, MessageCircle, Hash } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { localePath } from '@/lib/locale'
import { getListingBySlug } from '@/data'
import { formatPrice, formatArea, pick } from '@/lib/format'
import { zaloLink, whatsappLink } from '@/config/site'
import { localizeDistrict } from '@/data/locations'
import Seo from '@/components/Seo'
import JsonLd from '@/components/JsonLd'
import PropertyImage from '@/components/PropertyImage'
import Reveal from '@/components/Reveal'
import { breadcrumbSchema, listingSchema } from '@/lib/schema'

export default function PropertyDetail() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { slug } = useParams<{ slug: string }>()
  const listing = slug ? getListingBySlug(slug) : undefined

  if (!listing) {
    return (
      <>
        <Seo title="Not found" description="" />
        <section className="bg-cream text-ink">
          <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="font-display text-3xl text-ink">Not found</h1>
            <Link to={localePath(locale, 'buy')} className="btn btn-slate mt-8">
              {t('detail.backTo')}
            </Link>
          </div>
        </section>
      </>
    )
  }

  const title = pick(listing.title, locale)
  const district = localizeDistrict(listing.district, locale)
  const category = t(`listings.categoryNames.${listing.category.toLowerCase()}`, { defaultValue: listing.category })
  const isRent = listing.dealType === 'rent'
  const specs = [
    listing.bedrooms > 0 && { icon: BedDouble, label: t('detail.bedrooms'), value: String(listing.bedrooms) },
    listing.bathrooms > 0 && { icon: Bath, label: t('detail.bathrooms'), value: String(listing.bathrooms) },
    listing.areaM2 > 0 && { icon: Maximize, label: t('detail.area'), value: formatArea(listing.areaM2, locale) },
    { icon: MapPin, label: t('detail.district'), value: district },
    !!listing.code && { icon: Hash, label: t('detail.code'), value: listing.code },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string }[]

  return (
    <>
      <Seo
        title={`${title}. ${district}, Da Nang.`}
        description={pick(listing.shortDesc, locale)}
        image={listing.heroImage.avif ?? listing.heroImage.src}
        type="article"
      />
      <JsonLd
        data={[
          listingSchema(listing, locale),
          breadcrumbSchema([
            { name: t('nav.' + listing.dealType), path: localePath(locale, listing.dealType) },
            { name: title, path: localePath(locale, `property/${listing.slug}`) },
          ]),
        ]}
      />

      {/* Editorial photo hero. White/gold text reads on the darkened image. */}
      <section className="relative min-h-[78vh] overflow-hidden">
        <PropertyImage image={listing.heroImage} priority className="absolute inset-0" sizes="100vw" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(7,7,7,0.55) 0%, rgba(7,7,7,0.18) 35%, rgba(7,7,7,0.94) 100%)' }}
          aria-hidden="true"
        />
        <div className="container-lux relative z-10 flex min-h-[78vh] flex-col justify-end pb-16 pt-36">
          <Link
            to={localePath(locale, listing.dealType)}
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/90 transition-colors hover:text-gold-2"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> {t('detail.backTo')}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-[2px] border border-white/30 bg-black/40 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              {category}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-white/90" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
              {district}
            </span>
          </div>
          <h1
            className="mt-4 max-w-[20ch] font-display text-white"
            style={{ fontSize: 'clamp(2.25rem, 1.6rem + 3.4vw, 4.5rem)', lineHeight: 1.04, textShadow: '0 4px 40px rgba(0,0,0,0.5), 0 2px 12px rgba(0,0,0,0.45)' }}
          >
            {title}
          </h1>
          <div
            className="mt-4 font-display font-semibold text-gold-2 tabular-nums"
            style={{ fontSize: 'clamp(1.7rem, 1.3rem + 1.8vw, 2.6rem)', textShadow: '0 2px 18px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.5)' }}
          >
            {formatPrice(listing, locale)}
            {isRent && <span className="ml-2 font-sans text-sm font-normal text-white/85">{t('listings.perMonth')}</span>}
          </div>
        </div>
      </section>

      {/* Cream body, matching the rest of the site. */}
      <section className="bg-cream text-ink">
        <div className="container-lux grid gap-14 py-20 lg:grid-cols-[1.6fr_1fr] lg:gap-20 lg:py-28">
          <div>
            <Reveal>
              <p className="eyebrow-ink">{t('detail.overview')}</p>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink/80">
                {pick(listing.longDesc, locale)
                  .split('\n')
                  .map((para, i) => (
                    <p key={i} className="max-w-prose">
                      {para}
                    </p>
                  ))}
              </div>
            </Reveal>

            {/* Gallery */}
            {listing.gallery.length > 0 && (
              <Reveal className="mt-16">
                <p className="eyebrow-ink">{t('detail.gallery')}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {listing.gallery.map((img, i) => (
                    <div key={i} className="overflow-hidden rounded-[4px] border border-ink/10" style={{ aspectRatio: '3 / 2' }}>
                      <PropertyImage image={img} sizes="(min-width: 640px) 50vw, 100vw" />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* Sticky spec + inquiry rail */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[4px] border border-ink/10 bg-white p-7">
              <p className="eyebrow-ink">{t('detail.specifications')}</p>
              <dl className="mt-6 space-y-4">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-center justify-between border-b border-ink/10 pb-4 last:border-0 last:pb-0">
                    <dt className="inline-flex items-center gap-2 text-sm text-ink/70">
                      <s.icon size={16} strokeWidth={1.5} /> {s.label}
                    </dt>
                    <dd className="text-sm text-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 rounded-[4px] border border-ink/10 bg-white p-7">
              <h2 className="font-display text-xl text-ink">{t('detail.inquireTitle')}</h2>
              <p className="mt-3 text-sm text-ink/70">{t('detail.inquireBody')}</p>
              <div className="mt-6 flex flex-col gap-3">
                <a href={zaloLink()} target="_blank" rel="noopener noreferrer" className="btn btn-slate w-full">
                  <MessageCircle size={16} strokeWidth={1.5} />
                  {t('detail.inquireZalo')}
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn w-full border border-ink/25 text-ink transition-colors hover:border-gold-ink hover:text-gold-ink"
                >
                  <MessageCircle size={16} strokeWidth={1.5} />
                  {t('detail.inquireWhatsApp')}
                </a>
                <Link
                  to={localePath(locale, 'contact')}
                  className="mt-1 text-center text-sm text-gold-ink underline-offset-4 transition-colors hover:underline"
                >
                  {t('contact.send')}
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Location */}
        {listing.lat != null && listing.lng != null && (
          <div className="border-t border-ink/10">
            <div className="container-lux py-16">
              <p className="eyebrow-ink">{t('detail.location')}</p>
              <div className="mt-6 overflow-hidden rounded-[4px] border border-ink/10">
                <iframe
                  title={`${title} location`}
                  loading="lazy"
                  className="h-[360px] w-full"
                  style={{ border: 0, filter: 'grayscale(0.35) contrast(1.03)' }}
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.01}%2C${listing.lat - 0.008}%2C${listing.lng + 0.01}%2C${listing.lat + 0.008}&layer=mapnik&marker=${listing.lat}%2C${listing.lng}`}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}

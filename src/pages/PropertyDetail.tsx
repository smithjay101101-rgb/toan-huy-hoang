import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BedDouble, Bath, Maximize, MapPin, MessageCircle } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { localePath } from '@/lib/locale'
import { getListingBySlug } from '@/data'
import { formatPrice, formatArea, pick } from '@/lib/format'
import { zaloLink } from '@/config/site'
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
        <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="font-display text-3xl text-text">Not found</h1>
          <Link to={localePath(locale, 'buy')} className="btn btn-ghost mt-8">
            {t('detail.backTo')}
          </Link>
        </div>
      </>
    )
  }

  const title = pick(listing.title, locale)
  const isRent = listing.dealType === 'rent'
  const specs = [
    listing.bedrooms > 0 && { icon: BedDouble, label: t('detail.bedrooms'), value: String(listing.bedrooms) },
    listing.bathrooms > 0 && { icon: Bath, label: t('detail.bathrooms'), value: String(listing.bathrooms) },
    listing.areaM2 > 0 && { icon: Maximize, label: t('detail.area'), value: formatArea(listing.areaM2, locale) },
    { icon: MapPin, label: t('detail.district'), value: listing.district },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string }[]

  return (
    <>
      <Seo
        title={`${title}. ${listing.district}, Da Nang.`}
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

      {/* Editorial hero */}
      <section className="relative min-h-[78vh] overflow-hidden">
        <PropertyImage image={listing.heroImage} priority className="absolute inset-0" sizes="100vw" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(7,7,7,0.5) 0%, transparent 35%, rgba(7,7,7,0.9) 100%)' }}
          aria-hidden="true"
        />
        <div className="container-lux relative z-10 flex min-h-[78vh] flex-col justify-end pb-16 pt-36">
          <Link
            to={localePath(locale, listing.dealType)}
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text/70 transition-colors hover:text-gold"
          >
            <ArrowLeft size={16} strokeWidth={1.5} /> {t('detail.backTo')}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-[2px] border border-line bg-bg/50 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-text/85 backdrop-blur-sm">
              {listing.category}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-muted">{listing.district}</span>
          </div>
          <h1 className="mt-4 max-w-[20ch] font-display text-text" style={{ fontSize: 'clamp(2.25rem, 1.6rem + 3.4vw, 4.5rem)', lineHeight: 1.04 }}>
            {title}
          </h1>
          <div className="mt-4 font-display text-2xl text-gold lg:text-3xl">
            {formatPrice(listing, locale)}
            {isRent && <span className="ml-2 text-sm text-muted">{t('listings.perMonth')}</span>}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container-lux grid gap-14 py-20 lg:grid-cols-[1.6fr_1fr] lg:gap-20 lg:py-28">
        <div>
          <Reveal>
            <p className="eyebrow">{t('detail.overview')}</p>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-text/85">
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
              <p className="eyebrow">{t('detail.gallery')}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {listing.gallery.map((img, i) => (
                  <div key={i} className="overflow-hidden rounded-[4px] border border-line" style={{ aspectRatio: '3 / 2' }}>
                    <PropertyImage image={img} sizes="(min-width: 640px) 50vw, 100vw" />
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* Sticky spec + inquiry rail */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[4px] border border-line bg-card p-7">
            <p className="eyebrow">{t('detail.specifications')}</p>
            <dl className="mt-6 space-y-4">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between border-b border-line pb-4 last:border-0 last:pb-0">
                  <dt className="inline-flex items-center gap-2 text-sm text-muted">
                    <s.icon size={16} strokeWidth={1.5} /> {s.label}
                  </dt>
                  <dd className="text-sm text-text">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6 rounded-[4px] border border-line bg-bg-2 p-7">
            <h2 className="font-display text-xl text-text">{t('detail.inquireTitle')}</h2>
            <p className="mt-3 text-sm text-muted">{t('detail.inquireBody')}</p>
            <div className="mt-6 flex flex-col gap-3">
              <a href={zaloLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                <MessageCircle size={16} strokeWidth={1.5} />
                {t('detail.inquireZalo')}
              </a>
              <Link to={localePath(locale, 'contact')} className="btn btn-ghost w-full">
                {t('contact.send')}
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Location */}
      {listing.lat != null && listing.lng != null && (
        <section className="border-t border-line">
          <div className="container-lux py-16">
            <p className="eyebrow">{t('detail.location')}</p>
            <div className="mt-6 overflow-hidden rounded-[4px] border border-line">
              <iframe
                title={`${title} location`}
                loading="lazy"
                className="h-[360px] w-full grayscale"
                style={{ border: 0, filter: 'grayscale(1) invert(0.92) contrast(0.9)' }}
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.01}%2C${listing.lat - 0.008}%2C${listing.lng + 0.01}%2C${listing.lat + 0.008}&layer=mapnik&marker=${listing.lat}%2C${listing.lng}`}
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}

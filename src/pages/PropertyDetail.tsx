import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, BedDouble, Bath, Maximize, MapPin, Hash } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { localePath } from '@/lib/locale'
import { getListingBySlug, getListings } from '@/data'
import PropertyCard from '@/components/PropertyCard'
import { formatPriceParts, formatArea, pick } from '@/lib/format'
import { useCurrency } from '@/lib/currency'
import { contactFor } from '@/config/site'
import { youtubeEmbedUrl } from '@/lib/media'
import { ChannelIcon } from '@/components/icons'
import { localizeDistrict } from '@/data/locations'
import Seo from '@/components/Seo'
import JsonLd from '@/components/JsonLd'
import PropertyImage from '@/components/PropertyImage'
import Lightbox from '@/components/Lightbox'
import Reveal from '@/components/Reveal'
import { breadcrumbSchema, listingSchema } from '@/lib/schema'

export default function PropertyDetail() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { currency } = useCurrency()
  const { slug } = useParams<{ slug: string }>()
  const listing = slug ? getListingBySlug(slug) : undefined
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
  const isProject = listing.category === 'Project'
  // Reference-style development overview (Tổng quan dự án): only filled rows show.
  const facts = isProject
    ? ([
        [t('detail.address'), listing.address ?? district],
        [t('detail.developer'), listing.developer],
        [t('detail.units'), listing.units],
        [t('detail.floors'), listing.floors],
        listing.areaM2 > 0 ? [t('detail.landArea'), formatArea(listing.areaM2, locale)] : null,
        [t('detail.handover'), listing.handover],
      ].filter((r): r is [string, string] => !!r && !!r[1]))
    : []
  const relatedProjects = isProject
    ? getListings().filter((l) => l.category === 'Project' && l.slug !== listing.slug).slice(0, 3)
    : []
  const specs = [
    listing.bedrooms > 0 && { icon: BedDouble, label: t('detail.bedrooms'), value: String(listing.bedrooms) },
    listing.bathrooms > 0 && { icon: Bath, label: t('detail.bathrooms'), value: String(listing.bathrooms) },
    listing.areaM2 > 0 && { icon: Maximize, label: t('detail.area'), value: formatArea(listing.areaM2, locale) },
    { icon: MapPin, label: t('detail.district'), value: district },
    !!listing.code && { icon: Hash, label: t('detail.code'), value: listing.code },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string }[]

  // One price computation for the hero and the mobile inquiry bar. The toggled
  // currency leads; zero-priced rows show "price on request" instead of $0.
  const { usd, vnd } = formatPriceParts(listing, locale)
  const priceMain = currency === 'vnd' && vnd ? vnd : usd
  const priceSub = currency === 'vnd' && vnd ? usd : vnd
  const hasPrice = listing.price > 0
  const primaryChannel = contactFor(locale).channels[0]
  // Video tour, only for listings whose Airtable row carries a valid link.
  const videoEmbed = listing.youtubeUrl ? youtubeEmbedUrl(listing.youtubeUrl) : null

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
            {
              name: t(isProject ? 'nav.projects' : 'nav.' + listing.dealType),
              path: localePath(locale, isProject ? 'projects' : listing.dealType),
            },
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
            to={localePath(locale, isProject ? 'projects' : listing.dealType)}
            className="mb-8 inline-flex items-center gap-2.5 self-start rounded-[2px] border border-white/55 bg-black/25 px-5 py-3 text-[0.8rem] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors hover:border-gold-2 hover:text-gold-2"
          >
            <ArrowLeft size={17} strokeWidth={1.5} /> {t('detail.backTo')}
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
            {isProject && hasPrice && (
              <span className="mr-2 font-sans text-sm font-normal uppercase tracking-[0.14em] text-white/85">
                {t('listings.from')}
              </span>
            )}
            {hasPrice ? (priceSub ? `${priceMain} · ${priceSub}` : priceMain) : t('listings.priceOnRequest')}
            {hasPrice && isRent && (
              <span className="ml-2 font-sans text-sm font-normal text-white/85">{t('listings.perMonth')}</span>
            )}
          </div>
        </div>
      </section>

      {/* Cream body, matching the rest of the site. */}
      <section className="bg-cream text-ink">
        <div className="container-lux grid gap-14 py-20 lg:grid-cols-[1.6fr_1fr] lg:gap-20 lg:py-28">
          <div>
            {/* Development facts table, in the spirit of the classic Vietnamese
                project page (Tổng quan dự án). */}
            {facts.length > 0 && (
              <Reveal className="mb-14">
                <p className="eyebrow-ink">{t('detail.projectOverview')}</p>
                <div className="mt-6 overflow-hidden rounded-[4px] border border-ink/10 bg-white">
                  <dl>
                    {facts.map(([label, value], i) => (
                      <div
                        key={label}
                        className={`grid grid-cols-[38%_1fr] gap-4 px-6 py-4 ${i > 0 ? 'border-t border-ink/8' : ''}`}
                      >
                        <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-ink/70 self-center">{label}</dt>
                        <dd className="text-[15px] text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
            )}

            <Reveal>
              <p className="eyebrow-ink">{t('detail.overview')}</p>
              {isProject ? (
                <div className="prose prose-cream prose-headings:font-display mt-6 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{pick(listing.longDesc, locale)}</ReactMarkdown>
                </div>
              ) : (
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink/80">
                  {pick(listing.longDesc, locale)
                    .split('\n')
                    .map((para, i) => (
                      <p key={i} className="max-w-prose">
                        {para}
                      </p>
                    ))}
                </div>
              )}
            </Reveal>

            {/* Video tour (only when the row has a valid YouTube link). Lazy
                iframe: the player loads only when scrolled near. */}
            {videoEmbed && (
              <Reveal className="mt-16">
                <p className="eyebrow-ink">{t('detail.videoTour')}</p>
                <div
                  className="mt-6 overflow-hidden rounded-[4px] border border-ink/10 bg-ink/5"
                  style={{ aspectRatio: '16 / 9' }}
                >
                  <iframe
                    src={videoEmbed}
                    title={`${title} — ${t('detail.videoTour')}`}
                    loading="lazy"
                    className="h-full w-full"
                    style={{ border: 0 }}
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </Reveal>
            )}

            {/* Gallery (master plan on developments) */}
            {listing.gallery.length > 0 && (
              <Reveal className="mt-16">
                <p className="eyebrow-ink">{isProject ? t('detail.masterplan') : t('detail.gallery')}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {listing.gallery.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`${t('detail.gallery')} ${i + 1}`}
                      onClick={() => setLightboxIndex(i)}
                      className="group cursor-zoom-in overflow-hidden rounded-[4px] border border-ink/10 transition-[border-color] hover:border-gold-ink/50"
                      style={{ aspectRatio: '3 / 2' }}
                    >
                      <PropertyImage
                        image={img}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="transition-transform duration-500 ease-lux-out group-hover:scale-[1.03]"
                      />
                    </button>
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
                {contactFor(locale).channels.map((ch, i) => (
                  <a
                    key={ch.kind}
                    href={ch.href}
                    target={ch.href.startsWith('http') ? '_blank' : undefined}
                    rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={
                      i === 0
                        ? 'btn btn-slate w-full'
                        : 'btn w-full border border-ink/45 font-medium text-ink transition-colors hover:border-gold-ink hover:text-gold-ink'
                    }
                  >
                    <ChannelIcon kind={ch.kind} size={16} className="shrink-0" />
                    {t('detail.inquireOn', { channel: ch.label })}
                  </a>
                ))}
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

        {/* Click-to-zoom carousel over the gallery. */}
        {lightboxIndex != null && (
          <Lightbox
            images={listing.gallery}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}

        {/* Other developments, like the reference's featured-projects block. */}
        {relatedProjects.length > 0 && (
          <div className="border-t border-ink/10">
            <div className="container-lux py-16">
              <p className="eyebrow-ink">{t('detail.relatedProjects')}</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.map((l) => (
                  <PropertyCard key={l.id} listing={l} locale={locale} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clearance for the fixed inquiry bar so the last content and most of
            the footer scroll fully above it on phones. */}
        <div className="h-16 lg:hidden" aria-hidden="true" />
      </section>

      {/* Mobile inquiry bar: the price and a one-tap chat stay in the thumb
          zone the whole visit — no scrolling past the gallery to inquire. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-gold/40 px-5 lg:hidden"
        style={{
          background: 'rgba(13,26,36,0.96)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          paddingTop: 10,
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        }}
      >
        <div className="min-w-0">
          <div className="truncate font-display text-xl font-semibold text-gold-2 tabular-nums">
            {hasPrice ? priceMain : t('listings.priceOnRequest')}
            {hasPrice && isRent && (
              <span className="ml-1 font-sans text-xs font-normal text-white/80">{t('listings.perMonth')}</span>
            )}
          </div>
          {hasPrice && priceSub && (
            <div className="truncate text-xs tabular-nums text-white/70">{priceSub}</div>
          )}
        </div>
        <a
          href={primaryChannel.href}
          target={primaryChannel.href.startsWith('http') ? '_blank' : undefined}
          rel={primaryChannel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          aria-label={t('detail.inquireOn', { channel: primaryChannel.label })}
          className="btn btn-primary shrink-0"
          style={{ minHeight: 44, padding: '12px 22px' }}
        >
          <ChannelIcon kind={primaryChannel.kind} size={16} />
          {primaryChannel.label}
        </a>
      </div>
    </>
  )
}

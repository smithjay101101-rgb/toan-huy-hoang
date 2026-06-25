import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/locale'
import type { DealType } from '@/data/types'
import { getListingsByDeal } from '@/data'
import { pick } from '@/lib/format'
import Seo from '@/components/Seo'
import PageHeader from '@/components/PageHeader'
import PropertyCard from '@/components/PropertyCard'
import ListingSearch, { EMPTY_FILTER, budgetRange, type ListingFilter } from '@/components/ListingSearch'
import Reveal from '@/components/Reveal'

export default function Listings({ dealType }: { dealType: DealType }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const all = getListingsByDeal(dealType)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  const categories = useMemo(() => Array.from(new Set(all.map((l) => l.category))), [all])
  const [filter, setFilter] = useState<ListingFilter>(EMPTY_FILTER)

  const shown = useMemo(() => {
    const [min, max] = budgetRange(dealType, filter.budget)
    const code = filter.code.trim().replace(/^#/, '').toLowerCase()
    return all.filter((l) => {
      if (filter.category !== 'all' && l.category !== filter.category) return false
      if (filter.district !== 'all' && l.district !== filter.district) return false
      if (filter.bedrooms !== 'any' && l.bedrooms < Number(filter.bedrooms)) return false
      if (l.price < min || l.price >= max) return false
      if (code && !(l.slug.toLowerCase().includes(code) || pick(l.title, locale).toLowerCase().includes(code)))
        return false
      return true
    })
  }, [all, dealType, filter, locale])

  const isFiltered = JSON.stringify(filter) !== JSON.stringify(EMPTY_FILTER)
  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const meta = dealType === 'buy' ? t('meta.buy', { returnObjects: true }) : t('meta.rent', { returnObjects: true })
  const title = dealType === 'buy' ? t('listings.buyTitle') : t('listings.rentTitle')
  const lead = dealType === 'buy' ? t('listings.buyLead') : t('listings.rentLead')

  // Full-bleed header photo per deal type: the Golden Bridge for rentals, the
  // Da Nang skyline for sales.
  const headerImage =
    dealType === 'rent'
      ? {
          avif: '/media/golden-bridge.avif',
          webp: '/media/golden-bridge.webp',
          jpg: '/media/golden-bridge.jpg',
          alt: 'The Golden Bridge at Ba Na Hills, Da Nang',
        }
      : {
          avif: '/media/hero-city.avif',
          webp: '/media/hero-city.webp',
          jpg: '/media/hero-city.jpg',
          alt: 'The Da Nang skyline along the coast',
        }

  return (
    <>
      <Seo
        title={(meta as { title: string }).title}
        description={(meta as { description: string }).description}
      />
      <PageHeader title={title} lead={lead} image={headerImage} />

      {/* Cream listings surface: dark photo header -> cream body -> slate footer,
          matching the homepage rhythm. */}
      <section className="bg-cream text-ink">
        <div className="container-lux pb-24 lg:pb-32">
          {/* Search panel (light card), lifted to straddle the header / cream seam. */}
          <div className="relative z-20 -mt-12 lg:-mt-16">
            <ListingSearch
              dealType={dealType}
              locale={locale}
              categories={categories}
              value={filter}
              onChange={setFilter}
              onSearch={scrollToResults}
            />
          </div>

          <div ref={resultsRef} className="pt-16" style={{ scrollMarginTop: 96 }}>
            <div className="mb-8 flex items-center justify-between border-b border-ink/12 pb-5">
              <p className="text-sm text-ink/55">
                {shown.length} {t('search.results')}
              </p>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => setFilter(EMPTY_FILTER)}
                  className="text-xs uppercase tracking-[0.18em] text-ink/55 transition-colors hover:text-gold-ink"
                >
                  {t('search.clear')}
                </button>
              )}
            </div>

            {shown.length === 0 ? (
              <p className="py-20 text-center text-ink/55">{t('listings.empty')}</p>
            ) : (
              <Reveal stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((l, i) => (
                  <PropertyCard key={l.id} listing={l} locale={locale} priority={i < 3} />
                ))}
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

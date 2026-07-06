import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/locale'
import type { DealType } from '@/data/types'
import { getListingsByDeal } from '@/data'
import { LOCATIONS } from '@/data/locations'
import { pick } from '@/lib/format'
import Seo from '@/components/Seo'
import PageHeader from '@/components/PageHeader'
import PropertyCard from '@/components/PropertyCard'
import ListingSearch, {
  EMPTY_FILTER,
  budgetRange,
  budgetKeys,
  LISTING_CATEGORIES,
  type ListingFilter,
} from '@/components/ListingSearch'
import Reveal from '@/components/Reveal'
import { useCurrency } from '@/lib/currency'

const BEDROOM_KEYS = ['1', '2', '3', '4', '5']

export default function Listings({ dealType }: { dealType: DealType }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const all = getListingsByDeal(dealType)
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  // The full category set is always offered (not just what today's data holds),
  // so buyers see Apartments and Land as searchable options from day one.
  const categories = useMemo(() => [...LISTING_CATEGORIES], [])
  const [filter, setFilter] = useState<ListingFilter>(EMPTY_FILTER)
  const { currency, setCurrency } = useCurrency()

  // Hydrate filters from the URL once after mount (not in the initial state, so
  // the first client render matches the prerendered HTML). Invalid params are
  // ignored. Makes filtered views shareable: /en/buy?location=My+An&beds=3
  useEffect(() => {
    const next: ListingFilter = { ...EMPTY_FILTER }
    const type = searchParams.get('type')
    if (type && categories.some((c) => c === type)) next.category = type
    const loc = searchParams.get('location')
    if (loc && LOCATIONS.some((l) => l.value === loc)) next.district = loc
    const budget = searchParams.get('budget')
    if (budget && budgetKeys(dealType).includes(budget)) next.budget = budget
    const beds = searchParams.get('beds')
    if (beds && BEDROOM_KEYS.includes(beds)) next.bedrooms = beds
    const code = searchParams.get('q')
    if (code) next.code = code
    if (JSON.stringify(next) !== JSON.stringify(EMPTY_FILTER)) setFilter(next)
    // Run once per page mount; later changes flow through updateFilter below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealType])

  // Single write path: update state and mirror non-default values into the URL
  // (replace, not push, so typing in the code box does not spam history).
  const updateFilter = (next: ListingFilter) => {
    setFilter(next)
    const p = new URLSearchParams()
    if (next.category !== 'all') p.set('type', next.category)
    if (next.district !== 'all') p.set('location', next.district)
    if (next.budget !== 'any') p.set('budget', next.budget)
    if (next.bedrooms !== 'any') p.set('beds', next.bedrooms)
    if (next.code.trim()) p.set('q', next.code.trim())
    setSearchParams(p, { replace: true })
  }

  const shown = useMemo(() => {
    const [min, max] = budgetRange(dealType, filter.budget)
    const code = filter.code.trim().replace(/^#/, '').toLowerCase()
    return all.filter((l) => {
      if (filter.category !== 'all' && l.category !== filter.category) return false
      if (filter.district !== 'all' && l.district !== filter.district) return false
      if (filter.bedrooms !== 'any' && l.bedrooms < Number(filter.bedrooms)) return false
      if (l.price < min || l.price >= max) return false
      if (
        code &&
        !(
          (l.code ?? '').toLowerCase().includes(code) ||
          l.slug.toLowerCase().includes(code) ||
          pick(l.title, locale).toLowerCase().includes(code)
        )
      )
        return false
      return true
    })
  }, [all, dealType, filter, locale])

  const isFiltered = JSON.stringify(filter) !== JSON.stringify(EMPTY_FILTER)
  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const meta = dealType === 'buy' ? t('meta.buy', { returnObjects: true }) : t('meta.rent', { returnObjects: true })
  const title = dealType === 'buy' ? t('listings.buyTitle') : t('listings.rentTitle')
  const lead = dealType === 'buy' ? t('listings.buyLead') : t('listings.rentLead')

  // Full-bleed header photo per deal type: the Golden Bridge for rentals, a
  // bright modern Da Nang villa for sales (distinct from the homepage skyline).
  const headerImage =
    dealType === 'rent'
      ? {
          avif: '/media/golden-bridge.avif',
          webp: '/media/golden-bridge.webp',
          jpg: '/media/golden-bridge.jpg',
          alt: 'The Golden Bridge at Ba Na Hills, Da Nang',
        }
      : {
          avif: '/media/villa-buy.avif',
          webp: '/media/villa-buy.webp',
          jpg: '/media/villa-buy.jpg',
          alt: 'A modern poolside villa in Da Nang in the afternoon sun',
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
              onChange={updateFilter}
              onSearch={scrollToResults}
            />
          </div>

          <div ref={resultsRef} className="pt-16" style={{ scrollMarginTop: 96 }}>
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-ink/12 pb-5">
              <p className="text-sm text-ink/70">
                {shown.length} {shown.length === 1 ? t('search.result') : t('search.results')}
              </p>
              <div className="ml-auto flex items-center gap-2 text-xs font-medium tracking-[0.08em]" role="group" aria-label="Currency">
                <button
                  type="button"
                  onClick={() => setCurrency('usd')}
                  aria-pressed={currency === 'usd'}
                  className={`min-h-[44px] px-2.5 transition-colors ${currency === 'usd' ? 'text-gold-ink' : 'text-ink/60 hover:text-ink'}`}
                >
                  $ USD
                </button>
                <span className="text-ink/30">/</span>
                <button
                  type="button"
                  onClick={() => setCurrency('vnd')}
                  aria-pressed={currency === 'vnd'}
                  className={`min-h-[44px] px-2.5 transition-colors ${currency === 'vnd' ? 'text-gold-ink' : 'text-ink/60 hover:text-ink'}`}
                >
                  ₫ VND
                </button>
              </div>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => updateFilter(EMPTY_FILTER)}
                  className="min-h-[44px] px-2 text-xs uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-gold-ink"
                >
                  {t('search.clear')}
                </button>
              )}
            </div>

            {shown.length === 0 ? (
              // Distinguish "filters exclude everything" from "no listings yet".
              isFiltered ? (
                <div className="py-20 text-center">
                  <p className="text-ink/70">{t('search.noMatches')}</p>
                  <button
                    type="button"
                    onClick={() => updateFilter(EMPTY_FILTER)}
                    className="btn btn-slate mt-8"
                  >
                    {t('search.clear')}
                  </button>
                </div>
              ) : (
                <p className="py-20 text-center text-ink/70">{t('listings.empty')}</p>
              )
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

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/locale'
import type { DealType } from '@/data/types'
import { getListingsByDeal } from '@/data'
import Seo from '@/components/Seo'
import PageHeader from '@/components/PageHeader'
import PropertyCard from '@/components/PropertyCard'
import Reveal from '@/components/Reveal'

export default function Listings({ dealType }: { dealType: DealType }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const all = getListingsByDeal(dealType)

  const categories = useMemo(
    () => Array.from(new Set(all.map((l) => l.category))),
    [all],
  )
  const [active, setActive] = useState<string>('all')
  const shown = active === 'all' ? all : all.filter((l) => l.category === active)

  const meta = dealType === 'buy' ? t('meta.buy', { returnObjects: true }) : t('meta.rent', { returnObjects: true })
  const title = dealType === 'buy' ? t('listings.buyTitle') : t('listings.rentTitle')
  const lead = dealType === 'buy' ? t('listings.buyLead') : t('listings.rentLead')

  return (
    <>
      <Seo
        title={(meta as { title: string }).title}
        description={(meta as { description: string }).description}
      />
      <PageHeader eyebrow={t('showcase.eyebrow')} title={title} lead={lead}>
        {categories.length > 1 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {['all', ...categories].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`rounded-[2px] border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors duration-200 ${
                  active === cat
                    ? 'border-gold text-gold'
                    : 'border-line text-text/65 hover:border-text/40 hover:text-text'
                }`}
                style={{ minHeight: 44 }}
              >
                {cat === 'all' ? t('listings.filterAll') : cat}
              </button>
            ))}
          </div>
        )}
      </PageHeader>

      <section className="section">
        <div className="container-lux">
          {shown.length === 0 ? (
            <p className="py-20 text-center text-muted">{t('listings.empty')}</p>
          ) : (
            <Reveal stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((l, i) => (
                <PropertyCard key={l.id} listing={l} locale={locale} priority={i < 3} />
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  )
}

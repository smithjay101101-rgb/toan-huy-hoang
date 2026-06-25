import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/locale'
import { getListings } from '@/data'
import Seo from '@/components/Seo'
import PageHeader from '@/components/PageHeader'
import PropertyCard from '@/components/PropertyCard'
import Reveal from '@/components/Reveal'

export default function Projects() {
  const { t } = useTranslation()
  const locale = useLocale()
  const meta = t('meta.projects', { returnObjects: true }) as { title: string; description: string }
  // Developments. SWAP: wire AIRTABLE_TABLE_PROJECTS as a distinct source if the
  // client maintains projects separately from listings.
  const projects = getListings().filter((l) => l.category === 'Project')

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <PageHeader
        title={t('projects.headline')}
        lead={t('projects.body')}
        image={{
          avif: '/media/coast-cove.avif',
          webp: '/media/coast-cove.webp',
          jpg: '/media/coast-cove.jpg',
          alt: 'The Son Tra coastline, Da Nang',
        }}
      />

      <section className="bg-cream text-ink">
        <div className="container-lux pb-24 pt-20 lg:pb-32 lg:pt-28">
          {projects.length === 0 ? (
            <p className="py-20 text-center text-ink/55">{t('listings.empty')}</p>
          ) : (
            <Reveal stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((l, i) => (
                <PropertyCard key={l.id} listing={l} locale={locale} priority={i < 3} />
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  )
}

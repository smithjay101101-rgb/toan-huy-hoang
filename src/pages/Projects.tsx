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
      <PageHeader eyebrow={t('projects.eyebrow')} title={t('projects.headline')} lead={t('projects.body')} />

      <section className="section">
        <div className="container-lux">
          {projects.length === 0 ? (
            <p className="py-20 text-center text-muted">{t('listings.empty')}</p>
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

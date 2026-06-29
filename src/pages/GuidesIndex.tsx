import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/locale'
import { SITE } from '@/config/site'
import { getGuidesForLocale } from '@/data/guides'
import { guidesIndexSchema } from '@/lib/schema'
import Seo from '@/components/Seo'
import JsonLd from '@/components/JsonLd'
import GuideCard from '@/components/GuideCard'
import Reveal from '@/components/Reveal'

/**
 * Guides index. No hero image: a compact cream text header (title plus a single
 * intro line), then the list of guides. Featured first (sorted at build time).
 */
export default function GuidesIndex() {
  const { t } = useTranslation()
  const locale = useLocale()
  const guides = getGuidesForLocale(locale)

  return (
    <>
      <Seo
        title={`${t('guides.indexTitle')}. ${SITE.name}, ${SITE.city}.`}
        description={t('guides.indexIntro')}
      />
      <JsonLd data={guidesIndexSchema(locale)} />

      <section className="bg-cream text-ink" style={{ minHeight: '72vh' }}>
        <div className="container-lux pb-24 pt-36 lg:pb-32 lg:pt-44">
          <header className="max-w-[60ch]">
            <h1
              className="font-display font-semibold text-ink"
              style={{ fontSize: 'clamp(2.25rem, 1.6rem + 3vw, 3.75rem)', lineHeight: 1.05 }}
            >
              {t('guides.indexTitle')}
            </h1>
            <p className="lead-ink mt-5">{t('guides.indexIntro')}</p>
          </header>

          {guides.length === 0 ? (
            <p className="py-20 text-center text-ink/70">{t('listings.empty')}</p>
          ) : (
            <Reveal stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => (
                <GuideCard key={g.slug} guide={g} locale={locale} />
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  )
}

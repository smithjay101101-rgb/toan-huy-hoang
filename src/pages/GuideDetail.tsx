import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronRight } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { localePath } from '@/lib/locale'
import { formatDate } from '@/lib/format'
import { getGuideBySlug, getRelatedGuides, guideLocales, GUIDE_CATEGORY_KEY } from '@/data/guides'
import { blogPostingSchema, breadcrumbSchema } from '@/lib/schema'
import Seo from '@/components/Seo'
import JsonLd from '@/components/JsonLd'
import GuideCard from '@/components/GuideCard'
import PropertyImage from '@/components/PropertyImage'

export default function GuideDetail() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { slug } = useParams<{ slug: string }>()
  const guide = slug ? getGuideBySlug(slug) : undefined
  const content = guide?.locales[locale]

  if (!guide) {
    return (
      <>
        <Seo title="Not found" description="" />
        <section className="bg-cream text-ink">
          <div className="container-lux flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="font-display text-3xl text-ink">Not found</h1>
            <Link to={localePath(locale, 'guides')} className="btn btn-slate mt-8">
              {t('guides.indexTitle')}
            </Link>
          </div>
        </section>
      </>
    )
  }

  // Guide exists but not in this locale (e.g. the language switcher jumped here):
  // send the reader to the guides index for their language rather than a dead end.
  if (!content) {
    return <Navigate to={localePath(locale, 'guides')} replace />
  }

  const category = t(`guides.categories.${GUIDE_CATEGORY_KEY[guide.category]}`)
  const related = getRelatedGuides(guide, locale, 3)
  const available = guideLocales(guide)
  const crumbSep = <ChevronRight size={13} strokeWidth={1.5} className="text-ink/35" aria-hidden="true" />

  return (
    <>
      <Seo
        title={content.metaTitle}
        description={content.metaDescription || content.excerpt}
        image={guide.coverImage ? (guide.coverImage.avif ?? guide.coverImage.src) : undefined}
        type="article"
        locales={available}
      />
      <JsonLd
        data={[
          blogPostingSchema(guide, locale, content),
          breadcrumbSchema([
            { name: t('footer.signature'), path: localePath(locale) },
            { name: t('nav.guides'), path: localePath(locale, 'guides') },
            { name: content.title, path: localePath(locale, `guides/${guide.slug}`) },
          ]),
        ]}
      />

      <article className="bg-cream text-ink">
        <div className="container-lux pb-16 pt-36 lg:pt-44">
          <div className="mx-auto max-w-[72ch]">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink/70"
            >
              <Link to={localePath(locale)} className="transition-colors hover:text-gold-ink">
                {t('footer.signature')}
              </Link>
              {crumbSep}
              <Link to={localePath(locale, 'guides')} className="transition-colors hover:text-gold-ink">
                {t('nav.guides')}
              </Link>
              {crumbSep}
              <span className="text-ink/50">{category}</span>
            </nav>

            <h1
              className="mt-6 font-display font-semibold text-ink"
              style={{ fontSize: 'clamp(2rem, 1.5rem + 2.6vw, 3.25rem)', lineHeight: 1.08 }}
            >
              {content.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-ink/70">
              <span>
                {t('guides.by')} {guide.author}
              </span>
              <span className="opacity-40">·</span>
              <span>{formatDate(guide.publishedDate, locale)}</span>
              <span className="opacity-40">·</span>
              <span>
                {content.readingTime} {t('guides.minRead')}
              </span>
              <span className="opacity-40">·</span>
              <span className="text-gold-ink">{category}</span>
            </div>

            {/* Modest inline cover (not a full-bleed hero) */}
            {guide.coverImage && (
              <div className="mt-10 overflow-hidden rounded-[4px] border border-ink/10" style={{ aspectRatio: '16 / 9' }}>
                <PropertyImage image={guide.coverImage} priority sizes="(min-width: 768px) 72ch, 100vw" />
              </div>
            )}

            {/* Article body (Markdown, sanitized: react-markdown renders no raw HTML) */}
            <div className="prose prose-cream prose-headings:font-display mt-10 max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.bodyMarkdown}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Related guides (same category) */}
        {related.length > 0 && (
          <div className="border-t border-ink/10">
            <div className="container-lux py-16">
              <h2 className="eyebrow-ink">{t('guides.related')}</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((g) => (
                  <GuideCard key={g.slug} guide={g} locale={locale} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiet CTA to contact */}
        <div className="border-t border-ink/10">
          <div className="container-lux py-16 text-center">
            <h2 className="font-display font-semibold text-ink" style={{ fontSize: 'clamp(1.6rem, 1.3rem + 1.4vw, 2.25rem)', lineHeight: 1.12 }}>
              {t('guides.ctaTitle')}
            </h2>
            <p className="lead-ink mx-auto mt-3 max-w-[44ch]">{t('guides.ctaBody')}</p>
            <Link to={localePath(locale, 'contact')} className="btn btn-slate mt-8">
              {t('guides.ctaButton')}
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Guide } from '@/data/types'
import type { Locale } from '@/i18n'
import { localePath } from '@/lib/locale'
import { formatDate } from '@/lib/format'
import { GUIDE_CATEGORY_KEY } from '@/data/guides'
import PropertyImage from './PropertyImage'

/**
 * Guide preview card. Cover thumbnail only when present, otherwise an elegant
 * text-only card (no placeholder image). Used on the index and in related lists.
 */
export default function GuideCard({ guide, locale }: { guide: Guide; locale: Locale }) {
  const { t } = useTranslation()
  const c = guide.locales[locale]
  if (!c) return null
  const href = localePath(locale, `guides/${guide.slug}`)
  const category = t(`guides.categories.${GUIDE_CATEGORY_KEY[guide.category]}`)

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden border border-ink/10 bg-white transition-[transform,box-shadow,border-color] duration-300 ease-lux-out hover:-translate-y-1 hover:border-gold-ink/40 hover:shadow-[0_24px_60px_rgba(28,38,48,0.16)]"
    >
      {guide.coverImage && (
        <div className="aspect-[16/10] overflow-hidden">
          <PropertyImage
            image={guide.coverImage}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="text-[0.72rem] font-medium uppercase tracking-[0.26em] text-gold-ink">
          {category}
        </div>
        <h3
          className="mt-3 font-display font-semibold text-ink transition-colors group-hover:text-gold-ink"
          style={{ fontSize: '1.5rem', lineHeight: 1.12 }}
        >
          {c.title}
        </h3>
        <p className="mb-6 mt-3 text-sm leading-relaxed text-ink/70 line-clamp-3">{c.excerpt}</p>
        <div className="mt-auto flex items-center gap-3 border-t border-ink/12 pt-4 text-xs text-ink/70">
          <span>{formatDate(guide.publishedDate, locale)}</span>
          <span className="opacity-40">·</span>
          <span>
            {c.readingTime} {t('guides.minRead')}
          </span>
        </div>
      </div>
    </Link>
  )
}

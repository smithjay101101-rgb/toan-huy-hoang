import type { Guide, GuideCategory } from './types'
import type { Locale } from '@/i18n'
import guidesJson from './guides.json'

/** Maps the category enum to its short i18n key (guides.categories.*). */
export const GUIDE_CATEGORY_KEY: Record<GuideCategory, string> = {
  'Neighborhood Guides': 'neighborhood',
  'Buying Process': 'buying',
  Investment: 'investment',
  Lifestyle: 'lifestyle',
  Legal: 'legal',
}

// Build-time generated guides, imported statically so pages are fully prerendered.
export const guides = guidesJson as unknown as Guide[]

/** Locales a guide is fully translated into (in site order). */
export function guideLocales(g: Guide): Locale[] {
  return Object.keys(g.locales) as Locale[]
}

/** The guide's URL slug in a locale (base `slug` when no localized one). */
export function guideSlugFor(g: Guide, locale: Locale): string {
  return g.slugs?.[locale] ?? g.slug
}

/** Guides available in a given locale, preserving the build sort order. */
export function getGuidesForLocale(locale: Locale): Guide[] {
  return guides.filter((g) => g.locales[locale])
}

/** Look a guide up by ANY of its slugs (cross-locale links still resolve). */
export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(
    (g) => g.slug === slug || Object.values(g.slugs ?? {}).includes(slug),
  )
}

/** Same-category guides available in this locale, excluding the current one. */
export function getRelatedGuides(guide: Guide, locale: Locale, limit = 3): Guide[] {
  return guides
    .filter((g) => g.slug !== guide.slug && g.category === guide.category && g.locales[locale])
    .slice(0, limit)
}

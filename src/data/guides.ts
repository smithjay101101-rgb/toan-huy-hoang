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

export function getGuides(): Guide[] {
  return guides
}

/** Locales a guide is fully translated into (in site order). */
export function guideLocales(g: Guide): Locale[] {
  return Object.keys(g.locales) as Locale[]
}

/** Guides available in a given locale, preserving the build sort order. */
export function getGuidesForLocale(locale: Locale): Guide[] {
  return guides.filter((g) => g.locales[locale])
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}

/** Same-category guides available in this locale, excluding the current one. */
export function getRelatedGuides(guide: Guide, locale: Locale, limit = 3): Guide[] {
  return guides
    .filter((g) => g.slug !== guide.slug && g.category === guide.category && g.locales[locale])
    .slice(0, limit)
}

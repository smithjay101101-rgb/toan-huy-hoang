// Shared data shapes. Listings are produced at build time by
// scripts/fetch-airtable.mjs (Airtable when env present, mock otherwise)
// and written to src/data/listings.json.
import type { Locale } from '@/i18n'

export type DealType = 'buy' | 'rent'
export type Category = 'Villa' | 'Apartment' | 'Land' | 'Project'

export interface ImageAsset {
  /** Default source. Always present. May be an SVG placeholder. */
  src: string
  /** Optimized modern formats, present only after the build image pipeline runs. */
  avif?: string
  webp?: string
  width: number
  height: number
  alt: string
  /** True when this is a generated placeholder, not real photography. */
  placeholder?: boolean
}

export interface Localized {
  en: string
  vi: string
  /** Optional. Listing content is en/vi from Airtable; ru/ko fall back to en. */
  ru?: string
  ko?: string
}

export interface Listing {
  id: string
  slug: string
  title: Localized
  dealType: DealType
  category: Category
  district: string
  price: number
  currency: string
  bedrooms: number
  bathrooms: number
  areaM2: number
  shortDesc: Localized
  longDesc: Localized
  heroImage: ImageAsset
  gallery: ImageAsset[]
  lat: number | null
  lng: number | null
  featured: boolean
  datePublished: string
}

// Guides (blog) are produced at build time by scripts/fetch-guides.mjs from a
// separate Airtable "Guides" table, written to src/data/guides.json.
export type GuideCategory =
  | 'Neighborhood Guides'
  | 'Buying Process'
  | 'Investment'
  | 'Lifestyle'
  | 'Legal'

/** Per-locale guide content. A locale is present only when fully translated. */
export interface GuideContent {
  title: string
  excerpt: string
  bodyMarkdown: string
  metaTitle: string
  metaDescription: string
  /** Estimated reading time in minutes. */
  readingTime: number
}

export interface Guide {
  slug: string
  category: GuideCategory
  /** Optimized card thumbnail + optional OG image. Null when none. */
  coverImage: ImageAsset | null
  publishedDate: string
  updatedDate: string
  featured: boolean
  author: string
  /** Only locales that have both a title and body are present. */
  locales: Partial<Record<Locale, GuideContent>>
}

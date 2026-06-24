// Shared data shapes. Listings are produced at build time by
// scripts/fetch-airtable.mjs (Airtable when env present, mock otherwise)
// and written to src/data/listings.json.

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

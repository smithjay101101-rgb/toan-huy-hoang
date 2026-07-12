import type { Locale } from '@/i18n'
import type { DealType, Listing } from './types'
import listingsJson from './listings.json'

// Build-time generated data, imported statically so it is fully prerendered.
export const listings = listingsJson as unknown as Listing[]

/** The listing's URL slug in a locale (base `slug` when no localized one). */
export function slugFor(listing: Listing, locale: Locale): string {
  return listing.slugs?.[locale] ?? listing.slug
}

export function getListings(): Listing[] {
  return listings
}

export function getListingsByDeal(dealType: DealType): Listing[] {
  // Developments belong to the Projects page only. Keep them out of Buy/Rent
  // (which also keeps a stray "Project" off the Type filter those pages build
  // from their own results).
  return listings.filter((l) => l.dealType === dealType && l.category !== 'Project')
}

/** Look a listing up by ANY of its slugs, so a URL carrying another locale's
 *  slug (old link, pasted cross-language) still resolves. */
export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find(
    (l) => l.slug === slug || Object.values(l.slugs ?? {}).includes(slug),
  )
}

/** One prerender path slug per listing for a locale (localized or base). */
export function getAllSlugsFor(locale: Locale): string[] {
  return listings.map((l) => slugFor(l, locale))
}

export * from './types'

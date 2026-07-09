import type { DealType, Listing } from './types'
import listingsJson from './listings.json'

// Build-time generated data, imported statically so it is fully prerendered.
export const listings = listingsJson as unknown as Listing[]

export function getListings(): Listing[] {
  return listings
}

export function getListingsByDeal(dealType: DealType): Listing[] {
  // Developments belong to the Projects page only. Keep them out of Buy/Rent
  // (which also keeps a stray "Project" off the Type filter those pages build
  // from their own results).
  return listings.filter((l) => l.dealType === dealType && l.category !== 'Project')
}

export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug)
}

export function getAllSlugs(): string[] {
  return listings.map((l) => l.slug)
}

export * from './types'

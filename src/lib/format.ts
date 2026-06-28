import type { Listing } from '@/data/types'
import type { Locale } from '@/i18n'

const LOCALE_TAG: Record<Locale, string> = { en: 'en-US', vi: 'vi-VN', ru: 'ru-RU', ko: 'ko-KR' }

// Listings are priced in USD. Prices show as USD plus an approximate Vietnamese
// dong figure, the same on every language (e.g. "$450,000 · 11.4 tỷ ₫").
// SWAP: update this rate to the current market value periodically.
const USD_TO_VND = 25_400

function formatUsd(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

/** Approximate dong, in Vietnamese short form: tỷ (billion), tr (million). */
function formatVnd(usd: number): string {
  const vnd = usd * USD_TO_VND
  if (vnd >= 1_000_000_000) {
    const ty = (vnd / 1_000_000_000).toFixed(1).replace(/\.0$/, '')
    return `${ty} tỷ ₫`
  }
  if (vnd >= 1_000_000) {
    return `${Math.round(vnd / 1_000_000)}tr ₫`
  }
  return `${Math.round(vnd).toLocaleString('vi-VN')} ₫`
}

/**
 * USD and VND as separate strings, for layouts that stack them (cards). `vnd`
 * is '' for any non-USD listing.
 */
export function formatPriceParts(listing: Listing, locale: Locale): { usd: string; vnd: string } {
  if (listing.currency === 'USD') {
    return { usd: formatUsd(listing.price), vnd: formatVnd(listing.price) }
  }
  return { usd: formatPrice(listing, locale), vnd: '' }
}

export function formatPrice(listing: Listing, locale: Locale): string {
  const { price, currency } = listing
  // The standard case: USD listings show "USD · VND".
  if (currency === 'USD') {
    return `${formatUsd(price)} · ${formatVnd(price)}`
  }
  // Fallback for any non-USD listing: a single localized currency amount.
  try {
    return new Intl.NumberFormat(LOCALE_TAG[locale], {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `${currency} ${price.toLocaleString('en-US')}`
  }
}

export function formatArea(area: number, locale: Locale): string {
  return `${area.toLocaleString(LOCALE_TAG[locale])} m²`
}

export function pick<T>(value: { en: T; vi: T; ru?: T; ko?: T }, locale: Locale): T {
  // Listing data is en/vi; other locales (ru, ko) fall back to English content
  // unless the matching column is filled in Airtable.
  return value[locale] ?? value.en
}

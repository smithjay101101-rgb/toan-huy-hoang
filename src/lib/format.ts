import type { Listing } from '@/data/types'
import type { Locale } from '@/i18n'

const LOCALE_TAG: Record<Locale, string> = { en: 'en-US', vi: 'vi-VN' }

export function formatPrice(listing: Listing, locale: Locale): string {
  const { price, currency } = listing
  try {
    const fmt = new Intl.NumberFormat(LOCALE_TAG[locale], {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    return fmt.format(price)
  } catch {
    return `${currency} ${price.toLocaleString(LOCALE_TAG[locale])}`
  }
}

export function formatArea(area: number, locale: Locale): string {
  return `${area.toLocaleString(LOCALE_TAG[locale])} m²`
}

export function pick<T>(value: { en: T; vi: T }, locale: Locale): T {
  return value[locale]
}

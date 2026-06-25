import type { Locale } from '@/i18n'

export interface LocationOption {
  /** Stable value stored in filters and in listing.district (ASCII, no diacritics). */
  value: string
  en: string
  vi: string
  ru: string
}

/**
 * The agent's coverage areas, in display order. `value` is the ASCII form and is
 * what listing.district stores, so filtering and lookups are locale-independent.
 * Vietnamese labels carry full diacritics; English labels are plain ASCII.
 */
export const LOCATIONS: LocationOption[] = [
  { value: 'Hai Chau', en: 'Hai Chau', vi: 'Hải Châu', ru: 'Хайчау' },
  { value: 'Son Tra', en: 'Son Tra', vi: 'Sơn Trà', ru: 'Сон Тра' },
  { value: 'Ngu Hanh Son', en: 'Ngu Hanh Son', vi: 'Ngũ Hành Sơn', ru: 'Нгу Хань Шон' },
  { value: 'An Thuong', en: 'An Thuong', vi: 'An Thượng', ru: 'Ан Тхыонг' },
  { value: 'My An', en: 'My An', vi: 'Mỹ An', ru: 'Ми Ан' },
  { value: 'Hoa Xuan', en: 'Hoa Xuan', vi: 'Hòa Xuân', ru: 'Хоа Суан' },
  { value: 'Nam Viet A', en: 'Nam Viet A', vi: 'Nam Việt Á', ru: 'Нам Вьет А' },
  { value: 'Lien Chieu', en: 'Lien Chieu', vi: 'Liên Chiểu', ru: 'Льен Чьеу' },
  { value: 'Thanh Khe', en: 'Thanh Khe', vi: 'Thanh Khê', ru: 'Тхань Кхе' },
  { value: 'Cam Le', en: 'Cam Le', vi: 'Cẩm Lệ', ru: 'Кам Ле' },
  { value: 'FPT City', en: 'FPT City', vi: 'FPT City', ru: 'FPT City' },
]

export function localizeDistrict(district: string, locale: Locale): string {
  const match = LOCATIONS.find(
    (l) => l.value === district || l.en === district || l.vi === district,
  )
  return match ? match[locale] : district
}

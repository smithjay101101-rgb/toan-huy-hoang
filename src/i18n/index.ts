import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import vi from './locales/vi'
import ru from './locales/ru'
import ko from './locales/ko'

export const LOCALES = ['en', 'vi', 'ru', 'ko'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  vi: 'VI',
  ru: 'RU',
  ko: 'KO',
}

// Single shared instance. During SSG each page sets the language before render.
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      ru: { translation: ru },
      ko: { translation: ko },
    },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    returnObjects: true,
  })
}

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'vi' || value === 'ru' || value === 'ko'
}

/**
 * Swap the locale prefix on a path while preserving the rest.
 * "/en/property/abc" -> "/vi/property/abc"
 */
export function swapLocaleInPath(path: string, target: Locale): string {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return `/${target}`
  if (isLocale(segments[0])) {
    segments[0] = target
  } else {
    segments.unshift(target)
  }
  return '/' + segments.join('/')
}

export default i18n

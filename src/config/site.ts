// Central site configuration.
import type { Locale } from '@/i18n'

export const SITE = {
  name: 'Toan Huy Hoang',
  legalName: 'Toan Huy Hoang Luxury Real Estate',
  // Live origin, injected at build time from SITE_URL (see vite.config.ts) so the
  // canonical/OG tags and the sitemap always agree. Defaults to the GitHub Pages
  // domain; set SITE_URL to the custom domain once it goes live.
  url: __SITE_URL__,
  city: 'Da Nang',
  region: 'Da Nang',
  country: 'VN',
  founder: 'Toan Huy Hoang',
  // Toan's real business inbox. The contact form delivers here via FormSubmit.
  email: 'toanhuyhoang.bds@gmail.com',
  // Street address (English form; the localized strings live in the i18n dicts).
  streetAddress: '7th Floor, Camelia Building, 773 Ngo Quyen, An Hai Ward',
  ogImage: '/og/og-default.jpg',
} as const

// ---------------------------------------------------------------------------
// Per-locale contact channels. VI and EN share the Zalo/WhatsApp number; the
// Korean audience gets KakaoTalk and the Russian audience gets Telegram, each
// on the second number.
// ---------------------------------------------------------------------------

export type ChannelKind = 'zalo' | 'whatsapp' | 'kakao' | 'telegram'

export interface ContactChannel {
  kind: ChannelKind
  /** Brand name, shown verbatim in every language. */
  label: string
  href: string
}

export interface LocaleContact {
  /** Human formatting, e.g. "0917 112 855". */
  phoneDisplay: string
  /** E.164 for tel: links and structured data. */
  phoneTel: string
  channels: ContactChannel[]
}

// KakaoTalk open-profile link built from the client's username. If Kakao ever
// reports the link unavailable, replace with the exact pf.kakao.com or
// open.kakao.com URL from the client. Empty = falls back to a phone call link.
export const KAKAO_CHANNEL_URL = 'https://open.kakao.com/me/danangluxury'

// The client's Telegram username (without @). Empty = fall back to the
// phone-number deep link.
export const TELEGRAM_USERNAME = 'danangluxuryrealty'

const ZALO_WHATSAPP: LocaleContact = {
  phoneDisplay: '0917 112 855',
  phoneTel: '+84917112855',
  channels: [
    { kind: 'zalo', label: 'Zalo', href: 'https://zalo.me/0917112855' },
    { kind: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/84917112855' },
  ],
}

const KAKAO: LocaleContact = {
  phoneDisplay: '0943 436 888',
  phoneTel: '+84943436888',
  channels: [
    {
      kind: 'kakao',
      label: 'KakaoTalk',
      href: KAKAO_CHANNEL_URL || 'tel:+84943436888',
    },
  ],
}

const TELEGRAM: LocaleContact = {
  phoneDisplay: '0943 436 888',
  phoneTel: '+84943436888',
  channels: [
    {
      kind: 'telegram',
      label: 'Telegram',
      // t.me links open the app on phones; tg://resolve?phone=84943436888 is
      // the raw app deep link should a native-only entry ever be needed.
      href: TELEGRAM_USERNAME ? `https://t.me/${TELEGRAM_USERNAME}` : 'https://t.me/+84943436888',
    },
  ],
}

export const CONTACTS: Record<Locale, LocaleContact> = {
  en: ZALO_WHATSAPP,
  vi: ZALO_WHATSAPP,
  ko: KAKAO,
  ru: TELEGRAM,
}

export function contactFor(locale: Locale): LocaleContact {
  return CONTACTS[locale] ?? CONTACTS.en
}

// ---------------------------------------------------------------------------
// The contact page shows EVERY channel regardless of locale, each opening a
// chat with a prefilled inquiry the visitor can personalize. Only WhatsApp,
// Telegram and mail support prefill; Zalo and Kakao open the chat directly.
// ---------------------------------------------------------------------------

export const PHONES = [
  { display: '0917 112 855', tel: '+84917112855' },
  { display: '0943 436 888', tel: '+84943436888' },
] as const

export function allChannels(message: string): ContactChannel[] {
  const text = encodeURIComponent(message)
  return [
    { kind: 'zalo', label: 'Zalo', href: 'https://zalo.me/0917112855' },
    { kind: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/84917112855?text=${text}` },
    {
      kind: 'kakao',
      label: 'KakaoTalk',
      href: KAKAO_CHANNEL_URL || 'tel:+84943436888',
    },
    {
      kind: 'telegram',
      label: 'Telegram',
      href: TELEGRAM_USERNAME
        ? `https://t.me/${TELEGRAM_USERNAME}?text=${text}`
        : 'https://t.me/+84943436888',
    },
  ]
}

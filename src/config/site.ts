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

// Toan's YouTube channel: linked from the Meet Toan section and the footer,
// and listed as sameAs in the structured data.
export const YOUTUBE_URL = 'https://www.youtube.com/channel/UCga6gXWL6YcDrefxO2t43Kg'

// ---------------------------------------------------------------------------
// Social platforms (small footer icon row). Only entries with a filled href
// render, so the row grows as the client sends links. SWAP: paste the real
// page/channel URLs as Toan provides them. The Telegram entry here is the
// public broadcast CHANNEL (different from the RU contact chat above).
// ---------------------------------------------------------------------------

export type SocialKind = 'youtube' | 'facebook' | 'tiktok' | 'naver' | 'telegram'

export interface SocialLink {
  kind: SocialKind
  /** Brand name, shown verbatim as the accessible label in every language. */
  label: string
  href: string
}

const SOCIALS: Record<SocialKind, SocialLink> = {
  youtube: { kind: 'youtube', label: 'YouTube', href: YOUTUBE_URL },
  facebook: { kind: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/houseforrentdanangvietnam' },
  tiktok: { kind: 'tiktok', label: 'TikTok', href: '' },
  naver: { kind: 'naver', label: 'Naver Blog', href: '' },
  telegram: { kind: 'telegram', label: 'Telegram', href: 'https://t.me/danangluxuryrealty' },
}

// Per the client (2026-07-09, rev): every language shows the same two brand
// channels — YouTube + Facebook. (Superseded the earlier per-locale scheme of
// Naver for KO / Telegram for RU.) YouTube is live; Facebook appears once its
// page URL is filled above. Telegram/Naver stay in SOCIALS, unused, in case
// they are wanted back.
const YT_FB: SocialKind[] = ['youtube', 'facebook']
const SOCIAL_ORDER: Record<Locale, SocialKind[]> = {
  en: YT_FB,
  vi: YT_FB,
  ko: YT_FB,
  ru: YT_FB,
}

export function socialsFor(locale: Locale): SocialLink[] {
  return (SOCIAL_ORDER[locale] ?? SOCIAL_ORDER.en).map((k) => SOCIALS[k]).filter((s) => s.href)
}

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
  /** Small secondary text (e.g. the KakaoTalk ID when no web link exists). */
  hint?: string
}

export interface LocaleContact {
  /** Human formatting, e.g. "0917 112 855". */
  phoneDisplay: string
  /** E.164 for tel: links and structured data. */
  phoneTel: string
  channels: ContactChannel[]
}

// KakaoTalk Open Profile link for the ID below. LAUNCH ITEM: the client must
// create the Open Profile inside the KakaoTalk app (Profile -> Open Profile ->
// search handle "danangluxury") — Kakao offers no way to create it from
// outside the app. Until that exists, this URL shows Kakao's "profile not
// found" page. Set to '' to fall back to a phone call showing the ID.
export const KAKAO_CHANNEL_URL = 'https://open.kakao.com/me/danangluxury'
export const KAKAO_ID = 'danangluxury'

// The client's Telegram username (without @). Empty = fall back to the
// phone-number deep link.
export const TELEGRAM_USERNAME = 'danangluxuryrealty'

// One definition per messenger, shared by the contact-page channel groups and
// the consultation popup below.
const CH_ZALO: ContactChannel = { kind: 'zalo', label: 'Zalo', href: 'https://zalo.me/0917112855' }
const CH_WHATSAPP: ContactChannel = { kind: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/84917112855' }
const CH_KAKAO: ContactChannel = {
  kind: 'kakao',
  label: 'KakaoTalk',
  href: KAKAO_CHANNEL_URL || 'tel:+84943436888',
  hint: KAKAO_CHANNEL_URL ? undefined : `ID: ${KAKAO_ID}`,
}
const CH_TELEGRAM: ContactChannel = {
  kind: 'telegram',
  label: 'Telegram',
  // t.me links open the app on phones; tg://resolve?phone=84943436888 is
  // the raw app deep link should a native-only entry ever be needed.
  href: TELEGRAM_USERNAME ? `https://t.me/${TELEGRAM_USERNAME}` : 'https://t.me/+84943436888',
}

const ZALO_WHATSAPP: LocaleContact = {
  phoneDisplay: '0917 112 855',
  phoneTel: '+84917112855',
  channels: [CH_ZALO, CH_WHATSAPP],
}

// Korean audience: Zalo plus KakaoTalk (per the client).
const KO_CHANNELS: LocaleContact = {
  phoneDisplay: '0943 436 888',
  phoneTel: '+84943436888',
  channels: [CH_ZALO, CH_KAKAO],
}

// Russian audience: WhatsApp (on the 0917 number) plus Telegram.
const RU_CHANNELS: LocaleContact = {
  phoneDisplay: '0943 436 888',
  phoneTel: '+84943436888',
  channels: [CH_WHATSAPP, CH_TELEGRAM],
}

export const CONTACTS: Record<Locale, LocaleContact> = {
  en: ZALO_WHATSAPP,
  vi: ZALO_WHATSAPP,
  ko: KO_CHANNELS,
  ru: RU_CHANNELS,
}

export function contactFor(locale: Locale): LocaleContact {
  return CONTACTS[locale] ?? CONTACTS.en
}

// ---------------------------------------------------------------------------
// The contact page shows the locale's own channel group (EN/VI on the 0917
// number, KO/RU on the 0943 number), each opening a chat with a prefilled
// inquiry where the platform supports it (WhatsApp, Telegram; Zalo and Kakao
// open the chat directly).
// ---------------------------------------------------------------------------

// WhatsApp is the only channel whose link accepts a prefilled draft.
// Telegram: t.me/<username> profile links ignore ?text= (only share and
// bot links prefill), so the chat opens without a draft. No param added.
function withPrefill(ch: ContactChannel, text: string): ContactChannel {
  if (ch.kind === 'whatsapp' && ch.href.startsWith('https://wa.me/')) {
    return { ...ch, href: `${ch.href}?text=${text}` }
  }
  return ch
}

export function channelsFor(locale: Locale, message: string): ContactChannel[] {
  const text = encodeURIComponent(message)
  return contactFor(locale).channels.map((ch) => withPrefill(ch, text))
}

// ---------------------------------------------------------------------------
// "Book a Consultation" popup: every locale leads with the messengers its
// audience actually uses (client spec 2026-07-12) — EN WhatsApp/Zalo/Telegram,
// VI WhatsApp/Zalo, KO KakaoTalk/WhatsApp, RU Telegram/WhatsApp.
// ---------------------------------------------------------------------------

const CONSULT_CHANNELS: Record<Locale, ContactChannel[]> = {
  en: [CH_WHATSAPP, CH_ZALO, CH_TELEGRAM],
  vi: [CH_WHATSAPP, CH_ZALO],
  ko: [CH_KAKAO, CH_WHATSAPP],
  ru: [CH_TELEGRAM, CH_WHATSAPP],
}

export function consultChannelsFor(locale: Locale, message: string): ContactChannel[] {
  const text = encodeURIComponent(message)
  return (CONSULT_CHANNELS[locale] ?? CONSULT_CHANNELS.en).map((ch) => withPrefill(ch, text))
}

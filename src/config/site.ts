// Central site configuration. Values marked SWAP are placeholders; replace with
// the client's real details before launch.
export const SITE = {
  name: 'Toan Huy Hoang',
  legalName: 'Toan Huy Hoang Luxury Real Estate',
  // SWAP: production domain on Cloudflare Pages.
  url: 'https://toanhuyhoang.com',
  city: 'Da Nang',
  region: 'Da Nang',
  country: 'VN',
  founder: 'Toan Huy Hoang',
  // SWAP: real Zalo number (digits only, international format without +).
  zaloNumber: '84905123456',
  // SWAP: real phone and email.
  phone: '+84 905 123 456',
  email: 'private@toanhuyhoang.com',
  ogImage: '/og/og-default.jpg',
} as const

export function zaloLink(): string {
  return `https://zalo.me/${SITE.zaloNumber}`
}

// WhatsApp deep link, derived from the same SWAP phone number as everything else
// (digits only, no +). Update SITE.phone above to change it everywhere.
export function whatsappLink(): string {
  return `https://wa.me/${SITE.phone.replace(/\D/g, '')}`
}

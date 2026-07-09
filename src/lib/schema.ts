import { SITE, CONTACTS, YOUTUBE_URL } from '@/config/site'
import { localePath } from '@/lib/locale'
import { formatArea, pick } from '@/lib/format'
import type { Listing, Guide, GuideContent } from '@/data/types'
import type { Locale } from '@/i18n'

export function realEstateAgentSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SITE.url}/#agent`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    image: SITE.url + SITE.ogImage,
    founder: { '@type': 'Person', name: SITE.founder },
    areaServed: { '@type': 'City', name: SITE.city },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.streetAddress,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    telephone: CONTACTS.en.phoneTel,
    email: SITE.email,
    knowsLanguage: ['en', 'vi', 'ru', 'ko'],
    sameAs: [YOUTUBE_URL],
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#org`,
    name: SITE.legalName,
    url: SITE.url,
    logo: SITE.url + SITE.ogImage,
    sameAs: [YOUTUBE_URL],
  }
}

export function listingSchema(listing: Listing, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: pick(listing.title, locale),
    description: pick(listing.shortDesc, locale),
    url: SITE.url + localePath(locale, `property/${listing.slug}`),
    image: SITE.url + (listing.heroImage?.og ?? listing.heroImage?.avif ?? listing.heroImage?.src ?? ''),
    datePosted: listing.datePublished,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency,
      availability: listing.availability
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
    },
    about: {
      '@type': 'Residence',
      name: pick(listing.title, locale),
      ...(listing.areaM2
        ? {
            floorSize: {
              '@type': 'QuantitativeValue',
              value: listing.areaM2,
              unitCode: 'MTK',
              description: formatArea(listing.areaM2, locale),
            },
          }
        : {}),
      ...(listing.bedrooms ? { numberOfBedrooms: listing.bedrooms } : {}),
      ...(listing.bathrooms ? { numberOfBathroomsTotal: listing.bathrooms } : {}),
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.district || SITE.city,
        addressRegion: SITE.region,
        addressCountry: SITE.country,
      },
      ...(listing.lat != null && listing.lng != null
        ? { geo: { '@type': 'GeoCoordinates', latitude: listing.lat, longitude: listing.lng } }
        : {}),
    },
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: SITE.url + item.path,
    })),
  }
}

export function blogPostingSchema(guide: Guide, locale: Locale, content: GuideContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: content.title,
    description: content.metaDescription || content.excerpt,
    datePublished: guide.publishedDate,
    dateModified: guide.updatedDate || guide.publishedDate,
    inLanguage: locale,
    author: { '@type': 'Person', name: guide.author },
    publisher: {
      '@type': 'Organization',
      name: SITE.legalName,
      logo: { '@type': 'ImageObject', url: SITE.url + SITE.ogImage },
    },
    ...(guide.coverImage ? { image: SITE.url + (guide.coverImage.og ?? guide.coverImage.avif ?? guide.coverImage.src) } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': SITE.url + localePath(locale, `guides/${guide.slug}`),
    },
  }
}

export function guidesIndexSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Guides',
    url: SITE.url + localePath(locale, 'guides'),
    inLanguage: locale,
    publisher: { '@type': 'Organization', name: SITE.legalName, url: SITE.url },
  }
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

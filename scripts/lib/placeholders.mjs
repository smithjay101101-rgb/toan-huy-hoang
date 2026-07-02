// Generates tasteful dark cinematic SVG placeholders that match the brand grade,
// plus mock listing data, so the site builds and runs before real assets arrive.
// Every placeholder is a clearly marked swap point.
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Deterministic pseudo-random so builds are stable.
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/**
 * A dark, restrained scene: deep near-black green gradient, a low horizon,
 * a faint light source (fog glow), a fine gold hairline. No text noise.
 */
export function sceneSvg({ w = 1600, h = 1067, seed = 1, label = '' }) {
  const r = rng(seed)
  const horizon = Math.round(h * (0.58 + r() * 0.18))
  const glowX = Math.round(w * (0.2 + r() * 0.6))
  const glowY = Math.round(horizon * (0.5 + r() * 0.3))
  const ridges = Array.from({ length: 3 }, (_, i) => {
    const base = horizon - i * Math.round(h * 0.06) - 8
    const amp = 18 + r() * 26
    const pts = []
    for (let x = 0; x <= w; x += Math.round(w / 10)) {
      pts.push(`${x},${Math.round(base - Math.sin((x / w) * Math.PI * (1 + i)) * amp)}`)
    }
    const opacity = (0.16 - i * 0.04).toFixed(2)
    return `<polyline points="0,${h} ${pts.join(' ')} ${w},${h}" fill="#0B1712" fill-opacity="${opacity}" stroke="none"/>`
  }).join('')

  const labelMark = label
    ? `<text x="${w / 2}" y="${h - 28}" text-anchor="middle" fill="#C7A96B" fill-opacity="0.5" font-family="Georgia, serif" font-size="20" letter-spacing="4">${label}</text>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <radialGradient id="glow" cx="${((glowX / w) * 100).toFixed(1)}%" cy="${((glowY / h) * 100).toFixed(1)}%" r="70%">
      <stop offset="0%" stop-color="#1c2a22" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#0B1712" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#070707"/>
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070707" stop-opacity="0.5"/>
      <stop offset="55%" stop-color="#070707" stop-opacity="0"/>
      <stop offset="100%" stop-color="#070707" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${ridges}
  <circle cx="${glowX}" cy="${glowY}" r="${Math.round(h * 0.22)}" fill="#C7A96B" fill-opacity="0.05"/>
  <rect width="${w}" height="${h}" fill="url(#vignette)"/>
  <rect x="${w / 2 - 40}" y="${h - 56}" width="80" height="1" fill="#C7A96B" fill-opacity="0.6"/>
  ${labelMark}
</svg>`
}

export async function writePlaceholder(publicDir, relPath, svg) {
  const full = join(publicDir, relPath)
  await mkdir(join(full, '..'), { recursive: true })
  await writeFile(full, svg, 'utf8')
  return '/' + relPath.split('\\').join('/')
}

function asset(src, w, h, alt) {
  return { src, width: w, height: h, alt, placeholder: true }
}

const MOCK = [
  {
    slug: 'oceanfront-villa-non-nuoc',
    title: { en: 'Oceanfront Villa, Non Nuoc', vi: 'Biệt Thự Ven Biển, Non Nước' },
    dealType: 'buy', category: 'Villa', district: 'Ngu Hanh Son',
    price: 4200000, currency: 'USD', bedrooms: 5, bathrooms: 6, areaM2: 620,
    short: {
      en: 'A private beachfront residence where the South China Sea is the only neighbour.',
      vi: 'Một dinh thự ven biển riêng tư nơi Biển Đông là người hàng xóm duy nhất.',
    },
    featured: true, lat: 16.0006, lng: 108.2705,
  },
  {
    slug: 'han-river-penthouse',
    title: { en: 'Han River Penthouse', vi: 'Penthouse Sông Hàn' },
    dealType: 'buy', category: 'Apartment', district: 'Hai Chau',
    price: 1850000, currency: 'USD', bedrooms: 3, bathrooms: 3, areaM2: 240,
    short: {
      en: 'The skyline at eye level, the river below, the bridges lit at night.',
      vi: 'Đường chân trời ngang tầm mắt, dòng sông phía dưới, những cây cầu rực sáng về đêm.',
    },
    featured: true, lat: 16.0678, lng: 108.2237,
  },
  {
    slug: 'son-tra-hillside-estate',
    title: { en: 'Son Tra Hillside Estate', vi: 'Dinh Thự Sườn Đồi Sơn Trà' },
    dealType: 'buy', category: 'Villa', district: 'Son Tra',
    price: 6800000, currency: 'USD', bedrooms: 6, bathrooms: 7, areaM2: 940,
    short: {
      en: 'Above the peninsula, wrapped in jungle, the whole bay laid out beneath.',
      vi: 'Trên bán đảo, ôm trọn trong rừng xanh, cả vịnh trải dài bên dưới.',
    },
    featured: true, lat: 16.1059, lng: 108.2939,
  },
  {
    slug: 'my-khe-beach-residence',
    title: { en: 'My Khe Beach Residence', vi: 'Căn Hộ Biển Mỹ Khê' },
    dealType: 'rent', category: 'Apartment', district: 'Son Tra',
    price: 3200, currency: 'USD', bedrooms: 2, bathrooms: 2, areaM2: 120,
    short: {
      en: 'Steps from one of Asia finest beaches, considered and calm.',
      vi: 'Vài bước chân tới một trong những bãi biển đẹp nhất châu Á, tinh tế và tĩnh lặng.',
    },
    featured: true, lat: 16.0598, lng: 108.2497,
  },
  {
    slug: 'an-thuong-garden-villa',
    title: { en: 'An Thuong Garden Villa', vi: 'Biệt Thự Vườn An Thượng' },
    dealType: 'rent', category: 'Villa', district: 'Ngu Hanh Son',
    price: 5400, currency: 'USD', bedrooms: 4, bathrooms: 4, areaM2: 360,
    short: {
      en: 'A walled garden home in the quiet heart of the expat quarter.',
      vi: 'Một ngôi nhà vườn có tường bao trong lòng khu phố yên tĩnh.',
    },
    featured: false, lat: 16.0445, lng: 108.2462,
  },
  {
    slug: 'coastal-land-nam-o',
    title: { en: 'Coastal Land Parcel, Nam O', vi: 'Đất Ven Biển, Nam Ô' },
    dealType: 'buy', category: 'Land', district: 'Lien Chieu',
    price: 980000, currency: 'USD', bedrooms: 0, bathrooms: 0, areaM2: 1100,
    short: {
      en: 'A rare seafront parcel on the city emerging northern shore.',
      vi: 'Một lô đất ven biển hiếm có trên bờ bắc đang phát triển của thành phố.',
    },
    featured: false, lat: 16.1167, lng: 108.1289,
  },
  {
    slug: 'marble-mountain-townhouse',
    title: { en: 'Marble Mountain Townhouse', vi: 'Nhà Phố Ngũ Hành Sơn' },
    dealType: 'rent', category: 'Apartment', district: 'Ngu Hanh Son',
    price: 1800, currency: 'USD', bedrooms: 3, bathrooms: 2, areaM2: 150,
    short: {
      en: 'A modern townhouse between the mountains and the sea.',
      vi: 'Một căn nhà phố hiện đại giữa núi và biển.',
    },
    featured: false, lat: 16.0036, lng: 108.2628,
  },
  {
    slug: 'han-riverside-development',
    title: { en: 'Han Riverside Development', vi: 'Dự Án Ven Sông Hàn' },
    dealType: 'buy', category: 'Project', district: 'Hai Chau',
    price: 320000, currency: 'USD', bedrooms: 1, bathrooms: 1, areaM2: 65,
    short: {
      en: 'Early release residences in a landmark riverside tower.',
      vi: 'Những căn hộ mở bán sớm trong tòa tháp ven sông biểu tượng.',
    },
    featured: false, lat: 16.0721, lng: 108.2256,
  },
]

/**
 * Writes all placeholder SVGs and a mock listings.json.
 * Used as the no-credentials fallback for the build pipeline.
 */
export async function writeMockData({ publicDir, dataFile }) {
  // Brand-level placeholders consumed directly by components.
  await writePlaceholder(publicDir, 'placeholders/hero.svg', sceneSvg({ seed: 7, label: 'HERO . SWAP' }))
  await writePlaceholder(publicDir, 'placeholders/founder.svg', sceneSvg({ w: 1200, h: 1500, seed: 99, label: 'PORTRAIT . SWAP' }))
  // Cinema fallback scenes: bridge fog, along the bridge, coastline, skyline, descent.
  const cinemaLabels = ['GOLDEN BRIDGE', 'THE BRIDGE', 'COASTLINE', 'SKYLINE', 'THE CITY']
  for (let i = 0; i < cinemaLabels.length; i++) {
    await writePlaceholder(publicDir, `placeholders/cinema-${i + 1}.svg`, sceneSvg({ seed: 20 + i * 13, label: cinemaLabels[i] }))
  }

  const out = []
  for (let i = 0; i < MOCK.length; i++) {
    const m = MOCK[i]
    const dir = `placeholders/listings/${m.slug}`
    const heroSrc = await writePlaceholder(publicDir, `${dir}/hero.svg`, sceneSvg({ seed: 100 + i * 7, label: m.category.toUpperCase() }))
    const gallery = []
    for (let g = 0; g < 4; g++) {
      const gSrc = await writePlaceholder(publicDir, `${dir}/g${g + 1}.svg`, sceneSvg({ seed: 500 + i * 11 + g * 3 }))
      gallery.push(asset(gSrc, 1600, 1067, `${m.title.en}, view ${g + 1}`))
    }
    out.push({
      id: `mock-${i + 1}`,
      slug: m.slug,
      code: `TH-${101 + i}`,
      title: m.title,
      dealType: m.dealType,
      category: m.category,
      district: m.district,
      price: m.price,
      currency: m.currency,
      bedrooms: m.bedrooms,
      bathrooms: m.bathrooms,
      areaM2: m.areaM2,
      shortDesc: m.short,
      longDesc: {
        en: `${m.short.en} ${m.title.en} sits within ${m.district}, one of Da Nang most considered locations. This is placeholder copy held to the brand grade and ready to be replaced with the final description once photography and details are confirmed.`,
        vi: `${m.short.vi} ${m.title.vi} tọa lạc tại ${m.district}, một trong những vị trí được cân nhắc kỹ lưỡng nhất Đà Nẵng. Đây là nội dung mẫu giữ đúng chuẩn thương hiệu, sẵn sàng thay thế bằng mô tả cuối cùng khi hình ảnh và chi tiết được xác nhận.`,
      },
      heroImage: asset(heroSrc, 1600, 1067, m.title.en),
      gallery,
      lat: m.lat,
      lng: m.lng,
      featured: m.featured,
      datePublished: `2026-0${(i % 6) + 1}-1${i % 9}`,
    })
  }

  await mkdir(join(dataFile, '..'), { recursive: true })
  await writeFile(dataFile, JSON.stringify(out, null, 2), 'utf8')
  return out.length
}

// Build-time data pipeline.
//
// When Airtable credentials are present, fetch Published listings, download each
// image attachment, optimize to AVIF + WebP with explicit dimensions (no runtime
// hotlinking of Airtable URLs), and write src/data/listings.json.
//
// When credentials are absent, fall back to tasteful placeholders so the site
// still builds and runs locally. Every placeholder is a marked swap point.
//
// Env (Cloudflare build settings, never committed):
//   AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_LISTINGS, AIRTABLE_TABLE_PROJECTS
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { writeMockData } from './lib/placeholders.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DIR = join(ROOT, 'public')
const DATA_FILE = join(ROOT, 'src', 'data', 'listings.json')

const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_LISTINGS,
  // Temporary: when '1', use the site's existing photos as listing images
  // instead of the Airtable attachments (until real photos are uploaded).
  FAKE_IMAGES,
} = process.env

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Canonical filter values (keep in sync with src/data/locations.ts and the
// Category type). The site filters by exact match, so rows typed with accents,
// different casing, or stray spaces are normalized to these.
const DISTRICTS = ['Hai Chau', 'Son Tra', 'Ngu Hanh Son', 'An Thuong', 'My An', 'Hoa Xuan', 'Nam Viet A', 'Lien Chieu', 'Thanh Khe', 'Cam Le', 'FPT City']
const CATEGORIES = ['Villa', 'Apartment', 'Land', 'Project']

function foldKey(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function canonicalDistrict(raw) {
  if (!raw) return ''
  const key = foldKey(raw)
  return DISTRICTS.find((d) => foldKey(d) === key) ?? String(raw).trim()
}

function canonicalCategory(raw) {
  if (!raw) return 'Villa'
  const key = foldKey(raw)
  return CATEGORIES.find((c) => foldKey(c) === key) ?? 'Villa'
}

async function fetchAirtableRecords() {
  const records = []
  let offset
  const base = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_LISTINGS)}`
  do {
    const url = new URL(base)
    url.searchParams.set('filterByFormula', "{status}='Published'")
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    })
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`)
    const json = await res.json()
    records.push(...json.records)
    offset = json.offset
  } while (offset)
  return records
}

async function optimizeImage(sharp, url, outDir, name, alt) {
  await mkdir(outDir, { recursive: true })
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  const img = sharp(buf)
  const meta = await img.metadata()
  const width = meta.width ?? 1600
  const height = meta.height ?? 1067
  const rel = outDir.slice(PUBLIC_DIR.length).split('\\').join('/')
  await img.clone().avif({ quality: 60 }).toFile(join(outDir, `${name}.avif`))
  await img.clone().webp({ quality: 74 }).toFile(join(outDir, `${name}.webp`))
  return {
    src: `${rel}/${name}.webp`,
    avif: `${rel}/${name}.avif`,
    webp: `${rel}/${name}.webp`,
    width,
    height,
    alt,
  }
}

function localized(fields, base) {
  const en = fields[`${base}_en`] ?? ''
  return {
    en,
    vi: fields[`${base}_vi`] ?? en,
    ru: fields[`${base}_ru`] ?? en,
    ko: fields[`${base}_ko`] ?? en,
  }
}

// A listing published before its photos are uploaded must never produce a null
// heroImage — that would crash PropertyCard/PropertyDetail. Fall back to one of
// the shipped generic images (same set PropertyCard hashes into), marked as a
// placeholder so the card treatment knows it's not real photography.
function placeholderAsset(slug, alt) {
  let h = 0
  for (const c of String(slug)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const base = `/media/placeholders/prop-${(h % 8) + 1}`
  return { src: `${base}.jpg`, avif: `${base}.avif`, webp: `${base}.webp`, width: 800, height: 600, alt, placeholder: true }
}

// Stand-in imagery: deterministically reuse one of the site's existing Da Nang
// photos as a listing image. Enabled by FAKE_IMAGES; remove the flag once real
// photos are uploaded to Airtable.
const FAKE_PHOTOS = ['hero-city', 'golden-bridge', 'coast-cove']
function fakeAsset(slug, alt) {
  let h = 0
  for (const c of String(slug)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const base = `/media/${FAKE_PHOTOS[h % FAKE_PHOTOS.length]}`
  return { src: `${base}.jpg`, avif: `${base}.avif`, webp: `${base}.webp`, width: 1600, height: 1067, alt }
}

// The client maintains only the long description per locale. The short version
// (card blurb + meta description) is derived from its first paragraph/sentence,
// trimmed to a sensible length on a word or sentence boundary.
function firstPart(text, max = 200) {
  const para = String(text || '').split('\n')[0].trim()
  if (para.length <= max) return para
  const slice = para.slice(0, max)
  const stop = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '))
  if (stop > 80) return slice.slice(0, stop + 1).trim()
  const space = slice.lastIndexOf(' ')
  return (space > 0 ? slice.slice(0, space) : slice).trim() + '…'
}
function shortFromLong(longDesc) {
  return {
    en: firstPart(longDesc.en),
    vi: firstPart(longDesc.vi),
    ru: firstPart(longDesc.ru),
    ko: firstPart(longDesc.ko),
  }
}

async function buildFromAirtable() {
  const sharp = (await import('sharp')).default
  const records = await fetchAirtableRecords()
  const out = []
  const usedSlugs = new Set()
  for (const rec of records) {
    // Each record is processed independently: one bad row or broken attachment
    // skips that listing (with a log line), never the whole catalog.
    try {
      const f = rec.fields
      let slug = f.slug ? slugify(f.slug) : slugify(f.title_en ?? rec.id)
      if (usedSlugs.has(slug)) {
        let i = 2
        while (usedSlugs.has(`${slug}-${i}`)) i++
        slug = `${slug}-${i}`
      }
      usedSlugs.add(slug)
      const titleEn = f.title_en ?? 'Untitled'
      const dir = join(PUBLIC_DIR, 'listings', slug)
      let heroImage = null
      const gallery = []
      if (FAKE_IMAGES) {
        heroImage = fakeAsset(slug, titleEn)
      } else {
        if (Array.isArray(f.hero_image) && f.hero_image[0]) {
          try {
            heroImage = await optimizeImage(sharp, f.hero_image[0].url, dir, 'hero', titleEn)
          } catch (err) {
            console.error(`[data] ${slug}: hero image failed (${err.message}), using placeholder`)
          }
        }
        if (Array.isArray(f.gallery)) {
          for (let i = 0; i < f.gallery.length; i++) {
            try {
              gallery.push(
                await optimizeImage(sharp, f.gallery[i].url, dir, `g${i + 1}`, `${titleEn}, view ${i + 1}`),
              )
            } catch (err) {
              console.error(`[data] ${slug}: gallery image ${i + 1} failed (${err.message}), skipped`)
            }
          }
        }
      }
      const longDesc = localized(f, 'long_desc')
      out.push({
        id: rec.id,
        slug,
        code: f.code ? String(f.code).trim() : null,
        title: localized(f, 'title'),
        dealType: (f.deal_type ?? 'Buy').toLowerCase() === 'rent' ? 'rent' : 'buy',
        category: canonicalCategory(f.category),
        district: canonicalDistrict(f.district),
        price: Number(f.price ?? 0),
        currency: f.currency ?? 'USD',
        bedrooms: Number(f.bedrooms ?? 0),
        bathrooms: Number(f.bathrooms ?? 0),
        areaM2: Number(f.area_m2 ?? 0),
        shortDesc: shortFromLong(longDesc),
        longDesc,
        heroImage: heroImage ?? gallery[0] ?? placeholderAsset(slug, titleEn),
        gallery,
        lat: f.lat != null ? Number(f.lat) : null,
        lng: f.lng != null ? Number(f.lng) : null,
        featured: Boolean(f.featured),
        datePublished: f.date_published ?? new Date().toISOString().slice(0, 10),
      })
    } catch (err) {
      console.error(`[data] Skipping listing ${rec.id} (${rec.fields?.title_en ?? 'untitled'}): ${err.message}`)
    }
  }
  // Deterministic order: featured lead, then newest first.
  out.sort((a, b) =>
    a.featured !== b.featured
      ? (a.featured ? -1 : 1)
      : String(b.datePublished).localeCompare(String(a.datePublished)),
  )
  await mkdir(join(DATA_FILE, '..'), { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(out, null, 2), 'utf8')
  return out.length
}

async function main() {
  const hasCreds = AIRTABLE_API_KEY && AIRTABLE_BASE_ID && AIRTABLE_TABLE_LISTINGS
  try {
    if (hasCreds) {
      const n = await buildFromAirtable()
      console.log(`[data] Built ${n} published listings from Airtable.`)
    } else {
      const n = await writeMockData({ publicDir: PUBLIC_DIR, dataFile: DATA_FILE })
      console.log(`[data] No Airtable credentials. Wrote ${n} placeholder listings (marked swap points).`)
    }
  } catch (err) {
    console.error('[data] Airtable build failed, falling back to placeholders:', err.message)
    const n = await writeMockData({ publicDir: PUBLIC_DIR, dataFile: DATA_FILE })
    console.log(`[data] Wrote ${n} placeholder listings.`)
  }
}

main()

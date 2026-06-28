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
} = process.env

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
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

async function buildFromAirtable() {
  const sharp = (await import('sharp')).default
  const records = await fetchAirtableRecords()
  const out = []
  for (const rec of records) {
    const f = rec.fields
    const slug = f.slug ? slugify(f.slug) : slugify(f.title_en ?? rec.id)
    const titleEn = f.title_en ?? 'Untitled'
    const dir = join(PUBLIC_DIR, 'listings', slug)
    let heroImage = null
    if (Array.isArray(f.hero_image) && f.hero_image[0]) {
      heroImage = await optimizeImage(sharp, f.hero_image[0].url, dir, 'hero', titleEn)
    }
    const gallery = []
    if (Array.isArray(f.gallery)) {
      for (let i = 0; i < f.gallery.length; i++) {
        gallery.push(
          await optimizeImage(sharp, f.gallery[i].url, dir, `g${i + 1}`, `${titleEn}, view ${i + 1}`),
        )
      }
    }
    out.push({
      id: rec.id,
      slug,
      title: localized(f, 'title'),
      dealType: (f.deal_type ?? 'Buy').toLowerCase() === 'rent' ? 'rent' : 'buy',
      category: f.category ?? 'Villa',
      district: f.district ?? '',
      price: Number(f.price ?? 0),
      currency: f.currency ?? 'USD',
      bedrooms: Number(f.bedrooms ?? 0),
      bathrooms: Number(f.bathrooms ?? 0),
      areaM2: Number(f.area_m2 ?? 0),
      shortDesc: localized(f, 'short_desc'),
      longDesc: localized(f, 'long_desc'),
      heroImage: heroImage ?? gallery[0] ?? placeholderAsset(slug, titleEn),
      gallery,
      lat: f.lat != null ? Number(f.lat) : null,
      lng: f.lng != null ? Number(f.lng) : null,
      featured: Boolean(f.featured),
      datePublished: f.date_published ?? new Date().toISOString().slice(0, 10),
    })
  }
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

// Build-time data pipeline for the Guides (blog) section. Separate from the
// listings pipeline: its own table, its own output file (src/data/guides.json).
//
// A guide is built for a locale only when that locale has BOTH a title and a
// body, so no thin or duplicated translated pages are generated.
//
// Env (set in CI, never committed):
//   AIRTABLE_API_KEY            reused from the listings pipeline
//   AIRTABLE_GUIDES_BASE_ID     optional, falls back to AIRTABLE_BASE_ID
//   AIRTABLE_GUIDES_TABLE       optional, defaults to "Guides"
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { optimizeImage, loadMediaVariants, staticSrcSet } from './lib/images.mjs'
import { stripMarkdown, normalizeAirtableMarkdown, oldPathsFrom } from './lib/text.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DIR = join(ROOT, 'public')
const DATA_FILE = join(ROOT, 'src', 'data', 'guides.json')
const MEDIA_VARIANTS = loadMediaVariants(ROOT)

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_GUIDES_BASE_ID, AIRTABLE_GUIDES_TABLE } = process.env
const BASE_ID = AIRTABLE_GUIDES_BASE_ID || AIRTABLE_BASE_ID
const TABLE = AIRTABLE_GUIDES_TABLE || 'Guides'
const BRAND = 'Toan Huy Hoang'

// Locale code on the site mapped to the Airtable field suffix.
const LOCALES = [
  ['en', 'EN'],
  ['vi', 'VI'],
  ['ru', 'RU'],
  ['ko', 'KO'],
]

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Rough reading time in minutes from a word count (200 wpm). */
function readingTime(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

async function fetchRecords() {
  const records = []
  let offset
  const base = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`
  do {
    const url = new URL(base)
    url.searchParams.set('filterByFormula', "{Status}='Published'")
    url.searchParams.set('pageSize', '100')
    if (offset) url.searchParams.set('offset', offset)
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } })
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`)
    const json = await res.json()
    records.push(...json.records)
    offset = json.offset
  } while (offset)
  return records
}

/** Build the locales map, including only fully translated locales. */
function buildLocales(f) {
  const out = {}
  for (const [loc, S] of LOCALES) {
    const title = f[`Title_${S}`]
    const body = f[`Body_${S}`]
    if (!title || !body) continue
    // Titles, excerpts and meta strings must be plain text: strip any Markdown
    // that rich text fields deliver, so cards and search snippets never show
    // ** or # symbols. The body keeps its Markdown for the article renderer.
    const excerpt = stripMarkdown(f[`Excerpt_${S}`] ?? '').trim()
    out[loc] = {
      title: stripMarkdown(title).trim(),
      excerpt,
      bodyMarkdown: normalizeAirtableMarkdown(body),
      metaTitle: stripMarkdown(f[`Meta_Title_${S}`] ?? title).trim(),
      metaDescription: stripMarkdown(f[`Meta_Description_${S}`] ?? '').trim() || excerpt,
      readingTime: readingTime(body),
    }
  }
  return out
}

function sortGuides(arr) {
  arr.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return String(b.publishedDate).localeCompare(String(a.publishedDate))
  })
  return arr
}

async function buildFromAirtable() {
  const sharp = (await import('sharp')).default
  const records = await fetchRecords()
  const out = []
  for (const rec of records) {
    const f = rec.fields
    const slug = f.Slug ? slugify(f.Slug) : slugify(f.Title_EN ?? rec.id)
    const locales = buildLocales(f)
    if (Object.keys(locales).length === 0) continue // nothing fully translated, skip
    let coverImage = null
    if (Array.isArray(f.Cover_Image) && f.Cover_Image[0]) {
      const alt = locales.en?.title ?? Object.values(locales)[0].title
      coverImage = await optimizeImage(sharp, PUBLIC_DIR, f.Cover_Image[0].url, join(PUBLIC_DIR, 'guides', slug), 'cover', alt)
    }
    const published = f.Published_Date ?? new Date().toISOString().slice(0, 10)
    out.push({
      slug,
      category: f.Category ?? 'Lifestyle',
      // Old WordPress URL(s) of this article (column Old_URL) for redirects.
      oldPaths: oldPathsFrom(f.Old_URL),
      coverImage,
      publishedDate: published,
      updatedDate: f.Updated_Date ?? published,
      featured: Boolean(f.Featured),
      author: String(f.Author ?? BRAND),
      locales,
    })
  }
  await writeOut(sortGuides(out))
  return out.length
}

async function writeOut(out) {
  await mkdir(join(DATA_FILE, '..'), { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(out, null, 2), 'utf8')
}

// Sample guides so the section builds and renders before Airtable is filled.
// Exercises the per-locale gating: one full set, one en+vi, one en-only.
function mockGuides() {
  const cover = {
    src: '/media/coast-cove.webp',
    avif: '/media/coast-cove.avif',
    webp: '/media/coast-cove.webp',
    avifSet: staticSrcSet(MEDIA_VARIANTS, '/media/coast-cove', 'avif'),
    webpSet: staticSrcSet(MEDIA_VARIANTS, '/media/coast-cove', 'webp'),
    width: 2200,
    height: 1238,
    alt: 'The Son Tra coastline, Da Nang',
  }
  const body = (place) =>
    `## A considered introduction\n\nDa Nang rewards the patient buyer. ${place} sits where the mountains meet the sea, and the right home here is chosen for the life it offers, not the square metres it occupies.\n\n### What to look for\n\n- Proximity to the coast road and the beach\n- Title clarity and the building's foreign-ownership quota\n- The direction the district is growing\n\nWe guide you to the address that fits your goal. This is placeholder copy, held to the brand grade, ready to be replaced once the real guide is written.`
  return sortGuides([
    {
      slug: 'son-tra-neighborhood-guide',
      category: 'Neighborhood Guides',
      coverImage: cover,
      publishedDate: '2026-05-10',
      updatedDate: '2026-06-01',
      featured: true,
      author: BRAND,
      locales: {
        en: { title: 'A Buyer’s Guide to Son Tra', excerpt: 'The peninsula, its coves, and what makes the coast road worth the climb.', bodyMarkdown: body('Son Tra'), metaTitle: 'A Buyer’s Guide to Son Tra, Da Nang', metaDescription: 'The peninsula, its coves, and what makes the coast road worth the climb.', readingTime: readingTime(body('Son Tra')) },
        vi: { title: 'Cẩm Nang Mua Nha ở Sơn Trà', excerpt: 'Bán đảo, những vịnh nhỏ, và con đường ven biển.', bodyMarkdown: body('Sơn Trà'), metaTitle: 'Cẩm Nang Mua Nha ở Sơn Trà', metaDescription: 'Bán đảo, những vịnh nhỏ, và con đường ven biển.', readingTime: readingTime(body('Sơn Trà')) },
        ru: { title: 'Гид покупателя по Сонча', excerpt: 'Полуостров, бухты и прибрежная дорога.', bodyMarkdown: body('Сонча'), metaTitle: 'Гид покупателя по Сонча', metaDescription: 'Полуостров, бухты и прибрежная дорога.', readingTime: readingTime(body('Сонча')) },
        ko: { title: '손트라 구매 가이드', excerpt: '반도와 조용한 만, 그리고 해안 도로.', bodyMarkdown: body('손트라'), metaTitle: '손트라 구매 가이드', metaDescription: '반도와 조용한 만, 그리고 해안 도로.', readingTime: readingTime(body('손트라')) },
      },
    },
    {
      slug: 'foreign-ownership-explained',
      category: 'Legal',
      coverImage: null,
      publishedDate: '2026-04-18',
      updatedDate: '2026-04-18',
      featured: false,
      author: BRAND,
      locales: {
        en: { title: 'Foreign Ownership in Vietnam, Explained', excerpt: 'How foreign nationals own apartments here, and where land rules differ.', bodyMarkdown: body('The Han River'), metaTitle: 'Foreign Property Ownership in Da Nang, Explained', metaDescription: 'How foreign nationals own apartments here, and where land rules differ.', readingTime: readingTime(body('The Han River')) },
        vi: { title: 'Quyền Sở Hữu Của Người Nước Ngoài', excerpt: 'Cách người nước ngoài sở hữu căn hộ tại Việt Nam.', bodyMarkdown: body('Sông Hàn'), metaTitle: 'Quyền Sở Hữu Của Người Nước Ngoài', metaDescription: 'Cách người nước ngoài sở hữu căn hộ tại Việt Nam.', readingTime: readingTime(body('Sông Hàn')) },
      },
    },
    {
      slug: 'why-invest-in-da-nang',
      category: 'Investment',
      coverImage: null,
      publishedDate: '2026-03-02',
      updatedDate: '2026-03-02',
      featured: false,
      author: BRAND,
      locales: {
        en: { title: 'Why Investors Are Watching Da Nang', excerpt: 'A coastal city becoming an opportunity, and the districts leading it.', bodyMarkdown: body('Da Nang'), metaTitle: 'Why Investors Are Watching Da Nang', metaDescription: 'A coastal city becoming an opportunity, and the districts leading it.', readingTime: readingTime(body('Da Nang')) },
      },
    },
  ])
}

async function main() {
  const hasCreds = AIRTABLE_API_KEY && BASE_ID
  try {
    if (hasCreds) {
      const n = await buildFromAirtable()
      console.log(`[guides] Built ${n} published guides from Airtable.`)
    } else {
      const mock = mockGuides()
      await writeOut(mock)
      console.log(`[guides] No Airtable credentials. Wrote ${mock.length} placeholder guides.`)
    }
  } catch (err) {
    console.error('[guides] Airtable build failed, falling back to placeholders:', err.message)
    const mock = mockGuides()
    await writeOut(mock)
    console.log(`[guides] Wrote ${mock.length} placeholder guides.`)
  }
}

main()

// Shared image optimization for the build pipelines (listings + guides).
//
// Every remote photo becomes a WIDTH LADDER of AVIF/WebP variants plus the
// plain `${name}.avif|webp` at the capped top size, so phones fetch a ~400-800w
// candidate instead of the full-size upload. The returned asset carries
// `avifSet`/`webpSet` srcset strings (with w descriptors) that PropertyImage
// feeds to <source srcSet>, making its `sizes` prop actually select a size.
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'

/** Ladder rungs below the cap; the top rung is min(source width, MAX_WIDTH). */
export const LADDER = [400, 800, 1200, 1600]
/** Never ship wider than this: oversized Airtable uploads are capped here.
 *  1600 keeps listing heroes crisp at full width without shipping a 2000px+
 *  photo as the LCP. */
export const MAX_WIDTH = 1600

// ---------------------------------------------------------------------------
// Processed-photo cache. CI restores public/listings, public/guides and
// .image-cache.json from the previous run (actions/cache in deploy.yml). A
// photo whose Airtable attachment (id + byte size) is unchanged reuses the
// files already on disk instead of being downloaded, resized to every rung,
// AVIF-encoded and watermarked again — that step was most of a deploy's
// runtime (deploys had grown to 1-2 hours with the full photo library).
// Bump CACHE_VERSION whenever the OUTPUT for the same input would change
// (LADDER, MAX_WIDTH, qualities, watermark rendering) so everything rebuilds.
// ---------------------------------------------------------------------------
const CACHE_VERSION = 1
let cache = null
let cacheFile = null
export const cacheStats = { hits: 0, misses: 0 }

function ensureCache(publicDir) {
  if (cache) return
  cacheFile = join(publicDir, '..', '.image-cache.json')
  try {
    const c = JSON.parse(readFileSync(cacheFile, 'utf8'))
    cache = c.version === CACHE_VERSION ? c.entries : {}
  } catch {
    cache = {}
  }
}

/** Persist the cache index (call once at the end of a pipeline run). */
export function saveImageCache() {
  if (!cache || !cacheFile) return
  writeFileSync(cacheFile, JSON.stringify({ version: CACHE_VERSION, entries: cache }), 'utf8')
  console.log(`[images] cache: ${cacheStats.hits} reused, ${cacheStats.misses} processed`)
}

/**
 * Delete subdirectories of `dir` not in `keep` (the current slugs). With the
 * cache restoring last run's output, photos of deleted/renamed listings would
 * otherwise ride along into dist (Vite copies public/ verbatim) forever.
 */
export function pruneStaleDirs(dir, keep) {
  let entries = []
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    if (e.isDirectory() && !keep.has(e.name)) {
      rmSync(join(dir, e.name), { recursive: true, force: true })
      console.log(`[images] pruned stale photos: ${e.name}`)
    }
  }
}

/** Cache identity of an Airtable attachment; undefined = never cache. */
export function attachmentCacheId(att) {
  return att && att.id ? `${att.id}:${att.size ?? ''}` : undefined
}

const escRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const escXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * One centered translucent line across the photo — enough to stop other
 * agents lifting the listing photos, quiet enough not to ruin them. White at
 * low opacity with a faint dark edge so it reads on bright walls and dark
 * interiors alike; sized relative to the photo so every srcset rung carries
 * the same proportional mark.
 */
function watermarkSvg(w, h, text) {
  // ~75% of the photo width for the 29-char brand line, never edge-to-edge.
  const fs = Math.round(w / 40)
  const ls = Math.round(fs * 0.18)
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="${Math.round(h / 2 + fs / 3)}" text-anchor="middle"
    font-family="Georgia, 'DejaVu Serif', serif" font-weight="600" font-size="${fs}"
    letter-spacing="${ls}" fill="rgba(255,255,255,0.3)"
    stroke="rgba(0,0,0,0.15)" stroke-width="${Math.max(1, Math.round(fs / 36))}">${escXml(text)}</text>
</svg>`
}

export async function optimizeImage(sharp, publicDir, url, outDir, name, alt, { watermark, cacheId } = {}) {
  const rel = outDir.slice(publicDir.length).split('\\').join('/')
  ensureCache(publicDir)
  const key = cacheId ? `${cacheId}|${rel}|${name}|${watermark ?? ''}` : null
  if (key && cache[key]) {
    const hit = cache[key]
    if (hit.files.every((f) => existsSync(join(publicDir, ...f.split('/').filter(Boolean))))) {
      cacheStats.hits++
      // alt comes fresh: titles can change without the photo changing.
      return { ...hit.asset, alt }
    }
    delete cache[key]
  }
  cacheStats.misses++
  await mkdir(outDir, { recursive: true })
  // A replaced photo may have a different width set: sweep this slot's old
  // variants first so leftovers (e.g. a hero-1200 from a wider predecessor)
  // never ship next to the new ladder.
  const slot = new RegExp(`^${escRe(name)}(-\\d+)?\\.(avif|webp)$|^${escRe(name)}-og\\.jpg$`)
  try {
    for (const f of readdirSync(outDir)) if (slot.test(f)) rmSync(join(outDir, f), { force: true })
  } catch {}
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed (HTTP ${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  // .rotate() bakes any EXIF orientation into the pixels (phone photos).
  const img = sharp(buf).rotate()
  const meta = await img.metadata()
  let srcW = meta.width ?? 1600
  let srcH = meta.height ?? 1067
  // Orientations 5-8 are 90° rotations: the baked pixels swap dimensions.
  if ((meta.orientation ?? 1) >= 5) [srcW, srcH] = [srcH, srcW]

  const top = Math.min(srcW, MAX_WIDTH)
  const topH = Math.round((srcH / srcW) * top)
  const widths = [...LADDER.filter((w) => w < top), top]
  // With a watermark, stamp the top-size master once and cut every rung from
  // it, so the mark stays proportionally identical across sizes and can never
  // be dodged by requesting a smaller candidate.
  const master = watermark
    ? sharp(
        await img
          .clone()
          .resize({ width: top, withoutEnlargement: true })
          .composite([{ input: Buffer.from(watermarkSvg(top, topH, watermark)) }])
          .toBuffer(),
      )
    : img
  // The top rung keeps the plain name so the single-URL `avif`/`webp`/`src`
  // fields keep pointing at real files (older data and OG images included).
  const file = (w, ext) => (w === top ? `${name}.${ext}` : `${name}-${w}.${ext}`)
  for (const w of widths) {
    const resized = master.clone().resize({ width: w, withoutEnlargement: true })
    await resized.clone().avif({ quality: 60 }).toFile(join(outDir, file(w, 'avif')))
    await resized.clone().webp({ quality: 74 }).toFile(join(outDir, file(w, 'webp')))
  }
  // Social-preview JPEG: link scrapers (Zalo, WhatsApp, Facebook, iMessage)
  // reject AVIF/WebP, so og:image points at this (watermarked like the rest —
  // it is cut from the same master). 1200w is the OG sweet spot.
  await master
    .clone()
    .resize({ width: Math.min(1200, top), withoutEnlargement: true })
    .jpeg({ quality: 78 })
    .toFile(join(outDir, `${name}-og.jpg`))
  const set = (ext) => widths.map((w) => `${rel}/${file(w, ext)} ${w}w`).join(', ')
  const asset = {
    src: `${rel}/${name}.webp`,
    avif: `${rel}/${name}.avif`,
    webp: `${rel}/${name}.webp`,
    og: `${rel}/${name}-og.jpg`,
    avifSet: set('avif'),
    webpSet: set('webp'),
    width: top,
    height: Math.round((srcH / srcW) * top),
  }
  if (key) {
    const files = [
      ...widths.flatMap((w) => [`${rel}/${file(w, 'avif')}`, `${rel}/${file(w, 'webp')}`]),
      `${rel}/${name}-og.jpg`,
    ]
    cache[key] = { asset, files }
  }
  return { ...asset, alt }
}

/**
 * Manifest of width variants for the static /public/media photos, written by
 * scripts/gen-media-variants.mjs. Optional: without it, assets simply fall
 * back to single-candidate srcsets.
 */
export function loadMediaVariants(root) {
  try {
    return JSON.parse(readFileSync(join(root, 'src', 'data', 'media-variants.json'), 'utf8'))
  } catch {
    return {}
  }
}

/** Precomputed (capped) srcset for a static /media image, or undefined. */
export function staticSrcSet(manifest, base, ext) {
  const m = manifest[base]
  if (!m) return undefined
  return ext === 'avif' ? m.avifSet : m.webpSet
}

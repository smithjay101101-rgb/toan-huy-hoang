// Shared image optimization for the build pipelines (listings + guides).
//
// Every remote photo becomes a WIDTH LADDER of AVIF/WebP variants plus the
// plain `${name}.avif|webp` at the capped top size, so phones fetch a ~400-800w
// candidate instead of the full-size upload. The returned asset carries
// `avifSet`/`webpSet` srcset strings (with w descriptors) that PropertyImage
// feeds to <source srcSet>, making its `sizes` prop actually select a size.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'

/** Ladder rungs below the cap; the top rung is min(source width, MAX_WIDTH). */
export const LADDER = [400, 800, 1200, 1600]
/** Never ship wider than this: oversized Airtable uploads are capped here. */
export const MAX_WIDTH = 2000

export async function optimizeImage(sharp, publicDir, url, outDir, name, alt) {
  await mkdir(outDir, { recursive: true })
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  // .rotate() bakes any EXIF orientation into the pixels (phone photos).
  const img = sharp(buf).rotate()
  const meta = await img.metadata()
  let srcW = meta.width ?? 1600
  let srcH = meta.height ?? 1067
  // Orientations 5-8 are 90° rotations: the baked pixels swap dimensions.
  if ((meta.orientation ?? 1) >= 5) [srcW, srcH] = [srcH, srcW]

  const top = Math.min(srcW, MAX_WIDTH)
  const widths = [...LADDER.filter((w) => w < top), top]
  const rel = outDir.slice(publicDir.length).split('\\').join('/')
  // The top rung keeps the plain name so the single-URL `avif`/`webp`/`src`
  // fields keep pointing at real files (older data and OG images included).
  const file = (w, ext) => (w === top ? `${name}.${ext}` : `${name}-${w}.${ext}`)
  for (const w of widths) {
    const resized = img.clone().resize({ width: w, withoutEnlargement: true })
    await resized.clone().avif({ quality: 60 }).toFile(join(outDir, file(w, 'avif')))
    await resized.clone().webp({ quality: 74 }).toFile(join(outDir, file(w, 'webp')))
  }
  const set = (ext) => widths.map((w) => `${rel}/${file(w, ext)} ${w}w`).join(', ')
  return {
    src: `${rel}/${name}.webp`,
    avif: `${rel}/${name}.avif`,
    webp: `${rel}/${name}.webp`,
    avifSet: set('avif'),
    webpSet: set('webp'),
    width: top,
    height: Math.round((srcH / srcW) * top),
    alt,
  }
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

/** srcset string for a static /media image from the manifest, or undefined. */
export function staticSrcSet(manifest, base, ext) {
  const m = manifest[base]
  if (!m) return undefined
  const orig = ext === 'avif' ? m.avifW : m.webpW
  return [
    ...m.widths.filter((w) => w < orig).map((w) => `${base}-${w}.${ext} ${w}w`),
    `${base}.${ext} ${orig}w`,
  ].join(', ')
}

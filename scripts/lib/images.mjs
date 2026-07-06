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

export async function optimizeImage(sharp, publicDir, url, outDir, name, alt, { watermark } = {}) {
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
  const topH = Math.round((srcH / srcW) * top)
  const widths = [...LADDER.filter((w) => w < top), top]
  const rel = outDir.slice(publicDir.length).split('\\').join('/')
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

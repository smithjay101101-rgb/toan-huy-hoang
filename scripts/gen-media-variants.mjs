// Generates responsive width variants for the STATIC photos in public/media
// (heroes, the founder portrait, the card placeholders) and writes the
// manifest src/data/media-variants.json that both the site (src/lib/media.ts)
// and the data pipelines (scripts/lib/images.mjs) read to build srcsets.
//
// Run manually whenever a static image is swapped:
//   node scripts/gen-media-variants.mjs
// The variants and the manifest are committed, so the build does not depend
// on this script running.
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { writeFile } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC_DIR = join(ROOT, 'public')
const MANIFEST = join(ROOT, 'src', 'data', 'media-variants.json')

// Full-bleed heroes get the viewport ladder; the portrait renders at <=50vw on
// desktop; the 800px card placeholders only need one phone-sized rung.
const HERO_LADDER = [640, 960, 1280]
const STATIC = [
  { base: '/media/hero-city', ladder: HERO_LADDER },
  { base: '/media/coast-cove', ladder: HERO_LADDER },
  { base: '/media/golden-bridge', ladder: HERO_LADDER },
  { base: '/media/villa-buy', ladder: HERO_LADDER },
  { base: '/media/toan-portrait', ladder: [480, 768] },
  ...Array.from({ length: 8 }, (_, i) => ({ base: `/media/placeholders/prop-${i + 1}`, ladder: [400] })),
]

const sharp = (await import('sharp')).default

async function widthOf(path) {
  return (await sharp(path).metadata()).width
}

const manifest = {}
for (const { base, ladder } of STATIC) {
  const jpg = join(PUBLIC_DIR, `${base}.jpg`)
  const meta = await sharp(jpg).metadata()
  const widths = ladder.filter((w) => w < (meta.width ?? 0))
  for (const w of widths) {
    const resized = sharp(jpg).resize({ width: w, withoutEnlargement: true })
    await resized.clone().avif({ quality: 60 }).toFile(join(PUBLIC_DIR, `${base}-${w}.avif`))
    await resized.clone().webp({ quality: 74 }).toFile(join(PUBLIC_DIR, `${base}-${w}.webp`))
  }
  // The committed originals stay untouched as the largest candidates; measure
  // them individually (they can be wider than the jpg they sit beside).
  manifest[base] = {
    widths,
    avifW: await widthOf(join(PUBLIC_DIR, `${base}.avif`)),
    webpW: await widthOf(join(PUBLIC_DIR, `${base}.webp`)),
    w: meta.width,
    h: meta.height,
  }
  console.log(`[media] ${base}: ${widths.join(', ') || 'no rungs'} + original ${meta.width}w`)
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), 'utf8')
console.log(`[media] Wrote manifest for ${Object.keys(manifest).length} images -> src/data/media-variants.json`)

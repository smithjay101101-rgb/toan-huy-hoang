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

// Never serve a static art image wider than this. Retina desktops otherwise
// pull the 2600px hero original (~330 KB) as the LCP, which is the single
// biggest thing standing between a visitor and a painted page. 1600px covers
// full-width on virtually every screen; the committed originals stay on disk
// as the <img> fallback but are no longer offered in the srcset.
const CAP = 1600
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

const manifest = {}
for (const { base, ladder } of STATIC) {
  const jpg = join(PUBLIC_DIR, `${base}.jpg`)
  const meta = await sharp(jpg).metadata()
  const jpgW = meta.width ?? 0
  const topW = Math.min(CAP, jpgW)
  // Ladder rungs below the cap, plus the cap itself as the largest candidate.
  const rungs = [...new Set([...ladder.filter((w) => w < topW), topW])].sort((a, b) => a - b)
  for (const w of rungs) {
    const resized = sharp(jpg).resize({ width: w, withoutEnlargement: true })
    await resized.clone().avif({ quality: 62 }).toFile(join(PUBLIC_DIR, `${base}-${w}.avif`))
    await resized.clone().webp({ quality: 76 }).toFile(join(PUBLIC_DIR, `${base}-${w}.webp`))
  }
  const srcset = (ext) => rungs.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ')
  // Precompute the srcset strings here (the one place that knows the exact
  // rungs and the cap), so the site and the data pipeline just read them.
  manifest[base] = { avifSet: srcset('avif'), webpSet: srcset('webp'), w: jpgW, h: meta.height, top: topW }
  console.log(`[media] ${base}: ${rungs.join(', ')}w (cap ${CAP})`)
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), 'utf8')
console.log(`[media] Wrote manifest for ${Object.keys(manifest).length} images -> src/data/media-variants.json`)

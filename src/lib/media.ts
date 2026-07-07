// srcset helper for the STATIC /media photos (heroes, portrait, placeholders).
// The width-variant files and this manifest are produced by
// scripts/gen-media-variants.mjs; keep in lockstep with staticSrcSet in
// scripts/lib/images.mjs (same manifest, Node side).
import manifest from '@/data/media-variants.json'

interface VariantEntry {
  widths: number[]
  avifW: number
  webpW: number
  w: number
  h: number
}

const MEDIA: Record<string, VariantEntry> = manifest

/**
 * Width-descriptor srcset for a static image, e.g.
 * "/media/hero-city-640.avif 640w, …, /media/hero-city.avif 1800w".
 * Falls back to the single original URL when no variants exist, so callers
 * can use it unconditionally.
 */
export function mediaSrcSet(base: string, ext: 'avif' | 'webp'): string {
  const m = MEDIA[base]
  if (!m) return `${base}.${ext}`
  const orig = ext === 'avif' ? m.avifW : m.webpW
  return [
    ...m.widths.filter((w) => w < orig).map((w) => `${base}-${w}.${ext} ${w}w`),
    `${base}.${ext} ${orig}w`,
  ].join(', ')
}

/**
 * Privacy-enhanced embed URL for a YouTube link in any common shape
 * (watch?v=, youtu.be/, shorts/, embed/, live/). Null when the URL carries no
 * recognizable video id — callers render nothing rather than a broken frame.
 */
export function youtubeEmbedUrl(url: string): string | null {
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{11})/,
  )
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null
}

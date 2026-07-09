// srcset helper for the STATIC /media photos (heroes, portrait, placeholders).
// The width-variant files and this manifest are produced by
// scripts/gen-media-variants.mjs; keep in lockstep with staticSrcSet in
// scripts/lib/images.mjs (same manifest, Node side).
import manifest from '@/data/media-variants.json'

interface VariantEntry {
  avifSet: string
  webpSet: string
  w: number
  h: number
  top: number
}

const MEDIA: Record<string, VariantEntry> = manifest

/**
 * Width-descriptor srcset for a static image, e.g.
 * "/media/hero-city-640.avif 640w, …, /media/hero-city-1600.avif 1600w".
 * Precomputed (and capped) by scripts/gen-media-variants.mjs. Falls back to
 * the single original URL when no variants exist, so callers use it
 * unconditionally.
 */
export function mediaSrcSet(base: string, ext: 'avif' | 'webp'): string {
  const m = MEDIA[base]
  if (!m) return `${base}.${ext}`
  return ext === 'avif' ? m.avifSet : m.webpSet
}

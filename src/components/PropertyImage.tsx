import type { ImageAsset } from '@/data/types'

interface Props {
  image: ImageAsset
  className?: string
  /** Eager + high priority for the LCP element only. */
  priority?: boolean
  sizes?: string
}

/**
 * Renders a <picture> with AVIF and WebP sources when available, always with
 * explicit width/height (aspect ratio reserved) to keep CLS near zero.
 * Placeholders are single SVGs with no modern-format siblings.
 */
export default function PropertyImage({ image, className, priority = false, sizes }: Props) {
  const aspect = `${image.width} / ${image.height}`
  return (
    <picture>
      {/* The *Set strings carry w descriptors so `sizes` actually selects a
          width; the single-URL fields remain the fallback. */}
      {(image.avifSet ?? image.avif) && (
        <source srcSet={image.avifSet ?? image.avif} type="image/avif" sizes={sizes} />
      )}
      {(image.webpSet ?? image.webp) && (
        <source srcSet={image.webpSet ?? image.webp} type="image/webp" sizes={sizes} />
      )}
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // lowercase attribute for cross-version React DOM compatibility
        {...{ fetchpriority: priority ? 'high' : 'auto' }}
        className={`${className ?? ''} ${priority ? '' : 'img-soft'}`.trim()}
        style={{ aspectRatio: aspect, objectFit: 'cover', width: '100%', height: '100%' }}
      />
    </picture>
  )
}

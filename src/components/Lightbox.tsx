import { useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ImageAsset } from '@/data/types'

interface Props {
  images: ImageAsset[]
  index: number
  onClose: () => void
  onNavigate: (next: number) => void
}

/**
 * Full-screen gallery carousel: arrows, keyboard (Esc, arrow keys), swipe on
 * touch, and a position counter. Rendered only after a click, so it never
 * exists in the prerendered HTML.
 */
export default function Lightbox({ images, index, onClose, onNavigate }: Props) {
  const touchX = useRef<number | null>(null)
  const prev = () => onNavigate((index - 1 + images.length) % images.length)
  const next = () => onNavigate((index + 1) % images.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length])

  const img = images[index]
  if (!img) return null

  const navBtn =
    'flex items-center justify-center rounded-full border border-white/30 bg-black/40 text-white/90 backdrop-blur-sm transition-colors hover:border-gold hover:text-gold'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={img.alt}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(10, 16, 22, 0.96)' }}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 48) (dx > 0 ? prev : next)()
      }}
    >
      {/* Image (clicks on it do not close) */}
      <picture onClick={(e) => e.stopPropagation()}>
        {(img.avifSet ?? img.avif) && (
          <source srcSet={img.avifSet ?? img.avif} type="image/avif" sizes="92vw" />
        )}
        {(img.webpSet ?? img.webp) && (
          <source srcSet={img.webpSet ?? img.webp} type="image/webp" sizes="92vw" />
        )}
        <img
          src={img.src}
          alt={img.alt}
          className="max-h-[86vh] max-w-[92vw] select-none object-contain"
          draggable={false}
        />
      </picture>

      <button
        type="button"
        autoFocus
        aria-label="Close"
        onClick={onClose}
        className={`${navBtn} absolute right-4 top-4 h-11 w-11`}
      >
        <X size={20} strokeWidth={1.5} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            className={`${navBtn} absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 sm:left-6`}
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            className={`${navBtn} absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 sm:right-6`}
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-white/75 tabular-nums">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}

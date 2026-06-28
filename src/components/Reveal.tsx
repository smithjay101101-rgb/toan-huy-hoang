import { useEffect, useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Stagger the direct children instead of the container. */
  stagger?: boolean
  delay?: number
}

// power3.out-equivalent easing, matching the previous GSAP feel.
const EASE = 'cubic-bezier(0.215, 0.61, 0.355, 1)'

// useLayoutEffect on the client (applies the hidden state before paint, so
// above-the-fold content never flashes), useEffect during SSR to avoid warnings.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Subtle scroll reveal: opacity + translateY, ease-out on first enter.
 * Content renders fully visible in static HTML (good for crawlers and no-JS).
 * The hidden initial state is applied on the client only, then released by an
 * IntersectionObserver when the element scrolls into view. No animation library.
 */
export default function Reveal({ children, as, className, stagger = false, delay = 0 }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement | null>(null)

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    const targets = (stagger ? Array.from(el.children) : [el]) as HTMLElement[]

    // Hidden initial state, applied on the client only (never in static HTML).
    targets.forEach((t, i) => {
      t.style.opacity = '0'
      t.style.transform = 'translateY(24px)'
      t.style.transition = `opacity 0.7s ${EASE}, transform 0.7s ${EASE}`
      t.style.transitionDelay = `${delay + (stagger ? i * 0.08 : 0)}s`
      t.style.willChange = 'opacity, transform'
    })

    const io = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((e) => e.isIntersecting)) {
          targets.forEach((t) => {
            t.style.opacity = '1'
            t.style.transform = 'translateY(0)'
          })
          obs.disconnect()
        }
      },
      // Fire a little before fully in view, ~ the old "top 82%" trigger.
      { rootMargin: '0px 0px -18% 0px' },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      targets.forEach((t) => {
        t.style.cssText = t.style.cssText
          .replace(/(opacity|transform|transition|transition-delay|will-change):[^;]*;?/g, '')
          .trim()
      })
    }
  }, [stagger, delay])

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  )
}

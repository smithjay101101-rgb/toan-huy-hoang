import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { ensureGsap, gsap, prefersReducedMotion } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Stagger child elements instead of the container. */
  stagger?: boolean
  delay?: number
}

/**
 * Subtle scroll reveal: opacity + translateY only, ease-out on enter.
 * Content is rendered visible in static HTML (good for crawlers and no-JS).
 * The hidden initial state is applied on the client only, after mount.
 */
export default function Reveal({
  children,
  as,
  className,
  stagger = false,
  delay = 0,
}: RevealProps) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !ensureGsap() || prefersReducedMotion()) return

    const targets = stagger ? Array.from(el.children) : [el]
    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 24 })
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay,
        ease: 'power3.out',
        stagger: stagger ? 0.08 : 0,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [stagger, delay])

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  )
}

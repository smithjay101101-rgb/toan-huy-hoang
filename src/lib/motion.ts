import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/** Register GSAP plugins once, client only. */
export function ensureGsap() {
  if (typeof window === 'undefined') return false
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  return true
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export { gsap, ScrollTrigger }

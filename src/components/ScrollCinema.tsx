import { useEffect, useRef } from 'react'
import { ensureGsap, gsap, prefersReducedMotion } from '@/lib/motion'

export interface CinemaScene {
  src: string
  label?: string
}

export interface CinemaCaption {
  text: string
  /** Progress 0..1 at which the caption is centred. */
  at: number
}

interface ScrollCinemaProps {
  /** Stills fallback, used when no video/sequence is supplied. */
  scenes: CinemaScene[]
  /**
   * Image sequence rendered to canvas (the Apple method). Provide a frame count
   * and a frame URL builder. Used when no video is supplied.
   */
  sequence?: { count: number; src: (i: number) => string }
  /**
   * Scroll-scrubbed video: scroll progress maps to the clip's currentTime.
   * Used for the Golden Bridge animation (hands rotating the bridge). Takes
   * priority over sequence and stills when provided.
   */
  video?: { src: string; webm?: string; poster: string }
  captions?: CinemaCaption[]
}

/**
 * The centerpiece. A short cinematic move stretched across a pinned scroll:
 * the giant stone hands rotating the Golden Bridge as nature becomes
 * opportunity. The video mode is driven by a plain scroll handler (rock solid
 * across browsers and React StrictMode); stills and sequence modes use GSAP.
 *
 * Respects prefers-reduced-motion by collapsing to one static still/poster.
 * Initializes after mount so it never blocks the hero LCP.
 */
export default function ScrollCinema({ scenes, sequence, video, captions = [] }: ScrollCinemaProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const captionRefs = useRef<(HTMLParagraphElement | null)[]>([])

  // Video mode: scroll-scrubbed via a native handler. Self-contained.
  useEffect(() => {
    if (!video) return
    const section = sectionRef.current
    const vid = videoRef.current
    if (!section || !vid) return
    if (typeof window === 'undefined' || prefersReducedMotion()) return

    // iOS needs a muted play/pause before currentTime seeking is reliable.
    vid.muted = true
    vid.play().then(() => vid.pause()).catch(() => {})

    let raf = 0
    const apply = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1))
      const progress = total > 0 ? scrolled / total : 0

      const duration = vid.duration || 5
      if (vid.readyState >= 1) {
        try {
          vid.currentTime = Math.min(progress * duration, duration - 0.05)
        } catch {
          /* seek not ready yet */
        }
      }

      // Captions fade in and out around their target progress.
      captionRefs.current.forEach((el, i) => {
        if (!el) return
        const at = captions[i]?.at ?? (i + 1) / (captions.length + 1)
        const dist = Math.abs(progress - at)
        el.style.opacity = String(Math.max(0, 1 - dist / 0.16))
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    // Capture phase on document catches scroll from any scroll container, not
    // just window. getBoundingClientRect stays viewport-relative either way.
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)
    vid.addEventListener('loadedmetadata', apply)
    apply()

    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
      window.removeEventListener('resize', onScroll)
      vid.removeEventListener('loadedmetadata', apply)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [video, captions])

  // Stills / sequence mode: GSAP scrub + caption tweens.
  useEffect(() => {
    if (video) return
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return
    if (!ensureGsap() || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      if (sequence) runCanvasSequence()
      else runStillsCrossfade()

      const captionEls = gsap.utils.toArray<HTMLElement>('.cinema-caption', stage)
      captionEls.forEach((el, i) => {
        const at = captions[i]?.at ?? (i + 1) / (captionEls.length + 1)
        gsap.fromTo(
          el,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: `${Math.max(0, at - 0.12) * 100}% top`,
              end: `${Math.min(1, at + 0.12) * 100}% top`,
              scrub: true,
            },
          },
        )
      })

      function runStillsCrossfade() {
        const sceneEls = gsap.utils.toArray<HTMLElement>('.cinema-scene', stage)
        gsap.set(sceneEls, { opacity: (i: number) => (i === 0 ? 1 : 0), scale: 1.06 })
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 },
        })
        const step = 1 / Math.max(1, sceneEls.length - 1)
        sceneEls.forEach((el, i) => {
          tl.to(el, { scale: 1.0, ease: 'none', duration: step }, i * step * 0.9)
          if (i > 0) tl.to(el, { opacity: 1, ease: 'none', duration: step * 0.6 }, (i - 0.5) * step)
        })
      }

      function runCanvasSequence() {
        const canvas = canvasRef.current
        if (!canvas || !sequence) return
        const dctx = canvas.getContext('2d')
        if (!dctx) return
        const frames: HTMLImageElement[] = []
        const state = { frame: 0 }
        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          canvas.width = stage!.clientWidth * dpr
          canvas.height = stage!.clientHeight * dpr
          draw()
        }
        const draw = () => {
          const img = frames[Math.round(state.frame)]
          if (!img || !img.complete) return
          const cw = canvas.width
          const ch = canvas.height
          const ir = img.width / img.height
          const cr = cw / ch
          let dw = cw
          let dh = ch
          if (ir > cr) dw = ch * ir
          else dh = cw / ir
          dctx.clearRect(0, 0, cw, ch)
          dctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
        }
        for (let i = 0; i < sequence.count; i++) {
          const img = new Image()
          img.src = sequence.src(i)
          img.onload = () => {
            if (i === 0) draw()
          }
          frames.push(img)
        }
        window.addEventListener('resize', resize)
        resize()
        gsap.to(state, {
          frame: sequence.count - 1,
          ease: 'none',
          snap: 'frame',
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 },
          onUpdate: draw,
        })
      }
    }, section)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section ref={sectionRef} className="cinema-section" aria-label="Da Nang, from the Golden Bridge to the coast">
      <div ref={stageRef} className="cinema-stage">
        {video ? (
          <video
            ref={videoRef}
            className="cinema-scene"
            poster={video.poster}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            {video.webm && <source src={video.webm} type="video/webm" />}
            <source src={video.src} type="video/mp4" />
          </video>
        ) : sequence ? (
          <canvas ref={canvasRef} className="cinema-scene" aria-hidden="true" />
        ) : (
          scenes.map((scene, i) => (
            <img
              key={scene.src}
              src={scene.src}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="cinema-scene"
              style={{ zIndex: i }}
            />
          ))
        )}

        {/* Soft light / vignette layer over the media. */}
        <div
          className="cinema-fog pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            zIndex: 50,
            background:
              'radial-gradient(120% 80% at 50% 12%, rgba(199,169,107,0.05) 0%, transparent 45%), linear-gradient(180deg, rgba(7,7,7,0.35) 0%, transparent 32%, rgba(7,7,7,0.85) 100%)',
          }}
        />

        {/* Captions */}
        <div className="container-lux relative flex h-full items-center" style={{ zIndex: 60 }}>
          <div className="max-w-xl">
            {captions.map((c, i) => (
              <p
                key={c.text}
                ref={(el) => (captionRefs.current[i] = el)}
                className="cinema-caption font-display text-text"
                style={{ position: 'absolute', fontSize: 'clamp(1.5rem, 1rem + 2.4vw, 3rem)', lineHeight: 1.1, opacity: 0 }}
              >
                {c.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

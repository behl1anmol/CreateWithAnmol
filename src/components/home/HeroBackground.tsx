'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Decorative full-bleed background image pinned to the top of the homepage
 * wrapper (the hero region). It is `absolute` so it scrolls away with the
 * hero, and its opacity fades to 0 as the hero→featured boundary
 * (`#hero-bg-end`) rises into the viewport — fading back in on scroll up.
 *
 * Height is measured from the boundary marker's `offsetTop` so the image
 * never bleeds behind the featured/About/footer sections. Opacity-only +
 * CSS transition + rAF-throttled passive listeners satisfy the project's
 * performance/motion rules (no animation library).
 *
 * Honors `prefers-reduced-motion`: skips the scroll-driven cross-fade and
 * leaves the image at full opacity (it still scrolls away naturally and
 * blends via the bottom gradient).
 */
export default function HeroBackground() {
  const [height, setHeight] = useState<number | null>(null)
  const [opacity, setOpacity] = useState(1)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const sentinel = document.getElementById('hero-bg-end')
    if (!sentinel) return

    const measure = () => {
      setHeight(sentinel.offsetTop)
    }

    const computeOpacity = () => {
      const vh = window.innerHeight
      const top = sentinel.getBoundingClientRect().top
      const start = vh * 0.7
      const end = vh * 0.15
      const o = Math.min(1, Math.max(0, (top - end) / (start - end)))
      setOpacity(o)
      rafRef.current = null
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(computeOpacity)
    }

    const onResize = () => {
      measure()
      if (!reduce) computeOpacity()
    }

    measure()
    if (!reduce) {
      computeOpacity()
      window.addEventListener('scroll', onScroll, { passive: true })
    }
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 z-0 pointer-events-none overflow-hidden"
      style={{
        height: height ?? '100vh',
        opacity,
        transition: 'opacity 120ms linear',
        // Fade the WHOLE layer's alpha to fully transparent at the bottom so the
        // image + wash + vignette dissolve together into the page background.
        // No solid fill is introduced, so there is no dark band and no hard line
        // where the layer meets the featured section.
        maskImage: 'linear-gradient(to bottom, #000 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 60%, transparent 100%)',
      }}
    >
      {/* Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/anmol-cover.png')" }}
      />
      {/* Slight dark wash (kept for hero text contrast; fades out via the
          layer mask above, so it adds no dark band at the bottom) */}
      <div className="absolute inset-0 bg-[#07090c]/40" />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(7,9,12,0.85) 100%)' }}
      />
    </div>
  )
}

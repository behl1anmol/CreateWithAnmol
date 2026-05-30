import type { CSSProperties } from 'react'
import { SOCIAL_PLATFORMS } from '@/lib/social'

const STATS = [
  { value: '2.4M+', label: 'Total Views' },
  { value: '12+', label: 'Digital Products' },
  { value: '30+', label: 'Published Articles' },
]

const PRINCIPLES = [
  {
    number: '01',
    title: 'Restraint over Abundance',
    description:
      'Every element earns its place. Negative space is not emptiness — it is precision. The most powerful creative decisions are the ones you choose not to make.',
  },
  {
    number: '02',
    title: 'Liquid Lighting',
    description:
      'Light is not decoration. It is architecture. Every surface, every interface, every generation is built around how light behaves against material — real or simulated.',
  },
  {
    number: '03',
    title: 'Deterministic Outcomes',
    description:
      'Creativity at scale requires systems. Every workflow, prompt chain, and design decision is engineered for repeatability without sacrificing the edge of surprise.',
  },
]


export default function AboutPage() {
  return (
    <main className="pt-[160px] pb-32 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full relative z-10">

      {/* Ambient orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px] mix-blend-screen" />
      </div>

      {/* Hero */}
      <section className="flex flex-col md:flex-row gap-12 md:gap-16 items-center mb-32 md:mb-40 relative z-10">
        <div className="md:w-1/2 flex flex-col gap-6">
          <div>
            <span className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] tracking-widest">
              The Creator
            </span>
          </div>
          <h1 className="type-display-mobile md:type-display-lg text-gradient tracking-tight">
            Architecting digital realities
          </h1>
          <p className="type-body-lg text-[var(--color-on-surface-variant)] max-w-xl">
            Operating at the intersection of generative AI and high-end editorial design. Building tools, products, and creative systems that define what comes next.
          </p>
          <div className="pt-2">
            <a
              href="https://www.instagram.com/thestudioprompts.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="pill-filter type-label-caps px-6 py-3 rounded-full text-[var(--color-primary)] whitespace-nowrap inline-flex items-center gap-2 hover:gap-3 transition-all duration-300"
            >
              Follow the Work
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>

        <div className="md:w-1/2 w-full">
          <div className="glass-panel rounded-2xl overflow-hidden h-[360px] md:h-[480px] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/anmol-profile.jpg"
              alt="Anmol — AI Creator and Digital Architect"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="glass-panel rounded-2xl p-8 md:p-10 mb-24 md:mb-32 relative z-10">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex-1 flex flex-col items-center justify-center py-6 sm:py-0 text-center">
              <span className="type-display-mobile text-gradient font-semibold">{stat.value}</span>
              <span className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] tracking-widest mt-2">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* The Architect */}
      <section className="mb-0 relative z-10">
        <span className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] tracking-widest mb-8 block">
          The Architect
        </span>
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="md:w-1/3">
            <h2 className="type-headline-md text-[var(--color-primary)] font-semibold leading-tight">
              Designer.<br />Engineer.<br />Creator.
            </h2>
          </div>
          <div className="md:w-2/3">
            <p className="type-body-lg text-[var(--color-on-surface-variant)] mb-6">
              Anmol Behl is a technical AI creator and digital architect operating at the bleeding edge of generative design. With a background spanning prompt engineering, editorial UI systems, and cinematic visual production, he builds products that redefine creative possibility.
            </p>
            <p className="type-body-lg text-[var(--color-on-surface-variant)] mb-6">
              His work is defined by precision over volume — every prompt, product, and article distilled to its essential truth. He believes the next era of digital creativity belongs to those who understand both the model and the medium.
            </p>
            <p className="type-body-lg text-[var(--color-on-surface-variant)]">
              Based on the internet. Building for creators who refuse to compromise between technical depth and aesthetic excellence.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-white/5 mt-24 md:mt-32 mb-24 md:mb-32" />

      {/* Core Philosophy */}
      <section className="relative z-10 mb-24 md:mb-32">
        <div className="mb-12 md:mb-16">
          <span className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] tracking-widest block mb-2">
            Core Principles
          </span>
          <h2 className="text-[var(--color-primary)] font-semibold text-2xl tracking-tight">
            Core Philosophy
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]">
          {PRINCIPLES.map((p) => (
            <div key={p.number} className="glass-card glass-card-hover rounded-xl p-8 flex flex-col gap-4">
              <span className="self-start pill-filter type-label-caps px-4 py-1.5 rounded-full text-[10px] text-[var(--color-on-surface-variant)]">
                {p.number}
              </span>
              <h3 className="text-[var(--color-primary)] font-semibold text-xl tracking-tight leading-snug">
                {p.title}
              </h3>
              <p className="type-body-md text-[var(--color-on-surface-variant)] leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Network */}
      <section className="relative z-10 mb-24 md:mb-32">
        <div className="mb-12 md:mb-16">
          <span className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] tracking-widest block mb-2">
            Platforms
          </span>
          <h2 className="text-[var(--color-primary)] font-semibold text-2xl tracking-tight">
            Find the Work
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]">
          {SOCIAL_PLATFORMS.map((pl) => (
            <a
              key={pl.key}
              href={pl.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block glass-card glass-card-hover rounded-xl p-8 flex flex-col gap-5"
              style={{ '--brand': pl.brandColor } as CSSProperties}
            >
              <span className="self-start pill-filter type-label-caps px-4 py-1.5 rounded-full text-[10px] text-[var(--color-on-surface-variant)]">
                {pl.label}
              </span>
              <div className="text-white/50 group-hover:text-(--brand) transition-colors duration-300">
                <pl.Icon size={36} />
              </div>
              <p className="type-body-md text-[var(--color-on-surface-variant)] leading-relaxed flex-grow">
                {pl.description}
              </p>
              <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-auto">
                <span className="type-label-caps text-[var(--color-primary)] text-[10px] tracking-widest">
                  View
                </span>
                <span className="material-symbols-outlined text-[16px] text-[var(--color-on-surface-variant)] group-hover:translate-x-1 group-hover:text-[var(--color-primary)] transition-all duration-300">
                  arrow_forward
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <div className="pt-16 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div>
          <p className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] mb-2 tracking-widest">
            Let's Build
          </p>
          <h3 className="text-[var(--color-primary)] font-semibold text-2xl tracking-tight">
            Let's collaborate
          </h3>
          <p className="type-body-md text-[var(--color-on-surface-variant)] text-sm mt-2 max-w-md">
            Open to commissions, collaborations, and conversations with creators who operate at the edge.
          </p>
        </div>
        <a
          href="https://www.instagram.com/thestudioprompts.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="pill-filter type-label-caps px-6 py-3 rounded-full text-[var(--color-primary)] whitespace-nowrap flex items-center gap-2 hover:gap-3 transition-all duration-300"
        >
          Connect on Instagram
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>

    </main>
  )
}

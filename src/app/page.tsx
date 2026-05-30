import type { CSSProperties } from 'react'
import { getHomepageData } from '@/lib/api'
import type { Product, Blog, Prompt } from '@/lib/types'
import { SOCIAL_PLATFORMS } from '@/lib/social'

export const revalidate = 3600

export default async function Home() {
  const { featuredPrompts, featuredProducts, featuredBlogs } = await getHomepageData()

  return (
    <div className="relative z-10 pt-32 pb-32">
      {/* Ambient liquid lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[100px] mix-blend-screen" />
      </div>

      {/* Hero */}
      <section className="relative z-10 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto min-h-[716px] flex flex-col justify-center items-center text-center gap-8 mb-40">
        <h1 className="type-display-mobile md:type-display-lg text-gradient max-w-4xl">
          Create with Anmol
        </h1>
        <p className="type-body-lg text-[var(--color-on-surface-variant)] max-w-2xl">
          Technical AI Creator. Mastering the intersection of prompt engineering and cinematic design.
        </p>
        <div className="mt-8 flex items-center gap-6">
          {SOCIAL_PLATFORMS.map(({ key, href, label, brandColor, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-white/30 transition-colors duration-300 hover:text-(--brand)"
              style={{ '--brand': brandColor } as CSSProperties}
            >
              <Icon size={22} />
            </a>
          ))}
        </div>
      </section>

      {/* Instagram Prompts */}
      <section className="relative z-10 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto mb-40">
        <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-4">
          <h2 className="type-headline-md text-[var(--color-primary)]">Instagram Prompts</h2>
          <a
            href="/prompts"
            className="type-body-md text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
          {featuredPrompts.map((prompt: Prompt) => (
            <div
              key={prompt.id}
              className="snap-start shrink-0 w-[85vw] md:w-[400px] bg-[#1a1a1a]/40 backdrop-blur-2xl border border-white/5 border-t-white/15 hover:bg-[#1a1a1a]/60 hover:border-white/10 hover:border-t-white/25 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col group rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="h-64 bg-[#121212] relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prompt.image}
                  alt={prompt.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-transparent to-transparent opacity-80" />
              </div>
              <div className="p-6 flex flex-col gap-4 flex-grow relative z-10 bg-gradient-to-b from-white/5 to-transparent">
                <h3 className="type-body-lg text-[var(--color-primary)] font-medium">{prompt.title}</h3>
                <p className="type-body-md text-[var(--color-on-surface-variant)] line-clamp-2">{prompt.description}</p>
                <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
                  {prompt.reelLink && (
                    <a
                      href={prompt.reelLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 rounded-xl bg-white/5 backdrop-blur-[20px] border border-white/10 border-t-white/20 text-[var(--color-primary)] type-label-caps font-semibold tracking-wider hover:bg-white/10 hover:border-white/15 transition-all duration-300 text-center"
                    >
                      Watch Reel
                    </a>
                  )}
                  <a
                    href={prompt.promptLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl bg-white/10 backdrop-blur-[20px] border border-white/10 border-t-white/20 text-[var(--color-primary)] type-label-caps font-semibold tracking-wider hover:bg-white/15 hover:border-white/20 hover:shadow-[0_4px_15px_rgba(255,255,255,0.05)] transition-all duration-300 text-center"
                  >
                    Get Full Prompt
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Blogs */}
      <section className="relative z-10 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto mb-40">
        <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-4">
          <h2 className="type-headline-md text-[var(--color-primary)]">Medium Blogs</h2>
          <a
            href="/blogs"
            className="type-body-md text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
          {featuredBlogs.map((blog: Blog) => (
            <div
              key={blog.id}
              className="snap-start shrink-0 w-[85vw] md:w-[400px] bg-[#1a1a1a]/40 backdrop-blur-2xl border border-white/5 border-t-white/15 hover:bg-[#1a1a1a]/60 hover:border-white/10 hover:border-t-white/25 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col group rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="h-64 bg-[#121212] relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 to-transparent opacity-80" />
              </div>
              <div className="p-6 flex flex-col gap-4 flex-grow relative z-10 bg-gradient-to-b from-white/5 to-transparent">
                <h3 className="type-body-lg text-[var(--color-primary)] font-medium">{blog.title}</h3>
                <p className="type-body-md text-[var(--color-on-surface-variant)] line-clamp-2">{blog.excerpt}</p>
                <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
                  <a
                    href={blog.articleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl bg-white/5 backdrop-blur-[20px] border border-white/10 border-t-white/20 text-[var(--color-primary)] type-label-caps font-semibold tracking-wider hover:bg-white/10 hover:border-white/15 transition-all duration-300 text-center"
                  >
                    Read Article
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative z-10 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto mb-40">
        <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-4">
          <h2 className="type-headline-md text-[var(--color-primary)]">Gumroad Products</h2>
          <a
            href="/products"
            className="type-body-md text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-2"
          >
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
          {featuredProducts.map((product: Product) => (
            <div
              key={product.id}
              className="snap-start shrink-0 w-[85vw] md:w-[400px] bg-[#1a1a1a]/40 backdrop-blur-2xl border border-white/5 border-t-white/15 hover:bg-[#1a1a1a]/60 hover:border-white/10 hover:border-t-white/25 hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col group rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="h-64 bg-[#121212] relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 to-transparent opacity-80" />
              </div>
              <div className="p-6 flex flex-col gap-4 flex-grow relative z-10 bg-gradient-to-b from-white/5 to-transparent">
                <h3 className="type-body-lg text-[var(--color-primary)] font-medium">{product.title}</h3>
                <p className="type-body-md text-[var(--color-on-surface-variant)] line-clamp-2">{product.description}</p>
                <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
                  <a
                    href={product.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl bg-white/10 backdrop-blur-[20px] border border-white/10 border-t-white/20 text-[var(--color-primary)] type-label-caps font-semibold tracking-wider hover:bg-white/15 hover:border-white/20 hover:shadow-[0_4px_15px_rgba(255,255,255,0.05)] transition-all duration-300 text-center"
                  >
                    View Product
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Teaser */}
      <section className="relative z-10 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto mb-40">
        <div className="glass-panel rounded-3xl p-12 md:p-20 flex flex-col items-center text-center gap-6">
          <span className="type-label-caps text-[var(--color-on-surface-variant)]">Creator Story</span>
          <h2 className="type-headline-md text-gradient max-w-2xl">
            Building at the intersection of AI and cinematic design
          </h2>
          <p className="type-body-lg text-[var(--color-on-surface-variant)] max-w-xl">
            From prompt engineering to visual storytelling — exploring what&apos;s possible when technology meets art.
          </p>
          <a
            href="/about"
            className="mt-4 type-label-caps border border-white/20 text-[var(--color-primary)] px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-300 tracking-widest"
          >
            Learn More
          </a>
        </div>
      </section>
    </div>
  )
}

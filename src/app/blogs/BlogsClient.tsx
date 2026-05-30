'use client'

import { useState } from 'react'
import type { Blog } from '@/lib/types'

const CATEGORIES = ['All', 'Architecture', 'Infrastructure', 'Engineering', 'Design', 'Workflow', 'Philosophy']

function FeaturedBlogCard({ blog }: { blog: Blog }) {
  return (
    <a
      href={blog.articleLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-card rounded-xl overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:bg-[rgba(255,255,255,0.05)]"
    >
      {/* Image */}
      <div className="md:w-3/5 h-64 md:h-[500px] relative overflow-hidden bg-[var(--color-surface-container-lowest)]">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80"
        />
      </div>

      {/* Content */}
      <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10">
        <div>
          <div className="flex items-center gap-4 mb-6">
            {blog.category && (
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] uppercase tracking-widest text-xs">
                {blog.category}
              </span>
            )}
            {blog.category && blog.date && (
              <span className="w-1 h-1 rounded-full bg-[var(--color-outline)]" />
            )}
            {blog.date && (
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs">
                {blog.date}
              </span>
            )}
          </div>
          <h2 className="type-headline-md text-[var(--color-primary)] mb-6 group-hover:text-[var(--color-tertiary)] transition-colors">
            {blog.title}
          </h2>
          <p className="type-body-md text-[var(--color-on-surface-variant)] mb-8 line-clamp-4">
            {blog.excerpt}
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 type-label-caps text-[var(--color-primary)] uppercase tracking-widest border-b border-white/30 pb-1 group-hover:border-white transition-colors text-[10px]">
            Read Article
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </a>
  )
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <a
      href={blog.articleLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group cursor-pointer block"
    >
      <div className="aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-[var(--color-surface-container-lowest)] glass-card">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover transition-all duration-500 opacity-70 group-hover:opacity-100"
        />
      </div>
      <div className="flex items-center gap-3 mb-3">
        {blog.category && (
          <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs">
            {blog.category}
          </span>
        )}
        {blog.category && blog.date && (
          <span className="w-1 h-1 rounded-full bg-[var(--color-outline)]" />
        )}
        {blog.date && (
          <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs">
            {blog.date}
          </span>
        )}
      </div>
      <h4 className="font-[family-name:var(--font-hanken)] text-body-lg text-[var(--color-primary)] mb-3 font-medium leading-snug group-hover:text-[var(--color-on-surface)] transition-colors">
        {blog.title}
      </h4>
      <p className="type-body-md text-[var(--color-on-surface-variant)] text-sm line-clamp-2 leading-relaxed">
        {blog.excerpt}
      </p>
    </a>
  )
}

export default function BlogsClient({ initialData }: { initialData: Blog[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const featured = initialData.find(b => b.featured)
  const featuredFiltered = activeCategory === 'All'
    ? featured
    : (featured?.category === activeCategory ? featured : undefined)
  const gridItems = activeCategory === 'All'
    ? initialData.filter(b => b.id !== featured?.id)
    : initialData.filter(b => b.category === activeCategory && b.id !== featuredFiltered?.id)

  return (
    <main className="pt-[160px] pb-32 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full relative z-10">

      {/* Hero */}
      <header className="mb-24 md:mb-[160px] max-w-3xl">
        <h1 className="type-display-mobile md:type-display-lg text-[var(--color-primary)] mb-6">
          Technical Writing
        </h1>
        <p className="type-body-lg text-[var(--color-on-surface-variant)] max-w-2xl">
          A repository of deep dives, architectural decisions, and editorial perspectives on building cinematic AI tooling.
        </p>
      </header>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3 mb-14 overflow-x-auto pb-2 scrollbar-hide -mx-[var(--spacing-margin-mobile)] px-[var(--spacing-margin-mobile)] md:mx-0 md:px-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pill-filter type-label-caps px-5 py-2.5 rounded-full whitespace-nowrap${activeCategory === cat ? ' active' : ' text-[var(--color-on-surface)]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Article */}
      {featuredFiltered && (
        <section className="mb-24 md:mb-[200px]">
          <FeaturedBlogCard blog={featuredFiltered} />
        </section>
      )}

      {/* Article Grid */}
      {gridItems.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
            <h3 className="type-mono-technical text-[var(--color-on-surface-variant)] uppercase tracking-widest text-xs">
              Latest Publications
            </h3>
            <span className="hidden md:block type-mono-technical text-[var(--color-on-surface-variant)] text-xs opacity-60">
              {gridItems.length} Articles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[var(--spacing-gutter)] gap-y-16">
            {gridItems.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {gridItems.length === 0 && !featuredFiltered && (
        <div className="text-center py-32">
          <p className="type-body-md text-[var(--color-on-surface-variant)] opacity-60">
            No articles in this category yet.
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-24 pt-16 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] mb-2 tracking-widest">
            More Writing
          </p>
          <h3 className="text-[var(--color-primary)] font-semibold text-xl tracking-tight">
            Read more on Medium
          </h3>
          <p className="type-body-md text-[var(--color-on-surface-variant)] text-sm mt-1 max-w-md">
            In-depth tutorials, AI workflow breakdowns, and creator perspectives published regularly.
          </p>
        </div>
        <a
          href="https://medium.com/@createwithanmol"
          target="_blank"
          rel="noopener noreferrer"
          className="pill-filter type-label-caps px-6 py-3 rounded-full text-[var(--color-primary)] whitespace-nowrap flex items-center gap-2 hover:gap-3 transition-all duration-300"
        >
          Open Medium
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>

    </main>
  )
}

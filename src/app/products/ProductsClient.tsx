'use client'

import { useState } from 'react'
import type { Product } from '@/lib/types'

const CATEGORIES = ['All', 'Preset Packs', 'UI Kits', 'Typography', 'Soundscapes', 'Guides']

function FeaturedProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.productLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block glass-card glass-card-hover rounded-2xl overflow-hidden mb-[var(--spacing-gutter)]"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image */}
        <div className="relative lg:w-[58%] h-72 sm:h-96 lg:h-auto lg:min-h-[480px] overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40 lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
          {product.badge && (
            <div className="absolute top-5 left-5 flex items-center gap-2">
              <span className="bg-white text-black type-label-caps px-3 py-1.5 rounded-full text-[10px]">
                {product.badge}
              </span>
            </div>
          )}
          {product.category && (
            <div className="absolute top-5 right-5">
              <span className="glass-card type-label-caps px-3 py-1.5 rounded-full text-[10px] text-[var(--color-on-surface-variant)] border-white/10">
                {product.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:w-[42%] p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-3">
            <span className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px]">
              Featured Product
            </span>
          </div>
          <h2 className="type-headline-md text-[var(--color-primary)] mb-5 text-3xl lg:text-4xl tracking-tight leading-tight">
            {product.title}
          </h2>
          <p className="type-body-md text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
            {product.description}
          </p>
          {product.specs && (
            <p className="type-mono-technical text-[var(--color-on-surface-variant)] mb-8 pb-8 border-b border-white/10 text-xs opacity-70">
              {product.specs}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-primary)] font-semibold text-3xl tracking-tight">
              {product.price}
            </span>
            <span className="flex items-center gap-2 type-label-caps text-[var(--color-primary)] text-[11px] group-hover:gap-3 transition-all duration-300">
              Acquire Now
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.productLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-card glass-card-hover rounded-xl overflow-hidden flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden border-b border-white/5">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {product.category && (
          <div className="absolute top-4 left-4">
            <span className="bg-[rgba(19,19,19,0.85)] backdrop-blur-md type-label-caps px-3 py-1 rounded border border-white/10 text-[10px] text-[var(--color-primary)]">
              {product.category}
            </span>
          </div>
        )}
        {product.price && (
          <div className="absolute bottom-4 right-4">
            <span className="bg-[rgba(19,19,19,0.85)] backdrop-blur-md px-3 py-1 rounded border border-white/10 text-[var(--color-primary)] font-semibold text-sm tracking-tight">
              {product.price}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-[var(--color-primary)] font-semibold text-lg tracking-tight mb-3 leading-snug">
          {product.title}
        </h3>
        <p className="type-body-md text-[var(--color-on-surface-variant)] text-sm mb-5 line-clamp-2 flex-grow leading-relaxed">
          {product.description}
        </p>
        {product.specs && (
          <p className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs mb-5 opacity-60 leading-relaxed">
            {product.specs}
          </p>
        )}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
          {product.price && (
            <span className="text-[var(--color-primary)] font-semibold text-lg tracking-tight">
              {product.price}
            </span>
          )}
          <span className="type-label-caps text-[var(--color-primary)] text-[10px] flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-300 ml-auto">
            Acquire
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </a>
  )
}

export default function ProductsClient({ initialData }: { initialData: Product[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const featured = initialData.find(p => p.featured)
  const allFiltered = activeCategory === 'All'
    ? initialData.filter(p => !p.featured)
    : initialData.filter(p => p.category === activeCategory && !p.featured)
  const featuredFiltered = activeCategory === 'All'
    ? featured
    : (featured && featured.category === activeCategory ? featured : undefined)

  return (
    <main className="pt-[160px] pb-32 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full relative z-10">

      {/* Hero */}
      <header className="mb-16 md:mb-20 flex flex-col items-start max-w-3xl">
        <div className="mb-4">
          <span className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] tracking-widest">
            Digital Products
          </span>
        </div>
        <h1 className="type-display-mobile md:type-display-lg text-gradient mb-6 tracking-tight">
          Creator Products
        </h1>
        <p className="type-body-lg text-[var(--color-on-surface-variant)] max-w-2xl">
          Premium digital resources crafted for AI creators, prompt engineers, and designers. Each product is built for cinematic excellence and professional output.
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

      {/* Featured Product */}
      {featuredFiltered && (
        <section className="mb-20">
          <FeaturedProductCard product={featuredFiltered} />
        </section>
      )}

      {/* Studio Essentials Grid */}
      {allFiltered.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] block mb-2 tracking-widest">
                {activeCategory === 'All' ? 'Studio Essentials' : activeCategory}
              </span>
              <h2 className="text-[var(--color-primary)] font-semibold text-2xl tracking-tight">
                {activeCategory === 'All' ? 'More From the Studio' : `${activeCategory} Collection`}
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 type-label-caps text-[var(--color-on-surface-variant)] text-[10px]">
              <span>{allFiltered.length} Products</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]">
            {allFiltered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {allFiltered.length === 0 && !featuredFiltered && (
        <div className="text-center py-32">
          <p className="type-body-md text-[var(--color-on-surface-variant)] opacity-60">
            No products in this category yet.
          </p>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-24 pt-16 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="type-label-caps text-[var(--color-on-surface-variant)] text-[10px] mb-2 tracking-widest">
            Custom Work
          </p>
          <h3 className="text-[var(--color-primary)] font-semibold text-xl tracking-tight">
            Need something tailored?
          </h3>
          <p className="type-body-md text-[var(--color-on-surface-variant)] text-sm mt-1 max-w-md">
            Commission custom presets, UI kits, or creative tooling built for your specific workflow.
          </p>
        </div>
        <a
          href="https://www.instagram.com/createwithanmol"
          target="_blank"
          rel="noopener noreferrer"
          className="pill-filter type-label-caps px-6 py-3 rounded-full text-[var(--color-primary)] whitespace-nowrap flex items-center gap-2 hover:gap-3 transition-all duration-300"
        >
          Get in Touch
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
    </main>
  )
}

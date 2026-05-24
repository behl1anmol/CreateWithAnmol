'use client'

import { useState } from 'react'
import type { Prompt } from '@/lib/types'

const CATEGORIES = ['All', 'AI Visuals', 'UI Design', 'Cinematic Prompts', 'Workflow Prompts', 'ChatGPT Prompts']

export default function PromptsClient({ initialData }: { initialData: Prompt[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? initialData
    : initialData.filter(p => p.category === activeCategory)

  return (
    <main className="pt-[160px] pb-32 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full relative z-10">

      {/* Hero */}
      <header className="mb-16 md:mb-24 text-center md:text-left flex flex-col items-center md:items-start max-w-3xl">
        <h1 className="type-display-mobile md:type-display-lg text-gradient mb-6 tracking-tight">
          Prompt Library
        </h1>
        <p className="type-body-lg text-[var(--color-on-surface-variant)] max-w-2xl">
          A curated collection of high-fidelity AI prompts designed for cinematic excellence and editorial precision. Elevate your creative output with exact syntax.
        </p>
      </header>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3 mb-16 overflow-x-auto pb-4 scrollbar-hide -mx-[var(--spacing-margin-mobile)] px-[var(--spacing-margin-mobile)] md:mx-0 md:px-0">
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

      {/* Prompt Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]">
        {filtered.map(prompt => (
          <article
            key={prompt.id}
            className="glass-card rounded-xl group flex flex-col h-full cursor-pointer hover:border-white/20 transition-colors duration-300"
          >
            {/* Card Image */}
            <div className="h-48 md:h-64 w-full overflow-hidden relative border-b border-white/5">
              <img
                src={prompt.image}
                alt={prompt.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {prompt.category && (
                <div className="absolute top-4 left-4 bg-[rgba(19,19,19,0.8)] backdrop-blur-md px-3 py-1 rounded border border-white/10 type-label-caps text-[10px] text-[var(--color-primary)]">
                  {prompt.category}
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="type-headline-md text-[var(--color-primary)] mb-3 text-xl md:text-2xl tracking-tight">
                {prompt.title}
              </h3>
              <p className="type-body-md text-[var(--color-on-surface-variant)] mb-6 line-clamp-2 flex-grow">
                {prompt.description}
              </p>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-auto">
                {prompt.tool && (
                  <span className="type-mono-technical text-[var(--color-on-surface-variant)]">
                    {prompt.tool}
                  </span>
                )}
                <a
                  href={prompt.promptLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-label-caps text-[var(--color-primary)] flex items-center gap-2 group-hover:translate-x-1 transition-transform ml-auto"
                >
                  Get Prompt
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-32">
          <p className="type-body-md text-[var(--color-on-surface-variant)] opacity-60">
            No prompts in this category yet.
          </p>
        </div>
      )}
    </main>
  )
}

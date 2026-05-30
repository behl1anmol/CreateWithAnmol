'use client'

import { useEffect, useRef, useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Prompt, Product, Blog } from '@/lib/types'

interface SearchResults {
  prompts: Prompt[]
  products: Product[]
  blogs: Blog[]
}

function PromptResultRow({ prompt }: { prompt: Prompt }) {
  return (
    <a
      href={prompt.promptLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-card rounded-xl flex items-center gap-5 p-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-300"
    >
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-container-lowest)]">
        <img
          src={prompt.image}
          alt={prompt.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0">
        {prompt.category && (
          <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs uppercase tracking-widest mb-1 block">
            {prompt.category}{prompt.tool ? ` · ${prompt.tool}` : ''}
          </span>
        )}
        <p className="type-body-md font-medium text-[var(--color-primary)] line-clamp-1 leading-snug">
          {prompt.title}
        </p>
        {prompt.description && (
          <p className="type-mono-technical text-[var(--color-on-surface-variant)] line-clamp-1 mt-0.5">
            {prompt.description}
          </p>
        )}
      </div>
      <span className="material-symbols-outlined text-[18px] text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-300 shrink-0">
        arrow_forward
      </span>
    </a>
  )
}

function ProductResultRow({ product }: { product: Product }) {
  return (
    <a
      href={product.productLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-card rounded-xl flex items-center gap-5 p-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-300"
    >
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-container-lowest)]">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {product.category && (
            <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs uppercase tracking-widest">
              {product.category}
            </span>
          )}
          {product.price && (
            <>
              {product.category && <span className="w-1 h-1 rounded-full bg-[var(--color-outline)] shrink-0" />}
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs">
                {product.price}
              </span>
            </>
          )}
        </div>
        <p className="type-body-md font-medium text-[var(--color-primary)] line-clamp-1 leading-snug">
          {product.title}
        </p>
        {product.description && (
          <p className="type-mono-technical text-[var(--color-on-surface-variant)] line-clamp-1 mt-0.5">
            {product.description}
          </p>
        )}
      </div>
      <span className="material-symbols-outlined text-[18px] text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-300 shrink-0">
        arrow_forward
      </span>
    </a>
  )
}

function BlogResultRow({ blog }: { blog: Blog }) {
  return (
    <a
      href={blog.articleLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-card rounded-xl flex items-center gap-5 p-4 hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-300"
    >
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-container-lowest)]">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {blog.category && (
            <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs uppercase tracking-widest">
              {blog.category}
            </span>
          )}
          {blog.date && (
            <>
              {blog.category && <span className="w-1 h-1 rounded-full bg-[var(--color-outline)] shrink-0" />}
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs">
                {blog.date}
              </span>
            </>
          )}
        </div>
        <p className="type-body-md font-medium text-[var(--color-primary)] line-clamp-1 leading-snug">
          {blog.title}
        </p>
        {blog.excerpt && (
          <p className="type-mono-technical text-[var(--color-on-surface-variant)] line-clamp-1 mt-0.5">
            {blog.excerpt}
          </p>
        )}
      </div>
      <span className="material-symbols-outlined text-[18px] text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-300 shrink-0">
        arrow_forward
      </span>
    </a>
  )
}

export default function SearchClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = inputValue.trim()
    if (q.length < 2) {
      abortRef.current?.abort()
      abortRef.current = null
      setResults(null)
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        const data: SearchResults = await res.json()
        setResults(data)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setResults({ prompts: [], products: [], blogs: [] })
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [inputValue])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = inputValue.trim()
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : '/search', { scroll: false })
  }

  const hasResults = results && (
    results.prompts.length > 0 ||
    results.products.length > 0 ||
    results.blogs.length > 0
  )
  const noResults = results && !hasResults
  const showLanding = inputValue.trim().length < 2 && !loading

  return (
    <main className="pt-[160px] pb-32 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto w-full relative z-10">

      {/* Hero */}
      <header className="mb-12 md:mb-16 max-w-3xl">
        <span className="type-label-caps text-[var(--color-on-surface-variant)] mb-4 block">
          Search
        </span>
        <h1 className="type-display-mobile md:type-display-lg text-gradient tracking-tight">
          Find anything.
        </h1>
      </header>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="mb-16" role="search">
        <div className="glass-card rounded-xl flex items-center gap-4 px-6 py-4">
          <span className="material-symbols-outlined text-[22px] text-[var(--color-on-surface-variant)] shrink-0">
            search
          </span>
          <input
            data-testid="search-input"
            type="search"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Prompts, products, articles…"
            className="flex-1 bg-transparent outline-none type-body-lg text-[var(--color-primary)] placeholder:text-[var(--color-on-surface-variant)] placeholder:opacity-50"
          />
          {loading && (
            <span className="material-symbols-outlined text-[18px] text-[var(--color-on-surface-variant)] animate-spin shrink-0">
              progress_activity
            </span>
          )}
        </div>
      </form>

      {/* States */}
      <div className="flex flex-col gap-16">

        {/* Landing state */}
        {showLanding && (
          <div data-testid="search-landing" className="py-16 max-w-lg">
            <p className="type-body-lg text-[var(--color-on-surface-variant)] opacity-60">
              Search across prompts, products, and articles.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              {['Prompts', 'Products', 'Articles'].map(label => (
                <span
                  key={label}
                  className="pill-filter type-label-caps px-5 py-2.5 rounded-full text-[var(--color-on-surface-variant)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* No results state */}
        {noResults && !loading && (
          <div data-testid="search-no-results" className="py-16">
            <p className="type-body-lg text-[var(--color-on-surface-variant)] opacity-60">
              No results for &ldquo;{inputValue.trim()}&rdquo;.
            </p>
            <p className="type-body-md text-[var(--color-on-surface-variant)] opacity-40 mt-2">
              Try a broader term.
            </p>
          </div>
        )}

        {/* Prompts section */}
        {results && results.prompts.length > 0 && (
          <section data-testid="section-prompts">
            <div className="flex items-end justify-between mb-6 pb-4 border-b border-white/10">
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] uppercase tracking-widest text-xs">
                Prompts
              </span>
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs opacity-60">
                {results.prompts.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {results.prompts.map(p => (
                <PromptResultRow key={p.id} prompt={p} />
              ))}
            </div>
          </section>
        )}

        {/* Products section */}
        {results && results.products.length > 0 && (
          <section data-testid="section-products">
            <div className="flex items-end justify-between mb-6 pb-4 border-b border-white/10">
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] uppercase tracking-widest text-xs">
                Products
              </span>
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs opacity-60">
                {results.products.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {results.products.map(p => (
                <ProductResultRow key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Blogs section */}
        {results && results.blogs.length > 0 && (
          <section data-testid="section-blogs">
            <div className="flex items-end justify-between mb-6 pb-4 border-b border-white/10">
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] uppercase tracking-widest text-xs">
                Articles
              </span>
              <span className="type-mono-technical text-[var(--color-on-surface-variant)] text-xs opacity-60">
                {results.blogs.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {results.blogs.map(b => (
                <BlogResultRow key={b.id} blog={b} />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}

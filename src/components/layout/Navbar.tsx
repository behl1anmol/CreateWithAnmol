'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_SEARCH = { href: '/search', label: 'Search' }

const NAV_LINKS = [
  { href: '/prompts', label: 'Prompts' },
  { href: '/products', label: 'Products' },
  { href: '/blogs', label: 'Blogs' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-white/10">
      <div
        className="flex justify-between items-center h-20 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto"
      >
        {/* Brand */}
        <Link
          href="/"
          className="type-headline-md text-[var(--color-primary)] tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          Create with Anmol
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'type-body-md transition-colors duration-300 px-1 py-1',
                  active
                    ? 'text-[var(--color-primary)] border-b border-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Search */}
        <Link
          href={NAV_SEARCH.href}
          aria-label="Search"
          data-testid="search-icon-desktop"
          className={[
            'hidden md:inline-flex items-center p-2 transition-colors duration-300',
            pathname === NAV_SEARCH.href
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]',
          ].join(' ')}
        >
          <span className="material-symbols-outlined text-[22px]">search</span>
        </Link>

        {/* Desktop CTA */}
        <a
          href="https://www.linkedin.com/in/behlanmol/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block type-label-caps bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-2.5 rounded hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Follow on LinkedIn
        </a>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-1">
          <Link
            href={NAV_SEARCH.href}
            aria-label="Search"
            data-testid="search-icon-mobile"
            className={[
              'p-2 transition-colors duration-300',
              pathname === NAV_SEARCH.href
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-on-surface-variant)]',
            ].join(' ')}
          >
            <span className="material-symbols-outlined">search</span>
          </Link>
          <button
            className="text-[var(--color-primary)] p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-nav border-t border-white/10 px-[var(--spacing-margin-mobile)] py-6 flex flex-col gap-4">
          {[...NAV_LINKS, NAV_SEARCH].map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  'type-body-lg py-2 border-b border-white/5 transition-colors duration-200',
                  active
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
          <a
            href="https://www.linkedin.com/in/behlanmol/"
            target="_blank"
            rel="noopener noreferrer"
            className="type-label-caps mt-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 rounded text-center"
          >
            Follow on LinkedIn
          </a>
        </div>
      )}
    </header>
  )
}

import Link from 'next/link'

const FOOTER_LINKS = [
  { href: 'https://www.instagram.com/thestudioprompts.ai/', label: 'Instagram', external: true },
  { href: 'https://behlanmol.gumroad.com/', label: 'Gumroad', external: true },
  { href: 'https://medium.com/@behl1anmol', label: 'Medium', external: true },
  { href: '/about', label: 'About', external: false },
]

export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface-container-lowest)] border-t border-white/5 py-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] max-w-[var(--spacing-container-max)] mx-auto">
        {/* Brand */}
        <Link
          href="/"
          className="type-headline-md text-[var(--color-primary)] tracking-tight hover:opacity-80 transition-opacity"
        >
          Create with Anmol
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6" aria-label="Footer navigation">
          {FOOTER_LINKS.map(({ href, label, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="type-mono-technical uppercase tracking-widest text-[var(--color-on-primary-container)] hover:text-[var(--color-primary)] transition-colors duration-200"
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                className="type-mono-technical uppercase tracking-widest text-[var(--color-on-primary-container)] hover:text-[var(--color-primary)] transition-colors duration-200"
              >
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Copyright */}
        <p className="type-mono-technical text-[var(--color-secondary)] uppercase tracking-widest text-center">
          &copy; 2026 Create with Anmol
        </p>
      </div>
    </footer>
  )
}

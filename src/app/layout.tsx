import type { Metadata } from 'next'
import { Hanken_Grotesk, Inter, Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hanken',
  weight: ['400', '500', '600'],
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500'],
})

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  weight: ['400', '600'],
})

export const metadata: Metadata = {
  title: 'Create with Anmol',
  description: 'Software Engineer. AI Builder. Turning complex technology into things people can understand and use.',
  openGraph: {
    title: 'Create with Anmol',
    description: 'Software Engineer. AI Builder. Turning complex technology into things people can understand and use.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${hankenGrotesk.variable} ${inter.variable} ${geist.variable}`}
    >
      <head>
        {/* Material Symbols for icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="antialiased overflow-x-hidden min-h-screen flex flex-col">
        {/* Ambient liquid lighting orbs */}
        <div
          className="liquid-light"
          style={{ top: '-10%', left: '-5%' }}
          aria-hidden="true"
        />
        <div
          className="liquid-light"
          style={{ top: '40%', right: '-10%', left: 'auto' }}
          aria-hidden="true"
        />

        <Navbar />

        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}

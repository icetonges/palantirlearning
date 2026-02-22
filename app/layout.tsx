// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default:  'PalantirLearning — Expert Knowledge Platform',
    template: '%s | PalantirLearning',
  },
  description:
    'Self-evolving knowledge platform for mastering Palantir Foundry, Ontology, AIP, and Apollo. Daily news, AI-generated summaries, flashcards, and expert documentation.',
  keywords:  ['Palantir', 'Foundry', 'Ontology', 'AIP', 'Apollo', 'OSDK', 'AIP Logic'],
  authors:   [{ name: 'PalantirLearning' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title:       'PalantirLearning',
    description: 'Master the Palantir tech stack — Foundry, Ontology, AIP, Apollo',
    url:         'https://palantirlearning.vercel.app',
    siteName:    'PalantirLearning',
    type:        'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-night-950 min-h-screen flex flex-col">
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      <Analytics />
      </body>
    </html>
  )
}

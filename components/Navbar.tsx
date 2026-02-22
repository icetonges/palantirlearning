'use client'
// components/Navbar.tsx — Top navigation bar (reads from lib/navigation.ts)

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { NAV_ITEMS } from '@/lib/navigation'
import Image from 'next/image'

export default function Navbar() {
  const pathname  = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="sticky top-0 z-50 bg-night-950/95 backdrop-blur border-b border-night-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-palantir-400 text-xl font-mono group-hover:text-palantir-300 transition-colors">◎</span>
            <span className="text-white font-bold text-lg tracking-tight">
              Palantir<span className="text-palantir-400">Learning</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.filter(item => item.href !== '/').map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-palantir-700/30 text-palantir-300'
                    : 'text-night-200 hover:text-white hover:bg-night-800'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="text-[10px] px-1 py-0.5 bg-palantir-600/40 text-palantir-300 rounded font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Auth + Mobile toggle */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="hidden sm:flex items-center gap-2">
                {session.user?.image && (
                  <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full" />
                )}
                <button
                  onClick={() => signOut()}
                  className="text-xs text-night-300 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-palantir-700 hover:bg-palantir-600 text-white text-sm rounded-md transition-colors"
              >
                Sign in
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-night-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-night-950 border-t border-night-800 px-4 py-3 space-y-1 animate-fade-in">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                isActive(item.href)
                  ? 'bg-palantir-700/20 text-palantir-300'
                  : 'text-night-200 hover:text-white hover:bg-night-800'
              }`}
            >
              <span>{item.icon}</span>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] px-1 py-0.5 bg-palantir-600/40 text-palantir-300 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-night-400">{item.description}</div>
              </div>
            </Link>
          ))}
          {!session && (
            <button
              onClick={() => signIn('google')}
              className="w-full mt-2 px-4 py-2.5 bg-palantir-700 hover:bg-palantir-600 text-white text-sm rounded-md transition-colors"
            >
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

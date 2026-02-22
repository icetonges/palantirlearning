'use client'
// components/Navbar.tsx

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/navigation'

// Shorter labels for the tight desktop nav
const SHORT_LABELS: Record<string, string> = {
  'News & Intel': 'News',
}

export default function Navbar() {
  const pathname   = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const navItems = NAV_ITEMS.filter(item => item.href !== '/')

  return (
    <nav className="sticky top-0 z-50 bg-night-950/95 backdrop-blur border-b border-night-800">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5">
        <div className="flex items-center h-12 gap-1">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 mr-2 shrink-0 group">
            <span className="text-palantir-400 text-lg font-mono group-hover:text-palantir-300 transition-colors">◎</span>
            <span className="text-white font-bold text-base tracking-tight whitespace-nowrap">
              Palantir<span className="text-palantir-400">Learning</span>
            </span>
          </Link>

          {/* Desktop Nav — all items, compact */}
          <div className="hidden lg:flex items-center flex-1 min-w-0">
            {navItems.map((item) => {
              const label = SHORT_LABELS[item.label] ?? item.label
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-palantir-700/30 text-palantir-300'
                      : 'text-night-300 hover:text-white hover:bg-night-800'
                  }`}
                >
                  <span className="text-[10px] opacity-70">{item.icon}</span>
                  {label}
                  {item.badge && (
                    <span className="text-[9px] px-1 py-px bg-palantir-600/40 text-palantir-300 rounded font-mono leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden ml-auto">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-night-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-current transition-all ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${open ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lg:hidden bg-night-950 border-t border-night-800 px-4 py-3 grid grid-cols-2 gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-all ${
                isActive(item.href)
                  ? 'bg-palantir-700/20 text-palantir-300'
                  : 'text-night-200 hover:text-white hover:bg-night-800'
              }`}
            >
              <span>{item.icon}</span>
              <div>
                <div className="font-medium flex items-center gap-1.5">
                  {item.label}
                  {item.badge && (
                    <span className="text-[9px] px-1 py-px bg-palantir-600/40 text-palantir-300 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

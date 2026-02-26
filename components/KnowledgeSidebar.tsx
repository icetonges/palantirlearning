'use client'
// components/KnowledgeSidebar.tsx

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { groupByYearMonth } from '@/lib/utils'

interface PageItem {
  slug:        string
  title:       string
  subCategory: string | null
  createdAt:   Date | string
}

interface Props {
  pages:    PageItem[]
  basePath: string
  category: string
  color:    string
}

export default function KnowledgeSidebar({ pages, basePath, category, color }: Props) {
  const pathname  = usePathname()
  const [search,    setSearch]    = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const listRef   = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return pages
    const q = search.toLowerCase()
    return pages.filter(
      (p) => p.title.toLowerCase().includes(q) ||
             (p.subCategory || '').toLowerCase().includes(q)
    )
  }, [pages, search])

  const grouped = useMemo(
    () => groupByYearMonth(filtered.map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))),
    [filtered]
  )

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  // Auto-scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]') as HTMLElement
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [pathname])

  return (
    <aside
      className={`shrink-0 transition-all duration-200 flex flex-col ${
        collapsed ? 'w-10' : 'w-96'
      }`}
      style={{ height: 'calc(100vh - 120px)', position: 'sticky', top: '80px' }}
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-3 flex items-center justify-between px-2 py-2 text-night-400 hover:text-white hover:bg-night-800 rounded-lg text-xs transition-colors border border-night-700/50"
      >
        {!collapsed && <span className="font-mono tracking-wider">PAGES ({pages.length})</span>}
        <span className={`text-base ${collapsed ? 'mx-auto' : 'ml-auto'}`}>
          {collapsed ? '▶' : '◀'}
        </span>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2 min-h-0 flex-1">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="w-full px-3 py-2 bg-night-800 border border-night-700 rounded-lg text-sm text-white placeholder-night-500 focus:outline-none focus:border-palantir-500 transition-colors"
          />

          {/* Add note */}
          <Link
            href={`/notes?category=${category}`}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-palantir-800/30 hover:bg-palantir-700/40 border border-palantir-700/40 rounded-lg text-xs text-palantir-300 hover:text-palantir-200 transition-colors font-medium"
          >
            <span className="text-base leading-none">+</span> Add Note
          </Link>

          {/* Scrollable page list */}
          <div
            ref={listRef}
            className="sidebar-scroll flex-1 overflow-y-auto pr-1 min-h-0"
            style={{ scrollbarWidth: 'auto', scrollbarColor: '#486581 #102a43' }}
          >
            {years.length === 0 ? (
              <p className="text-night-500 text-xs px-2 mt-6 text-center leading-relaxed">
                {search ? 'No pages match your search.' : 'No pages yet.\nAdd a note to get started.'}
              </p>
            ) : (
              years.map((year) => (
                <div key={year} className="mb-1">
                  <div className={`text-xs font-bold ${color} mb-1 px-2 mt-3 flex items-center gap-2`}>
                    <span>{year}</span>
                    <span className="flex-1 h-px bg-night-700/50" />
                  </div>
                  {Object.entries(grouped[year]).map(([month, monthPages]) => (
                    <div key={month} className="mb-1">
                      <div className="text-[10px] text-night-500 px-2 py-0.5 uppercase tracking-widest font-medium">
                        {month}
                      </div>
                      {monthPages.map((page) => {
                        const href   = `${basePath}/${page.slug}`
                        const active = pathname === href
                        return (
                          <Link
                            key={page.slug}
                            href={href}
                            data-active={active}
                            className={`block px-3 py-2 rounded-lg text-xs transition-all mb-0.5 group ${
                              active
                                ? 'bg-palantir-700/30 text-white border-l-2 border-palantir-400'
                                : 'text-night-300 hover:text-white hover:bg-night-800 border-l-2 border-transparent'
                            }`}
                          >
                            <div className="font-medium line-clamp-2 leading-snug">
                              {page.title}
                            </div>
                            {page.subCategory && (
                              <div className={`${color} opacity-60 text-[10px] mt-0.5 group-hover:opacity-80 transition-opacity`}>
                                {page.subCategory}
                              </div>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

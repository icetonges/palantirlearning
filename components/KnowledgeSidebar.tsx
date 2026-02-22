'use client'
// components/KnowledgeSidebar.tsx — Left sidebar for knowledge tab pages

import { useState, useMemo } from 'react'
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
  basePath: string // e.g. '/foundry'
  category: string
  color:    string // e.g. 'text-blue-400'
}

export default function KnowledgeSidebar({ pages, basePath, category, color }: Props) {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return pages
    const q = search.toLowerCase()
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.subCategory || '').toLowerCase().includes(q)
    )
  }, [pages, search])

  const grouped = useMemo(
    () => groupByYearMonth(filtered.map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))),
    [filtered]
  )

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <aside
      className={`shrink-0 transition-all duration-200 ${
        collapsed ? 'w-10' : 'w-64'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-2 w-full flex items-center justify-between px-2 py-1.5 text-night-400 hover:text-white hover:bg-night-800 rounded-md text-xs transition-colors"
      >
        {!collapsed && <span className="font-mono">PAGES ({pages.length})</span>}
        <span className="ml-auto">{collapsed ? '▶' : '◀'}</span>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="w-full px-3 py-1.5 bg-night-800 border border-night-700 rounded-md text-sm text-white placeholder-night-500 focus:outline-none focus:border-palantir-500 transition-colors"
          />

          {/* Link to add a note */}
          <Link
            href={`/notes?category=${category}`}
            className="flex items-center gap-2 px-3 py-1.5 bg-palantir-800/30 hover:bg-palantir-700/30 border border-palantir-700/40 rounded-md text-xs text-palantir-300 transition-colors"
          >
            <span>+</span> Add Note
          </Link>

          {/* Grouped pages */}
          {years.length === 0 ? (
            <p className="text-night-500 text-xs px-2 mt-4 text-center">
              {search ? 'No pages match your search.' : 'No pages yet. Add a note to get started.'}
            </p>
          ) : (
            years.map((year) => (
              <div key={year}>
                <div className={`text-xs font-bold ${color} mb-1 px-1 mt-2`}>{year}</div>
                {Object.entries(grouped[year]).map(([month, monthPages]) => (
                  <div key={month} className="mb-2">
                    <div className="text-[11px] text-night-500 px-1 mb-1 uppercase tracking-wider">{month}</div>
                    {monthPages.map((page) => {
                      const href    = `${basePath}/${page.slug}`
                      const active  = pathname === href
                      return (
                        <Link
                          key={page.slug}
                          href={href}
                          className={`block px-2 py-1.5 rounded-md text-xs transition-all mb-0.5 ${
                            active
                              ? 'bg-palantir-700/30 text-white border-l-2 border-palantir-400 pl-2'
                              : 'text-night-300 hover:text-white hover:bg-night-800'
                          }`}
                        >
                          <div className="font-medium line-clamp-2 leading-tight">{page.title}</div>
                          {page.subCategory && (
                            <div className={`${color} opacity-70 text-[10px] mt-0.5`}>{page.subCategory}</div>
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
      )}
    </aside>
  )
}

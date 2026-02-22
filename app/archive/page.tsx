// app/archive/page.tsx — Full knowledge archive
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Metadata } from 'next'
import { formatDate, groupByYearMonth } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Full searchable archive of all knowledge pages, indexed by date and category.',
}

const CATEGORY_HREF: Record<string, string> = {
  FOUNDRY: 'foundry', ONTOLOGY: 'ontology', AIP: 'aip', APOLLO: 'apollo', GENERAL: 'archive',
}
const CAT_COLORS: Record<string, string> = {
  FOUNDRY: 'text-blue-400 bg-blue-900/20 border-blue-700/40',
  ONTOLOGY: 'text-violet-400 bg-violet-900/20 border-violet-700/40',
  AIP: 'text-cyan-400 bg-cyan-900/20 border-cyan-700/40',
  APOLLO: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/40',
  GENERAL: 'text-night-400 bg-night-800/20 border-night-700',
}

interface SearchParams { q?: string; category?: string }

export default async function ArchivePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const q    = params.q
  const cat  = params.category

  const pages = await prisma.knowledgePage.findMany({
    where: {
      ...(cat ? { category: cat as 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL' } : {}),
      ...(q ? {
        OR: [
          { title:      { contains: q, mode: 'insensitive' } },
          { content:    { contains: q, mode: 'insensitive' } },
          { excerpt:    { contains: q, mode: 'insensitive' } },
          { subCategory: { contains: q, mode: 'insensitive' } },
        ]
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, slug: true, title: true, category: true, subCategory: true, excerpt: true, aiSummary: true, tags: true, sourceType: true, viewCount: true, createdAt: true },
  })

  const grouped = groupByYearMonth(pages.map(p => ({ ...p, createdAt: new Date(p.createdAt) })))
  const years   = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-slate-400">◰</span> Archive
        </h1>
        <p className="text-night-400 text-sm">All {pages.length} knowledge pages, sorted by date. Search, filter, and browse your complete knowledge base.</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form method="GET" action="/archive" className="flex-1 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search all pages…"
            className="flex-1 px-4 py-2.5 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500 text-sm focus:outline-none focus:border-palantir-500 transition-colors"
          />
          {cat && <input type="hidden" name="category" value={cat} />}
          <button type="submit" className="px-4 py-2.5 bg-palantir-700 hover:bg-palantir-600 text-white rounded-lg text-sm transition-all">
            Search
          </button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {['', 'FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO'].map((c) => (
            <a
              key={c || 'ALL'}
              href={`/archive${c ? `?category=${c}` : ''}${q ? `${c ? '&' : '?'}q=${q}` : ''}`}
              className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                (cat === c) || (!cat && !c) ? 'bg-night-700 border-night-600 text-white' : 'bg-night-800 border-night-700 text-night-400 hover:text-white'
              }`}
            >
              {c || 'ALL'}
            </a>
          ))}
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-16 text-night-500">
          {q ? (
            <>
              <p className="mb-2">No pages match &ldquo;{q}&rdquo;</p>
              <Link href="/archive" className="text-palantir-400 text-sm hover:underline">Clear search</Link>
            </>
          ) : (
            <>
              <p className="mb-2">No knowledge pages yet.</p>
              <Link href="/notes" className="text-palantir-400 text-sm hover:underline">Add your first note →</Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {years.map((year) => (
            <section key={year}>
              <h2 className="text-xl font-bold text-white mb-4 font-mono">{year}</h2>
              {Object.entries(grouped[year]).map(([month, monthPages]) => (
                <div key={month} className="mb-6">
                  <h3 className="text-night-400 text-sm font-semibold mb-3 pl-2 border-l-2 border-night-700">{month}</h3>
                  <div className="space-y-2">
                    {monthPages.map((page) => {
                      const href = `/${CATEGORY_HREF[page.category] || 'archive'}/${page.slug}`
                      const colorCls = CAT_COLORS[page.category] || CAT_COLORS.GENERAL
                      return (
                        <Link
                          key={page.id}
                          href={href}
                          className="group flex items-start gap-4 p-4 bg-night-900 border border-night-800 hover:border-night-700 rounded-xl transition-all"
                        >
                          <div className="shrink-0 mt-0.5">
                            <span className={`text-xs px-2 py-1 rounded border ${colorCls} font-mono`}>
                              {page.category}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="text-white text-sm font-medium group-hover:text-palantir-200 transition-colors line-clamp-1">
                                {page.title}
                              </h4>
                              <span className="text-night-600 text-xs shrink-0">{formatDate(page.createdAt)}</span>
                            </div>
                            {(page.aiSummary || page.excerpt) && (
                              <p className="text-night-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                                {page.aiSummary || page.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {page.subCategory && <span className="text-night-500 text-xs font-mono">{page.subCategory}</span>}
                              {page.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] text-night-600 font-mono">#{tag}</span>
                              ))}
                              <span className="text-night-700 text-xs ml-auto">{page.viewCount} views · {page.sourceType}</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

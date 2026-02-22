'use client'
// app/archive/page.tsx — Knowledge Archive with Edit / Delete / Index
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────
type Category = 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL'

interface KPage {
  id:          string
  slug:        string
  title:       string
  category:    Category
  subCategory: string | null
  excerpt:     string | null
  aiSummary:   string | null
  tags:        string[]
  sourceType:  string
  viewCount:   number
  pinned:      boolean
  createdAt:   string
  updatedAt:   string
}

interface CountEntry  { category: Category; _count: { id: number } }
interface SubCountEntry{ subCategory: string | null; _count: { id: number } }

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = ['FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO', 'GENERAL']

const SUBCATS: Record<string, string[]> = {
  FOUNDRY:  ['Core Concepts', 'Data Connection & Ingestion', 'Datasets & Branches', 'Transforms', 'PySpark & Python', 'SQL Transforms', 'Contour Analytics', 'Workshop Apps', 'Slate', 'Foundry ML', 'OSDK in Foundry', 'Security & Markings', 'DevTools & CLI'],
  ONTOLOGY: ['Core Concepts', 'Object Types', 'Link Types', 'Actions & Rules', 'OSDK (TypeScript)', 'OSDK (Python)', 'Time Series', 'Search & Filtering', 'Ontology Sync', 'Aggregations'],
  AIP:      ['Core Concepts', 'AIP Logic', 'AIP Copilot', 'AIP Studio', 'Function Repository', 'LLM Configuration', 'Prompt Engineering', 'Security & Governance', 'Use Cases', 'Performance'],
  APOLLO:   ['Core Concepts', 'Software Distribution', 'Fleet Management', 'Enrollment', 'Configuration Policies', 'Health Monitoring', 'Apollo CLI', 'Air-Gapped Deployments', 'Government & DoD'],
  GENERAL:  ['General', 'Architecture', 'Best Practices', 'Comparison', 'Career'],
}

const CAT_STYLE: Record<string, { badge: string; dot: string; card: string; sidebar: string }> = {
  FOUNDRY:  { badge: 'text-blue-300 bg-blue-900/30 border-blue-700/50',    dot: 'bg-blue-400',    card: 'hover:border-blue-700/40',   sidebar: 'text-blue-300' },
  ONTOLOGY: { badge: 'text-violet-300 bg-violet-900/30 border-violet-700/50', dot: 'bg-violet-400', card: 'hover:border-violet-700/40', sidebar: 'text-violet-300' },
  AIP:      { badge: 'text-cyan-300 bg-cyan-900/30 border-cyan-700/50',      dot: 'bg-cyan-400',    card: 'hover:border-cyan-700/40',   sidebar: 'text-cyan-300' },
  APOLLO:   { badge: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/50', dot: 'bg-emerald-400', card: 'hover:border-emerald-700/40', sidebar: 'text-emerald-300' },
  GENERAL:  { badge: 'text-night-300 bg-night-800 border-night-700',         dot: 'bg-night-400',   card: 'hover:border-night-600',     sidebar: 'text-night-400' },
}

const CAT_HREF: Record<string, string> = {
  FOUNDRY: 'foundry', ONTOLOGY: 'ontology', AIP: 'aip', APOLLO: 'apollo', GENERAL: 'archive',
}

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc',  label: 'Oldest first' },
  { value: 'views',     label: 'Most viewed' },
  { value: 'title',     label: 'A → Z' },
  { value: 'pinned',    label: 'Pinned first' },
]

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Edit Panel ───────────────────────────────────────────────────────────────
function EditPanel({
  page, onSave, onClose
}: {
  page: KPage
  onSave: (updated: Partial<KPage>) => Promise<void>
  onClose: () => void
}) {
  const [title,    setTitle]    = useState(page.title)
  const [category, setCategory] = useState<Category>(page.category)
  const [subCat,   setSubCat]   = useState(page.subCategory || '')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // Lazy load full content — open the page directly to edit content body
  useEffect(() => {
    // Content editing is done via the full page link below
  }, [page.id])

  const handleCatChange = (cat: Category) => {
    setCategory(cat)
    setSubCat(SUBCATS[cat]?.[0] || '')
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      await onSave({ title, category, subCategory: subCat || null })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const s = CAT_STYLE[category]

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-night-950/80 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-xl bg-night-950 border-l border-night-700 flex flex-col h-full shadow-2xl animate-slide-in-right overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-night-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-palantir-400 text-lg">✎</span>
            <span className="text-white font-semibold">Edit Knowledge Page</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-night-800 text-night-400 hover:text-white transition-all">
            ✕
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-night-300 text-xs font-medium mb-1.5 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-night-800 border border-night-700 rounded-lg text-white text-sm focus:outline-none focus:border-palantir-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-night-300 text-xs font-medium mb-1.5 uppercase tracking-wider">Category</label>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => handleCatChange(cat)}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                    category === cat
                      ? CAT_STYLE[cat].badge
                      : 'bg-night-800/50 border-night-700 text-night-500 hover:text-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-category */}
          <div>
            <label className="block text-night-300 text-xs font-medium mb-1.5 uppercase tracking-wider">Sub-category</label>
            <select value={subCat} onChange={e => setSubCat(e.target.value)}
              className="w-full px-3 py-2.5 bg-night-800 border border-night-700 rounded-lg text-white text-sm focus:outline-none focus:border-palantir-500">
              <option value="">— None —</option>
              {(SUBCATS[category] || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Page info */}
          <div className="bg-night-900 border border-night-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-night-500">Created</span>
              <span className="text-night-300 font-mono">{fmtDate(page.createdAt)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-night-500">Updated</span>
              <span className="text-night-300 font-mono">{fmtDate(page.updatedAt)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-night-500">Views</span>
              <span className="text-night-300 font-mono">{page.viewCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-night-500">Source</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${s.badge}`}>{page.sourceType}</span>
            </div>
            {page.tags.length > 0 && (
              <div className="pt-2 border-t border-night-800">
                <div className="text-night-500 text-xs mb-1.5">AI Tags</div>
                <div className="flex flex-wrap gap-1">
                  {page.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-night-800 border border-night-700 text-night-400 rounded-full font-mono">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {(page.aiSummary || page.excerpt) && (
              <div className="pt-2 border-t border-night-800">
                <div className="text-night-500 text-xs mb-1.5">AI Summary</div>
                <p className="text-night-300 text-xs leading-relaxed">{page.aiSummary || page.excerpt}</p>
              </div>
            )}
          </div>

          {/* View full note link */}
          <Link
            href={`/${CAT_HREF[page.category] || 'archive'}/${page.slug}`}
            className="flex items-center gap-2 px-3 py-2 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 hover:text-white rounded-lg text-xs transition-all"
          >
            <span>↗</span> Open full page to edit content
          </Link>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-300 text-xs">{error}</div>
          )}
        </div>

        {/* Panel footer */}
        <div className="px-6 py-4 border-t border-night-800 flex gap-3 shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 rounded-lg text-sm transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading || !title.trim()}
            className="flex-1 py-2.5 bg-palantir-700 hover:bg-palantir-600 disabled:bg-night-800 disabled:text-night-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
            {loading ? <><span className="animate-spin">⟳</span> Saving…</> : '✓ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ page, onConfirm, onCancel }: { page: KPage; onConfirm: () => Promise<void>; onCancel: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-night-950/90 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-night-900 border border-red-900/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-900/40 border border-red-700/50 flex items-center justify-center">
              <span className="text-red-400 text-lg">⚠</span>
            </div>
            <div>
              <div className="text-white font-semibold">Delete Knowledge Page</div>
              <div className="text-red-400 text-xs">This action cannot be undone</div>
            </div>
          </div>
          <div className="bg-night-950 border border-night-800 rounded-xl p-3 mb-5">
            <p className="text-night-200 text-sm font-medium line-clamp-2">{page.title}</p>
            <p className="text-night-500 text-xs mt-1">{CAT_STYLE[page.category] && page.category} {page.subCategory ? `· ${page.subCategory}` : ''}</p>
          </div>
          <p className="text-night-400 text-sm leading-relaxed">
            Permanently deletes this knowledge page and all associated flashcards. The content cannot be recovered.
          </p>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 rounded-lg text-sm transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 py-2.5 bg-red-900/60 hover:bg-red-800/60 border border-red-700/50 text-red-300 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
            {loading ? <><span className="animate-spin">⟳</span></> : '⚠ Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Archive Page ────────────────────────────────────────────────────────
export default function ArchivePage() {
  const [pages,        setPages]        = useState<KPage[]>([])
  const [catCounts,    setCatCounts]    = useState<Record<string, number>>({})
  const [subCounts,    setSubCounts]    = useState<Array<{ subCategory: string; count: number }>>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [filterCat,    setFilterCat]    = useState<Category | ''>('')
  const [filterSub,    setFilterSub]    = useState('')
  const [filterTag,    setFilterTag]    = useState('')
  const [sort,         setSort]         = useState('date-desc')
  const [editPage,     setEditPage]     = useState<KPage | null>(null)
  const [deletePage,   setDeletePage]   = useState<KPage | null>(null)
  const [view,         setView]         = useState<'list' | 'grid'>('list')
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPages = useCallback(async (q = '', cat = '', sub = '') => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q)   params.set('q', q)
    if (cat) params.set('category', cat)
    if (sub) params.set('subCategory', sub)
    try {
      const res  = await fetch(`/api/notes?${params}`)
      const data = await res.json()
      setPages(data.pages || [])
      const counts: Record<string, number> = {}
      ;(data.counts as CountEntry[])?.forEach(c => { counts[c.category] = c._count.id })
      setCatCounts(counts)
      const subs: Array<{ subCategory: string; count: number }> = []
      ;(data.subCounts as SubCountEntry[])?.forEach(c => {
        if (c.subCategory) subs.push({ subCategory: c.subCategory, count: c._count.id })
      })
      subs.sort((a, b) => b.count - a.count)
      setSubCounts(subs)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPages() }, [fetchPages])

  // Debounced search
  useEffect(() => {
    clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => {
      setActiveSearch(search)
      fetchPages(search, filterCat, filterSub)
    }, 350)
  }, [search, filterCat, filterSub, fetchPages])

  // ── Sorted + filtered pages ────────────────────────────────────────────────
  const displayPages = [...pages].filter(p => {
    if (filterTag && !p.tags.includes(filterTag)) return false
    return true
  }).sort((a, b) => {
    if (sort === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sort === 'date-asc')  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (sort === 'views')     return b.viewCount - a.viewCount
    if (sort === 'title')     return a.title.localeCompare(b.title)
    if (sort === 'pinned')    return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
    return 0
  })

  // ── All tags ───────────────────────────────────────────────────────────────
  const allTags = [...new Set(pages.flatMap(p => p.tags))].sort()

  // ── Grouped by date (for list view) ───────────────────────────────────────
  const groupedByMonth: Record<string, KPage[]> = {}
  if (sort === 'date-desc' || sort === 'date-asc') {
    displayPages.forEach(p => {
      const key = new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      if (!groupedByMonth[key]) groupedByMonth[key] = []
      groupedByMonth[key].push(p)
    })
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEdit = async (updates: Partial<KPage>) => {
    if (!editPage) return
    const res = await fetch('/api/notes', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: editPage.id, ...updates }),
    })
    if (!res.ok) throw new Error('Save failed')
    setPages(prev => prev.map(p => p.id === editPage.id ? { ...p, ...updates } : p))
    setEditPage(null)
  }

  const handleDelete = async () => {
    if (!deletePage) return
    const res = await fetch('/api/notes', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: deletePage.id }),
    })
    if (!res.ok) throw new Error('Delete failed')
    setPages(prev => prev.filter(p => p.id !== deletePage.id))
    setDeletePage(null)
  }

  const handlePin = async (page: KPage) => {
    await fetch('/api/notes', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: page.id, pinned: !page.pinned }),
    })
    setPages(prev => prev.map(p => p.id === page.id ? { ...p, pinned: !p.pinned } : p))
  }

  const clearFilters = () => {
    setSearch(''); setFilterCat(''); setFilterSub(''); setFilterTag(''); setActiveSearch('')
    fetchPages()
  }

  const hasFilters = search || filterCat || filterSub || filterTag

  // ── PageCard component ─────────────────────────────────────────────────────
  const PageCard = ({ page, compact = false }: { page: KPage; compact?: boolean }) => {
    const s = CAT_STYLE[page.category] || CAT_STYLE.GENERAL
    const href = `/${CAT_HREF[page.category] || 'archive'}/${page.slug}`

    return (
      <div className={`group relative bg-night-900 border border-night-800 ${s.card} rounded-xl transition-all overflow-hidden`}>
        {/* Pin indicator */}
        {page.pinned && (
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/60 rounded-l-xl" />
        )}
        <div className={`flex items-start gap-3 p-4 ${compact ? 'py-3' : ''}`}>
          {/* Category dot */}
          <div className={`shrink-0 mt-1 w-2 h-2 rounded-full ${s.dot}`} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <Link href={href} className="flex-1 min-w-0">
                <h4 className={`text-white font-medium group-hover:text-palantir-200 transition-colors ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'}`}>
                  {page.pinned && <span className="text-amber-400 mr-1.5 text-[10px]">📌</span>}
                  {page.title}
                </h4>
              </Link>
            </div>

            {!compact && (page.aiSummary || page.excerpt) && (
              <p className="text-night-400 text-xs leading-relaxed line-clamp-2 mb-2">
                {page.aiSummary || page.excerpt}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${s.badge}`}>
                {page.category}
              </span>
              {page.subCategory && (
                <button onClick={() => setFilterSub(page.subCategory!)}
                  className="text-[10px] text-night-500 hover:text-night-300 font-mono transition-colors">
                  {page.subCategory}
                </button>
              )}
              {page.tags.slice(0, compact ? 0 : 3).map(tag => (
                <button key={tag} onClick={() => setFilterTag(tag)}
                  className="text-[10px] text-night-600 hover:text-night-400 font-mono transition-colors">
                  #{tag}
                </button>
              ))}
              <span className="text-night-700 text-xs ml-auto shrink-0">{fmtDate(page.createdAt)}</span>
            </div>
          </div>

          {/* Action buttons — visible on hover */}
          <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handlePin(page)}
              title={page.pinned ? 'Unpin' : 'Pin to top'}
              className={`p-1.5 rounded-lg border transition-all text-xs ${
                page.pinned
                  ? 'bg-amber-900/30 border-amber-700/40 text-amber-400 hover:bg-amber-800/40'
                  : 'bg-night-800 border-night-700 text-night-500 hover:text-amber-400 hover:border-amber-700/40'
              }`}>
              📌
            </button>
            <button onClick={() => setEditPage(page)}
              title="Edit"
              className="p-1.5 rounded-lg bg-night-800 border border-night-700 text-night-400 hover:text-palantir-300 hover:border-palantir-700/40 transition-all text-xs">
              ✎
            </button>
            <button onClick={() => setDeletePage(page)}
              title="Delete"
              className="p-1.5 rounded-lg bg-night-800 border border-night-700 text-night-500 hover:text-red-400 hover:border-red-700/40 transition-all text-xs">
              ✕
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-night-800 bg-night-950/60 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xl">◰</span>
              <div>
                <h1 className="text-white font-bold text-lg leading-none">Archive</h1>
                <p className="text-night-500 text-xs mt-0.5">
                  {loading ? '…' : `${pages.length} pages`}
                  {hasFilters && <> · <button onClick={clearFilters} className="text-palantir-400 hover:underline">clear filters</button></>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="px-2.5 py-1.5 bg-night-800 border border-night-700 rounded-lg text-xs text-night-300 focus:outline-none focus:border-palantir-500">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {/* View toggle */}
              <div className="flex gap-0.5 p-0.5 bg-night-800 border border-night-700 rounded-lg">
                {(['list', 'grid'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-2 py-1 rounded text-xs transition-all ${view === v ? 'bg-night-700 text-white' : 'text-night-500 hover:text-white'}`}>
                    {v === 'list' ? '☰' : '⊞'}
                  </button>
                ))}
              </div>
              <Link href="/notes"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-palantir-700 hover:bg-palantir-600 text-white rounded-lg text-xs font-medium transition-all">
                + Add Note
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Search bar ─────────────────────────────────────────────────── */}
        <div className="relative mb-6">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search titles, content, summaries, sub-categories…"
            className="w-full pl-9 pr-4 py-3 bg-night-900 border border-night-700 rounded-xl text-white placeholder-night-500 text-sm focus:outline-none focus:border-palantir-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-night-500 hover:text-white text-xs">✕</button>
          )}
        </div>

        <div className="flex gap-6">
          {/* ── Left Sidebar ─────────────────────────────────────────────── */}
          <aside className="w-52 shrink-0 space-y-5">
            {/* Category filter */}
            <div>
              <div className="text-night-500 text-[10px] font-mono uppercase tracking-widest mb-2 px-1">Category</div>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setFilterCat(''); setFilterSub('') }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    !filterCat ? 'bg-night-800 text-white border border-night-700' : 'text-night-400 hover:text-white hover:bg-night-800/50'
                  }`}>
                  <span>All</span>
                  <span className="text-night-600 font-mono text-[10px]">{Object.values(catCounts).reduce((a, b) => a + b, 0)}</span>
                </button>
                {CATEGORIES.map(cat => {
                  const s = CAT_STYLE[cat]
                  return (
                    <button key={cat}
                      onClick={() => { setFilterCat(cat); setFilterSub('') }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                        filterCat === cat ? 'bg-night-800 border border-night-700 ' + s.sidebar : 'text-night-400 hover:text-white hover:bg-night-800/50'
                      }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {cat}
                      </div>
                      <span className="text-night-600 font-mono text-[10px]">{catCounts[cat] || 0}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sub-category index */}
            {(filterCat || subCounts.length > 0) && (
              <div>
                <div className="text-night-500 text-[10px] font-mono uppercase tracking-widest mb-2 px-1">Sub-category</div>
                <div className="space-y-0.5 max-h-56 overflow-y-auto">
                  {(filterCat ? (SUBCATS[filterCat] || []).map(s => ({ subCategory: s, count: subCounts.find(x => x.subCategory === s)?.count || 0 })) : subCounts)
                    .filter(x => x.count > 0 || filterCat)
                    .map(({ subCategory: sub, count }) => (
                      <button key={sub}
                        onClick={() => setFilterSub(filterSub === sub ? '' : sub)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-[11px] transition-all ${
                          filterSub === sub ? 'bg-night-800 text-palantir-300 border border-night-700' : 'text-night-500 hover:text-night-200 hover:bg-night-800/30'
                        }`}>
                        <span className="truncate text-left">{sub}</span>
                        {count > 0 && <span className="text-night-700 font-mono text-[9px] ml-1 shrink-0">{count}</span>}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Tag cloud */}
            {allTags.length > 0 && (
              <div>
                <div className="text-night-500 text-[10px] font-mono uppercase tracking-widest mb-2 px-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {allTags.slice(0, 30).map(tag => (
                    <button key={tag} onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-mono transition-all ${
                        filterTag === tag
                          ? 'bg-palantir-800/40 border-palantir-600/50 text-palantir-300'
                          : 'bg-night-800 border-night-700 text-night-500 hover:text-night-200 hover:border-night-600'
                      }`}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Source type */}
            <div>
              <div className="text-night-500 text-[10px] font-mono uppercase tracking-widest mb-2 px-1">Sources</div>
              <div className="space-y-1 text-xs text-night-500">
                {['NOTE', 'UPLOAD', 'SCRAPER'].map(type => {
                  const count = pages.filter(p => p.sourceType === type).length
                  return count > 0 ? (
                    <div key={type} className="flex justify-between px-3">
                      <span className="font-mono">{type}</span>
                      <span className="text-night-700">{count}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </aside>

          {/* ── Main Content ─────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Active filter chips */}
            {(filterCat || filterSub || filterTag || activeSearch) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filterCat && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-night-800 border border-night-700 text-night-300 text-xs rounded-full">
                    {filterCat}
                    <button onClick={() => setFilterCat('')} className="text-night-500 hover:text-white ml-0.5">✕</button>
                  </span>
                )}
                {filterSub && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-night-800 border border-night-700 text-night-300 text-xs rounded-full">
                    {filterSub}
                    <button onClick={() => setFilterSub('')} className="text-night-500 hover:text-white ml-0.5">✕</button>
                  </span>
                )}
                {filterTag && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-night-800 border border-night-700 text-night-300 text-xs rounded-full">
                    #{filterTag}
                    <button onClick={() => setFilterTag('')} className="text-night-500 hover:text-white ml-0.5">✕</button>
                  </span>
                )}
                {activeSearch && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-night-800 border border-night-700 text-night-300 text-xs rounded-full">
                    &ldquo;{activeSearch}&rdquo;
                    <button onClick={() => { setSearch(''); setActiveSearch('') }} className="text-night-500 hover:text-white ml-0.5">✕</button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="py-24 text-center">
                <div className="text-4xl mb-4 animate-spin inline-block">⟳</div>
                <div className="text-night-500 text-sm">Loading knowledge pages…</div>
              </div>
            ) : displayPages.length === 0 ? (
              <div className="py-24 text-center">
                <div className="text-4xl mb-4 text-night-600">◰</div>
                <div className="text-night-400 text-sm mb-2">{hasFilters ? 'No pages match your filters' : 'No knowledge pages yet'}</div>
                {hasFilters
                  ? <button onClick={clearFilters} className="text-palantir-400 text-xs hover:underline">Clear all filters</button>
                  : <Link href="/notes" className="text-palantir-400 text-sm hover:underline">Add your first note →</Link>
                }
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayPages.map(page => <PageCard key={page.id} page={page} />)}
              </div>
            ) : (
              /* Grouped list view */
              (sort === 'date-desc' || sort === 'date-asc')
                ? Object.entries(groupedByMonth).map(([month, monthPages]) => (
                    <section key={month} className="mb-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-white font-semibold text-sm font-mono">{month}</h2>
                        <div className="flex-1 h-px bg-night-800" />
                        <span className="text-night-600 text-xs">{monthPages.length}</span>
                      </div>
                      <div className="space-y-2">
                        {monthPages.map(page => <PageCard key={page.id} page={page} />)}
                      </div>
                    </section>
                  ))
                : (
                    <div className="space-y-2">
                      {displayPages.map(page => <PageCard key={page.id} page={page} />)}
                    </div>
                  )
            )}

            {/* Results count footer */}
            {!loading && displayPages.length > 0 && (
              <div className="text-center mt-8 text-night-700 text-xs font-mono">
                {displayPages.length} {displayPages.length === 1 ? 'page' : 'pages'}
                {hasFilters ? ' matching filters' : ' total'}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {editPage   && <EditPanel   page={editPage}   onSave={handleEdit}   onClose={() => setEditPage(null)} />}
      {deletePage && <DeleteModal page={deletePage} onConfirm={handleDelete} onCancel={() => setDeletePage(null)} />}

      {/* Slide animation */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.2s ease-out; }
      `}</style>
    </div>
  )
}

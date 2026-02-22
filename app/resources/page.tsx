// app/resources/page.tsx — Curated Learning Resources
import { prisma } from '@/lib/db'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Curated Palantir learning resources — official docs, SDKs, GitHub repos, YouTube, and community links.',
}

const RESOURCE_ICONS: Record<string, string> = {
  DOCUMENTATION: '◫', SDK: '⬡', GITHUB: '◈', YOUTUBE: '▶', ARTICLE: '◉', COURSE: '◇', COMMUNITY: '◎', TOOL: '⚙',
}

const TYPE_LABELS: Record<string, string> = {
  DOCUMENTATION: 'Docs', SDK: 'SDK', GITHUB: 'GitHub', YOUTUBE: 'YouTube',
  ARTICLE: 'Article', COURSE: 'Course', COMMUNITY: 'Community', TOOL: 'Tool',
}

const CAT_TABS = ['ALL', 'FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO', 'GENERAL']
const CAT_COLORS: Record<string, string> = {
  FOUNDRY: 'text-blue-400', ONTOLOGY: 'text-violet-400', AIP: 'text-cyan-400',
  APOLLO: 'text-emerald-400', GENERAL: 'text-night-300', ALL: 'text-palantir-400',
}

interface SearchParams { category?: string; type?: string }

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params  = await searchParams
  const catFilter  = params.category
  const typeFilter = params.type

  const resources = await prisma.resource.findMany({
    where: {
      ...(catFilter && catFilter !== 'ALL' ? { category: catFilter as 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL' | 'NEWS' | 'RESOURCES' } : {}),
      ...(typeFilter ? { resourceType: typeFilter as 'DOCUMENTATION' | 'SDK' | 'GITHUB' | 'YOUTUBE' | 'ARTICLE' | 'COURSE' | 'COMMUNITY' | 'TOOL' } : {}),
    },
    orderBy: [{ isPinned: 'desc' }, { isOfficial: 'desc' }, { createdAt: 'desc' }],
  })

  const pinned   = resources.filter((r) => r.isPinned)
  const official = resources.filter((r) => r.isOfficial && !r.isPinned)
  const community = resources.filter((r) => !r.isOfficial && !r.isPinned)

  const totalByType = resources.reduce((acc, r) => {
    acc[r.resourceType] = (acc[r.resourceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-night-800">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">◫</span>
          <h1 className="text-3xl font-bold text-white">Resources</h1>
          <span className="px-2 py-0.5 bg-teal-900/40 text-teal-300 border border-teal-700/40 rounded text-xs font-mono">
            {resources.length} links
          </span>
        </div>
        <p className="text-night-400 text-sm">
          Curated reference materials for mastering the Palantir stack — official docs, open-source SDKs,
          GitHub repos, YouTube content, and community resources.
        </p>
      </div>

      {/* Type stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(totalByType).map(([type, count]) => (
          <a
            key={type}
            href={`/resources?type=${type}${catFilter ? `&category=${catFilter}` : ''}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${typeFilter === type ? 'bg-teal-900/30 border-teal-700/50 text-teal-200' : 'bg-night-800 border-night-700 text-night-400 hover:text-white'}`}
          >
            <span>{RESOURCE_ICONS[type]}</span>
            {TYPE_LABELS[type]} ({count})
          </a>
        ))}
        {(catFilter || typeFilter) && (
          <a href="/resources" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs bg-night-800 border-night-700 text-red-400 hover:text-red-300 transition-all">
            ✕ Clear filters
          </a>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CAT_TABS.map((cat) => (
          <a
            key={cat}
            href={`/resources${cat !== 'ALL' ? `?category=${cat}` : ''}${typeFilter ? `${cat !== 'ALL' ? '&' : '?'}type=${typeFilter}` : ''}`}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
              (catFilter === cat) || (cat === 'ALL' && !catFilter)
                ? 'bg-night-700 border-night-600 text-white'
                : 'bg-night-800 border-night-700 text-night-400 hover:text-white'
            }`}
          >
            <span className={CAT_COLORS[cat]}>{cat}</span>
          </a>
        ))}
      </div>

      {/* Pinned / Essential Resources */}
      {pinned.length > 0 && !catFilter && !typeFilter && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📌</span> Essential Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinned.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                className="group flex gap-3 p-4 bg-palantir-950/30 border border-palantir-700/40 hover:border-palantir-600/60 rounded-xl transition-all"
              >
                <div className={`text-xl mt-0.5 shrink-0 ${CAT_COLORS[r.category] || 'text-night-400'}`}>
                  {RESOURCE_ICONS[r.resourceType]}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold group-hover:text-palantir-200 transition-colors">{r.title}</div>
                  <div className="text-night-400 text-xs mt-1 line-clamp-2">{r.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-mono ${CAT_COLORS[r.category]}`}>{r.category}</span>
                    <span className="text-night-600 text-[10px]">· {TYPE_LABELS[r.resourceType]}</span>
                    {r.isOfficial && <span className="text-[10px] text-green-500">· Official</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Official Resources */}
      {official.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">◎</span> Official Palantir Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {official.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                className="group flex gap-3 p-4 bg-night-900 border border-night-700 hover:border-green-700/40 rounded-xl transition-all"
              >
                <div className={`text-lg mt-0.5 shrink-0 ${CAT_COLORS[r.category] || 'text-night-400'}`}>
                  {RESOURCE_ICONS[r.resourceType]}
                </div>
                <div>
                  <div className="text-white text-sm font-medium group-hover:text-green-200 transition-colors">{r.title}</div>
                  <div className="text-night-400 text-xs mt-1 line-clamp-2">{r.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-mono ${CAT_COLORS[r.category]}`}>{r.category}</span>
                    <span className="text-night-600 text-[10px]">· {TYPE_LABELS[r.resourceType]}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Community Resources */}
      {community.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-orange-400">◉</span> Community Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {community.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                className="group flex gap-3 p-4 bg-night-900 border border-night-700 hover:border-orange-700/40 rounded-xl transition-all"
              >
                <div className={`text-lg mt-0.5 shrink-0 ${CAT_COLORS[r.category] || 'text-night-400'}`}>
                  {RESOURCE_ICONS[r.resourceType]}
                </div>
                <div>
                  <div className="text-white text-sm font-medium group-hover:text-orange-200 transition-colors">{r.title}</div>
                  <div className="text-night-400 text-xs mt-1 line-clamp-2">{r.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-mono ${CAT_COLORS[r.category]}`}>{r.category}</span>
                    <span className="text-night-600 text-[10px]">· {TYPE_LABELS[r.resourceType]}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {resources.length === 0 && (
        <div className="text-center py-16 text-night-500">
          <p className="mb-2">No resources match your filter.</p>
          <a href="/resources" className="text-teal-400 text-sm hover:underline">Clear filters</a>
        </div>
      )}
    </div>
  )
}

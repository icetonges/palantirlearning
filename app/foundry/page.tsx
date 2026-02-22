// app/foundry/page.tsx
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Metadata } from 'next'
import { formatDate, truncate } from '@/lib/utils'
import { SUBCATEGORIES } from '@/lib/navigation'
import KnowledgeSidebar from '@/components/KnowledgeSidebar'

export const metadata: Metadata = {
  title:       'Foundry',
  description: 'Palantir Foundry knowledge hub — transforms, datasets, Workshop, Contour, ML, and more.',
}

export default async function FoundryPage() {
  const pages = await prisma.knowledgePage.findMany({
    where:   { category: 'FOUNDRY' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, slug: true, title: true, excerpt: true, aiSummary: true, subCategory: true, tags: true, sourceType: true, pinned: true, createdAt: true },
  })

  const pinned   = pages.filter((p) => p.pinned)
  const recent   = pages.slice(0, 5)
  const subCats  = SUBCATEGORIES.FOUNDRY

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-night-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⬡</span>
            <h1 className="text-3xl font-bold text-white">Foundry</h1>
            <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 border border-blue-700/40 rounded text-xs font-mono">
              {pages.length} pages
            </span>
          </div>
          <p className="text-night-400 text-sm max-w-2xl">
            Data integration, transforms, datasets, Workshop, Contour, ML pipelines, and all things Foundry.
            Your complete reference for the Palantir Foundry data platform.
          </p>
        </div>
        <Link
          href="/notes?category=FOUNDRY"
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-800/30 hover:bg-blue-700/30 border border-blue-700/50 text-blue-300 rounded-lg text-sm transition-all"
        >
          + Add Note
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <KnowledgeSidebar
          pages={pages}
          basePath="/foundry"
          category="FOUNDRY"
          color="text-blue-400"
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* Sub-categories */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">⬡</span> Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {subCats.map((cat) => {
                const count = pages.filter((p) => p.subCategory === cat).length
                return (
                  <span
                    key={cat}
                    className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                      count > 0
                        ? 'bg-blue-900/30 border-blue-700/50 text-blue-200'
                        : 'bg-night-800/50 border-night-700 text-night-500'
                    }`}
                  >
                    {cat}
                    {count > 0 && (
                      <span className="ml-2 text-xs text-blue-400 font-mono">{count}</span>
                    )}
                  </span>
                )
              })}
            </div>
          </section>

          {/* Pinned pages */}
          {pinned.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>📌</span> Pinned
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinned.map((page) => (
                  <Link
                    key={page.id}
                    href={`/foundry/${page.slug}`}
                    className="group p-4 bg-blue-950/20 border border-blue-800/40 hover:border-blue-600/60 rounded-xl transition-all"
                  >
                    <h3 className="text-white text-sm font-semibold mb-1 group-hover:text-blue-200 transition-colors">
                      {page.title}
                    </h3>
                    {page.excerpt && (
                      <p className="text-night-400 text-xs line-clamp-2">{page.excerpt}</p>
                    )}
                    <div className="text-night-600 text-xs mt-2">{formatDate(page.createdAt)}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent pages */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">⬡</span> Recent Pages
            </h2>
            {recent.length > 0 ? (
              <div className="space-y-3">
                {recent.map((page) => (
                  <Link
                    key={page.id}
                    href={`/foundry/${page.slug}`}
                    className="group flex gap-4 p-4 bg-night-900 border border-night-700 hover:border-blue-700/40 rounded-xl transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {page.subCategory && (
                          <span className="text-xs text-blue-400 font-mono">{page.subCategory}</span>
                        )}
                        <span className="text-xs text-night-600 font-mono">{page.sourceType}</span>
                      </div>
                      <h3 className="text-white text-sm font-semibold mb-1 group-hover:text-blue-200 transition-colors line-clamp-1">
                        {page.title}
                      </h3>
                      {page.excerpt && (
                        <p className="text-night-400 text-xs line-clamp-2">{page.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {page.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] text-night-500 bg-night-800 px-1.5 py-0.5 rounded font-mono">
                            {tag}
                          </span>
                        ))}
                        <span className="text-night-600 text-xs ml-auto">{formatDate(page.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {pages.length > 5 && (
                  <p className="text-night-500 text-xs text-center pt-2">
                    + {pages.length - 5} more pages — use the sidebar to browse all
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-night-500">
                <p className="mb-3">No Foundry pages yet.</p>
                <Link href="/notes?category=FOUNDRY" className="text-blue-400 text-sm hover:underline">
                  Add your first Foundry note →
                </Link>
              </div>
            )}
          </section>

          {/* Official Resources */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Official Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Foundry Documentation', url: 'https://www.palantir.com/docs/foundry/', desc: 'Complete official docs' },
                { title: 'Transforms Reference', url: 'https://www.palantir.com/docs/foundry/transforms-python/overview/', desc: 'Python & PySpark transforms' },
                { title: 'Workshop App Builder', url: 'https://www.palantir.com/docs/foundry/workshop/overview/', desc: 'Operational apps' },
                { title: 'Blueprint UI Library', url: 'https://blueprintjs.com/', desc: 'React components for Foundry' },
              ].map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 bg-night-800/50 hover:bg-night-800 border border-night-700 hover:border-blue-700/40 rounded-lg transition-all group"
                >
                  <span className="text-blue-400 text-base mt-0.5">◫</span>
                  <div>
                    <div className="text-white text-sm font-medium group-hover:text-blue-200 transition-colors">{r.title}</div>
                    <div className="text-night-500 text-xs mt-0.5">{r.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

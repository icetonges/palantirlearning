// app/ontology/page.tsx
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { SUBCATEGORIES } from '@/lib/navigation'
import KnowledgeSidebar from '@/components/KnowledgeSidebar'

export const metadata: Metadata = {
  title: 'Ontology',
  description: 'Palantir Ontology knowledge hub — object types, link types, actions, OSDK, and semantic data layer.',
}

export default async function OntologyPage() {
  const pages = await prisma.knowledgePage.findMany({
    where:   { category: 'ONTOLOGY' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, slug: true, title: true, excerpt: true, subCategory: true, tags: true, sourceType: true, pinned: true, createdAt: true },
  })
  const recent  = pages.slice(0, 5)
  const subCats = SUBCATEGORIES.ONTOLOGY

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-night-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">◈</span>
            <h1 className="text-3xl font-bold text-white">Ontology</h1>
            <span className="px-2 py-0.5 bg-violet-900/40 text-violet-300 border border-violet-700/40 rounded text-xs font-mono">{pages.length} pages</span>
          </div>
          <p className="text-night-400 text-sm max-w-2xl">Object types, link types, actions, OSDK (TypeScript & Python), time series, and the Palantir semantic data layer.</p>
        </div>
        <Link href="/notes?category=ONTOLOGY" className="shrink-0 flex items-center gap-2 px-4 py-2 bg-violet-800/30 hover:bg-violet-700/30 border border-violet-700/50 text-violet-300 rounded-lg text-sm transition-all">+ Add Note</Link>
      </div>
      <div className="flex gap-6">
        <KnowledgeSidebar pages={pages} basePath="/ontology" category="ONTOLOGY" color="text-violet-400" />
        <div className="flex-1 min-w-0 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><span className="text-violet-400">◈</span> Topics</h2>
            <div className="flex flex-wrap gap-2">
              {subCats.map((cat) => {
                const count = pages.filter((p) => p.subCategory === cat).length
                return (
                  <span key={cat} className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${count > 0 ? 'bg-violet-900/30 border-violet-700/50 text-violet-200' : 'bg-night-800/50 border-night-700 text-night-500'}`}>
                    {cat}{count > 0 && <span className="ml-2 text-xs text-violet-400 font-mono">{count}</span>}
                  </span>
                )
              })}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Recent Pages</h2>
            {recent.length > 0 ? (
              <div className="space-y-3">
                {recent.map((page) => (
                  <Link key={page.id} href={`/ontology/${page.slug}`} className="group flex gap-4 p-4 bg-night-900 border border-night-700 hover:border-violet-700/40 rounded-xl transition-all">
                    <div className="flex-1 min-w-0">
                      {page.subCategory && <div className="text-xs text-violet-400 font-mono mb-1">{page.subCategory}</div>}
                      <h3 className="text-white text-sm font-semibold mb-1 group-hover:text-violet-200 transition-colors">{page.title}</h3>
                      {page.excerpt && <p className="text-night-400 text-xs line-clamp-2">{page.excerpt}</p>}
                      <div className="text-night-600 text-xs mt-2">{formatDate(page.createdAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-night-500">
                <p className="mb-3">No Ontology pages yet.</p>
                <Link href="/notes?category=ONTOLOGY" className="text-violet-400 text-sm hover:underline">Add your first Ontology note →</Link>
              </div>
            )}
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Key Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Ontology Overview', url: 'https://www.palantir.com/docs/foundry/ontology/overview/', desc: 'Core concepts' },
                { title: 'OSDK TypeScript', url: 'https://www.palantir.com/docs/foundry/ontology-sdk/overview/', desc: 'TypeScript client' },
                { title: 'OSDK Python', url: 'https://www.palantir.com/docs/foundry/osdk-python/', desc: 'Python client' },
                { title: 'palantir/osdk-ts', url: 'https://github.com/palantir/osdk-ts', desc: 'Open-source GitHub repo' },
              ].map((r) => (
                <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 bg-night-800/50 hover:bg-night-800 border border-night-700 hover:border-violet-700/40 rounded-lg transition-all group">
                  <span className="text-violet-400 text-base mt-0.5">◫</span>
                  <div>
                    <div className="text-white text-sm font-medium group-hover:text-violet-200 transition-colors">{r.title}</div>
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

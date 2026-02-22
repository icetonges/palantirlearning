// app/aip/page.tsx
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { SUBCATEGORIES } from '@/lib/navigation'
import KnowledgeSidebar from '@/components/KnowledgeSidebar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AIP — AI Platform',
  description: 'Palantir AIP knowledge hub — Logic functions, Copilot, Studio, Function Repository, and LLM integration.',
}

export default async function AIPPage() {
  const pages = await prisma.knowledgePage.findMany({
    where:   { category: 'AIP' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, slug: true, title: true, excerpt: true, subCategory: true, tags: true, sourceType: true, pinned: true, createdAt: true },
  })
  const recent  = pages.slice(0, 5)
  const subCats = SUBCATEGORIES.AIP

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-night-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">✦</span>
            <h1 className="text-3xl font-bold text-white">AIP</h1>
            <span className="px-2 py-0.5 bg-cyan-900/40 text-cyan-300 border border-cyan-700/40 rounded text-xs font-mono">{pages.length} pages</span>
            <span className="px-2 py-0.5 bg-palantir-800/50 text-palantir-300 border border-palantir-700/40 rounded text-xs font-mono">AI Platform</span>
          </div>
          <p className="text-night-400 text-sm max-w-2xl">AI Platform — Logic functions, Copilot, AIP Studio agents, Function Repository, LLM configuration, and production AI deployment on Foundry.</p>
        </div>
        <Link href="/notes?category=AIP" className="shrink-0 flex items-center gap-2 px-4 py-2 bg-cyan-800/30 hover:bg-cyan-700/30 border border-cyan-700/50 text-cyan-300 rounded-lg text-sm transition-all">+ Add Note</Link>
      </div>
      <div className="flex gap-6">
        <KnowledgeSidebar pages={pages} basePath="/aip" category="AIP" color="text-cyan-400" />
        <div className="flex-1 min-w-0 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><span className="text-cyan-400">✦</span> Topics</h2>
            <div className="flex flex-wrap gap-2">
              {subCats.map((cat) => {
                const count = pages.filter((p) => p.subCategory === cat).length
                return (
                  <span key={cat} className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${count > 0 ? 'bg-cyan-900/30 border-cyan-700/50 text-cyan-200' : 'bg-night-800/50 border-night-700 text-night-500'}`}>
                    {cat}{count > 0 && <span className="ml-2 text-xs text-cyan-400 font-mono">{count}</span>}
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
                  <Link key={page.id} href={`/aip/${page.slug}`} className="group flex gap-4 p-4 bg-night-900 border border-night-700 hover:border-cyan-700/40 rounded-xl transition-all">
                    <div className="flex-1 min-w-0">
                      {page.subCategory && <div className="text-xs text-cyan-400 font-mono mb-1">{page.subCategory}</div>}
                      <h3 className="text-white text-sm font-semibold mb-1 group-hover:text-cyan-200 transition-colors">{page.title}</h3>
                      {page.excerpt && <p className="text-night-400 text-xs line-clamp-2">{page.excerpt}</p>}
                      <div className="text-night-600 text-xs mt-2">{formatDate(page.createdAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-night-500">
                <Link href="/notes?category=AIP" className="text-cyan-400 text-sm hover:underline">Add your first AIP note →</Link>
              </div>
            )}
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Key AIP Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'AIP Documentation', url: 'https://www.palantir.com/docs/foundry/aip/overview/', desc: 'Complete AIP reference' },
                { title: 'AIP Logic', url: 'https://www.palantir.com/docs/foundry/aip/logic/', desc: 'LLM function authoring' },
                { title: 'AIP Copilot', url: 'https://www.palantir.com/docs/foundry/aip/copilot/', desc: 'AI assistant for Workshop' },
                { title: 'AIP Studio', url: 'https://www.palantir.com/docs/foundry/aip/studio/', desc: 'Visual agent builder' },
              ].map((r) => (
                <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 bg-night-800/50 hover:bg-night-800 border border-night-700 hover:border-cyan-700/40 rounded-lg transition-all group">
                  <span className="text-cyan-400 text-base mt-0.5">✦</span>
                  <div>
                    <div className="text-white text-sm font-medium group-hover:text-cyan-200 transition-colors">{r.title}</div>
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

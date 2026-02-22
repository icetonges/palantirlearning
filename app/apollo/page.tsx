// app/apollo/page.tsx
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Metadata } from 'next'
import { formatDate } from '@/lib/utils'
import { SUBCATEGORIES } from '@/lib/navigation'
import KnowledgeSidebar from '@/components/KnowledgeSidebar'

export const metadata: Metadata = {
  title: 'Apollo',
  description: 'Palantir Apollo knowledge hub — software distribution, fleet management, and air-gapped deployments.',
}

export default async function ApolloPage() {
  const pages = await prisma.knowledgePage.findMany({
    where: { category: 'APOLLO' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, slug: true, title: true, excerpt: true, subCategory: true, tags: true, sourceType: true, pinned: true, createdAt: true },
  })
  const recent  = pages.slice(0, 5)
  const subCats = SUBCATEGORIES.APOLLO

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-night-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⊙</span>
            <h1 className="text-3xl font-bold text-white">Apollo</h1>
            <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 rounded text-xs font-mono">{pages.length} pages</span>
          </div>
          <p className="text-night-400 text-sm max-w-2xl">Software distribution, fleet management, air-gapped deployments, configuration policies, and Apollo CLI. Common in DoD and government contexts.</p>
        </div>
        <Link href="/notes?category=APOLLO" className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-800/30 hover:bg-emerald-700/30 border border-emerald-700/50 text-emerald-300 rounded-lg text-sm transition-all">+ Add Note</Link>
      </div>
      <div className="flex gap-6">
        <KnowledgeSidebar pages={pages} basePath="/apollo" category="APOLLO" color="text-emerald-400" />
        <div className="flex-1 min-w-0 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><span className="text-emerald-400">⊙</span> Topics</h2>
            <div className="flex flex-wrap gap-2">
              {subCats.map((cat) => {
                const count = pages.filter((p) => p.subCategory === cat).length
                return (
                  <span key={cat} className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${count > 0 ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-night-800/50 border-night-700 text-night-500'}`}>
                    {cat}{count > 0 && <span className="ml-2 text-xs text-emerald-400 font-mono">{count}</span>}
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
                  <Link key={page.id} href={`/apollo/${page.slug}`} className="group flex gap-4 p-4 bg-night-900 border border-night-700 hover:border-emerald-700/40 rounded-xl transition-all">
                    <div className="flex-1 min-w-0">
                      {page.subCategory && <div className="text-xs text-emerald-400 font-mono mb-1">{page.subCategory}</div>}
                      <h3 className="text-white text-sm font-semibold mb-1 group-hover:text-emerald-200 transition-colors">{page.title}</h3>
                      {page.excerpt && <p className="text-night-400 text-xs line-clamp-2">{page.excerpt}</p>}
                      <div className="text-night-600 text-xs mt-2">{formatDate(page.createdAt)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-night-500">
                <Link href="/notes?category=APOLLO" className="text-emerald-400 text-sm hover:underline">Add your first Apollo note →</Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

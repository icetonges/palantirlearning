// app/foundry/[slug]/page.tsx — Dynamic Foundry knowledge page
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import DocumentRenderer from '@/components/DocumentRenderer'
import { formatDate } from '@/lib/utils'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.knowledgePage.findUnique({ where: { slug }, select: { title: true, excerpt: true } })
  if (!page) return { title: 'Not Found' }
  return { title: page.title, description: page.excerpt || undefined }
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const pages = await prisma.knowledgePage.findMany({
      where:  { category: 'FOUNDRY' },
      select: { slug: true },
    })
    return pages.map((p) => ({ slug: p.slug }))
  } catch {
    // DB not yet migrated (build time) — pages will be rendered on demand
    return []
  }
}

export default async function FoundrySubPage({ params }: Props) {
  const { slug } = await params

  const [page, relatedPages] = await Promise.all([
    prisma.knowledgePage.findUnique({
      where: { slug },
      include: { flashcards: { select: { id: true } } },
    }),
    prisma.knowledgePage.findMany({
      where:   { category: 'FOUNDRY', NOT: { slug } },
      orderBy: { createdAt: 'desc' },
      take:    4,
      select:  { id: true, slug: true, title: true, subCategory: true, createdAt: true },
    }),
  ])

  if (!page || page.category !== 'FOUNDRY') notFound()

  // Increment view count
  await prisma.knowledgePage.update({
    where: { id: page.id },
    data:  { viewCount: { increment: 1 } },
  })

  const SOURCE_LABELS: Record<string, string> = {
    NOTE:    'Note',
    UPLOAD:  'Upload',
    SCRAPED: 'Scraped',
    SEEDED:  'Official',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-night-500 mb-6">
        <Link href="/" className="hover:text-night-300 transition-colors">Home</Link>
        <span>›</span>
        <Link href="/foundry" className="hover:text-blue-400 transition-colors text-blue-500">Foundry</Link>
        <span>›</span>
        <span className="text-night-300 truncate">{page.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* Article */}
        <article className="flex-1 min-w-0">
          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-700/40 rounded font-mono">
              FOUNDRY
            </span>
            {page.subCategory && (
              <span className="text-xs px-2 py-1 bg-night-800 text-night-300 border border-night-700 rounded">
                {page.subCategory}
              </span>
            )}
            <span className="text-xs px-2 py-1 bg-night-800 text-night-400 border border-night-700 rounded font-mono">
              {SOURCE_LABELS[page.sourceType] || page.sourceType}
            </span>
            <span className="text-night-600 text-xs ml-auto">{formatDate(page.createdAt)}</span>
            <span className="text-night-600 text-xs">{page.viewCount} views</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{page.title}</h1>

          {/* Tags */}
          {page.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {page.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-night-800 text-night-400 rounded font-mono border border-night-700">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* AI Summary callout */}
          {page.aiSummary && (
            <div className="bg-palantir-950/40 border border-palantir-700/40 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-palantir-400 text-xs font-mono">✦ AI SUMMARY</span>
              </div>
              <p className="text-night-200 text-sm leading-relaxed">{page.aiSummary}</p>
            </div>
          )}

          {/* Main content */}
          <div className="bg-night-950 rounded-2xl p-4 sm:p-8 -mx-2 sm:mx-0">
        <DocumentRenderer content={page.content} />
      </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-night-800">
            <Link
              href={`/study?generateFrom=${page.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-rose-900/20 hover:bg-rose-800/30 border border-rose-700/40 text-rose-300 rounded-lg text-sm transition-all"
            >
              ◇ Generate Flashcards ({page.flashcards.length} existing)
            </Link>
            <Link
              href={`/notes?edit=${page.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 rounded-lg text-sm transition-all"
            >
              ✎ Edit
            </Link>
            <Link
              href="/notes?category=FOUNDRY"
              className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 hover:bg-blue-800/30 border border-blue-700/40 text-blue-300 rounded-lg text-sm transition-all"
            >
              + Add Related Note
            </Link>
          </div>
        </article>

        {/* Right sidebar */}
        <aside className="hidden xl:block w-64 shrink-0 space-y-6">
          {/* Related pages */}
          <div>
            <h3 className="text-night-300 text-xs font-mono uppercase tracking-wider mb-3">Related Pages</h3>
            <div className="space-y-2">
              {relatedPages.map((p) => (
                <Link
                  key={p.id}
                  href={`/foundry/${p.slug}`}
                  className="block p-3 bg-night-900 border border-night-800 hover:border-blue-700/40 rounded-lg transition-all group"
                >
                  <div className="text-white text-xs font-medium line-clamp-2 group-hover:text-blue-200 transition-colors">
                    {p.title}
                  </div>
                  {p.subCategory && (
                    <div className="text-blue-400 text-[10px] mt-1 font-mono">{p.subCategory}</div>
                  )}
                  <div className="text-night-600 text-[10px] mt-1">{formatDate(p.createdAt)}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-night-300 text-xs font-mono uppercase tracking-wider mb-3">Quick Links</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Foundry Docs', url: 'https://www.palantir.com/docs/foundry/' },
                { label: 'Transforms Ref', url: 'https://www.palantir.com/docs/foundry/transforms-python/overview/' },
                { label: 'Blueprint UI', url: 'https://blueprintjs.com/' },
              ].map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-night-400 hover:text-blue-400 transition-colors py-1"
                >
                  <span>◫</span> {link.label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

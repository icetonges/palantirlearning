// app/aip/[slug]/page.tsx
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import DocumentRenderer from '@/components/DocumentRenderer'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.knowledgePage.findUnique({ where: { slug }, select: { title: true, excerpt: true } })
  if (!page) return { title: 'Not Found' }
  return { title: page.title, description: page.excerpt || undefined }
}

export default async function AIPSubPage({ params }: Props) {
  const { slug } = await params
  const page = await prisma.knowledgePage.findUnique({ where: { slug }, include: { flashcards: { select: { id: true } } } })
  if (!page || page.category !== 'AIP') notFound()
  await prisma.knowledgePage.update({ where: { id: page.id }, data: { viewCount: { increment: 1 } } })
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-night-500 mb-6">
        <Link href="/" className="hover:text-night-300">Home</Link>
        <span>›</span>
        <Link href="/aip" className="hover:text-cyan-400 text-cyan-500">AIP</Link>
        <span>›</span>
        <span className="text-night-300">{page.title}</span>
      </nav>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs px-2 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-700/40 rounded font-mono">AIP</span>
        {page.subCategory && <span className="text-xs px-2 py-1 bg-night-800 text-night-300 border border-night-700 rounded">{page.subCategory}</span>}
        <span className="text-night-600 text-xs ml-auto">{formatDate(page.createdAt)}</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">{page.title}</h1>
      {page.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {page.tags.map((tag) => <span key={tag} className="text-xs px-2 py-0.5 bg-night-800 text-night-400 rounded font-mono border border-night-700">#{tag}</span>)}
        </div>
      )}
      {page.aiSummary && (
        <div className="bg-palantir-950/40 border border-palantir-700/40 rounded-xl p-4 mb-6">
          <div className="text-palantir-400 text-xs font-mono mb-2">✦ AI SUMMARY</div>
          <p className="text-night-200 text-sm leading-relaxed">{page.aiSummary}</p>
        </div>
      )}
      <div className="bg-slate-100 rounded-2xl p-4 sm:p-8 -mx-2 sm:mx-0">
        <DocumentRenderer content={page.content} />
      </div>
      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-night-800">
        <Link href={`/study?generateFrom=${page.id}`} className="flex items-center gap-2 px-4 py-2 bg-rose-900/20 hover:bg-rose-800/30 border border-rose-700/40 text-rose-300 rounded-lg text-sm transition-all">
          ◇ Generate Flashcards ({page.flashcards.length})
        </Link>
                <Link
          href={`/notes?edit=${page.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 rounded-lg text-sm transition-all"
        >
          ✎ Edit
        </Link>
<Link href="/notes?category=AIP" className="flex items-center gap-2 px-4 py-2 bg-cyan-900/20 hover:bg-cyan-800/30 border border-cyan-700/40 text-cyan-300 rounded-lg text-sm transition-all">
          + Add Related Note
        </Link>
      </div>
    </div>
  )
}

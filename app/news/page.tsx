// app/news/page.tsx — News & Intel Hub
import { prisma } from '@/lib/db'
import { Metadata } from 'next'
import { formatDate, timeAgo } from '@/lib/utils'
import NewsCard from '@/components/NewsCard'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'News & Intel',
  description: 'Daily Palantir news, contract awards, AI executive briefings, and technical criticism.',
}

export const revalidate = 3600 // Revalidate every hour

const ALL_TAGS = ['FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO', 'CONTRACT', 'EARNINGS', 'PARTNERSHIP', 'CRITICISM', 'RELEASE']

interface SearchParams { tag?: string; page?: string }

export default async function NewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params  = await searchParams
  const tag     = params.tag
  const pageNum = parseInt(params.page || '1')
  const perPage = 18

  const [newsItems, dailySummary, totalCount, pastSummaries, contractCount, criticismCount] = await Promise.all([
    prisma.newsItem.findMany({
      where:   tag ? { tags: { has: tag } } : {},
      orderBy: { scrapedAt: 'desc' },
      skip:    (pageNum - 1) * perPage,
      take:    perPage,
    }),
    prisma.dailySummary.findFirst({ orderBy: { summaryDate: 'desc' } }),
    prisma.newsItem.count({ where: tag ? { tags: { has: tag } } : {} }),
    prisma.dailySummary.findMany({
      orderBy: { summaryDate: 'desc' },
      take: 5,
      select: { id: true, summaryDate: true, articlesCount: true },
    }),
    prisma.newsItem.count({ where: { tags: { has: 'CONTRACT' } } }),
    prisma.newsItem.count({ where: { tags: { has: 'CRITICISM' } } }),
  ])

  const totalPages = Math.ceil(totalCount / perPage)
  const featured   = newsItems.filter((n) => n.featured)
  const regular    = newsItems.filter((n) => !n.featured)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-night-800">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">◉</span>
          <h1 className="text-3xl font-bold text-white">News & Intel</h1>
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-orange-400 text-sm font-mono">Live</span>
        </div>
        <p className="text-night-400 text-sm">
          Daily AI-curated intelligence on Palantir Foundry, Ontology, AIP, Apollo, contracts, and community feedback.
          Updated automatically via GitHub Actions every day at 7 AM UTC.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Articles',    value: totalCount,      color: 'text-orange-400' },
          { label: 'Contract Awards',   value: contractCount,   color: 'text-green-400'  },
          { label: 'Community Feedback', value: criticismCount, color: 'text-red-400'    },
          { label: 'Daily Briefings',   value: pastSummaries.length, color: 'text-palantir-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-night-900 border border-night-700 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            <div className="text-night-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">

          {/* Daily Summary */}
          {dailySummary && !tag && pageNum === 1 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-white">AI Executive Briefing</h2>
                <span className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded border border-orange-700/40 font-mono">
                  {formatDate(dailySummary.summaryDate)}
                </span>
              </div>
              <div className="bg-night-900 border border-orange-800/40 rounded-xl p-6">
                <MarkdownRenderer content={dailySummary.content} />
              </div>
            </section>
          )}

          {/* Filter bar */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/news"
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!tag ? 'bg-orange-900/30 border-orange-700/50 text-orange-200' : 'bg-night-800 border-night-700 text-night-400 hover:text-white'}`}
            >
              All ({totalCount})
            </Link>
            {ALL_TAGS.map((t) => (
              <Link
                key={t}
                href={`/news?tag=${t}`}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${tag === t ? 'bg-orange-900/30 border-orange-700/50 text-orange-200' : 'bg-night-800 border-night-700 text-night-400 hover:text-white'}`}
              >
                {t}
              </Link>
            ))}
          </div>

          {/* Featured */}
          {featured.length > 0 && (
            <section>
              <h3 className="text-sm font-mono text-orange-400 uppercase tracking-wider mb-3">Featured</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featured.map((item) => (
                  <NewsCard
                    key={item.id}
                    title={item.title}
                    summary={item.summary}
                    aiSummary={item.aiSummary}
                    source={item.source}
                    url={item.url}
                    tags={item.tags as string[]}
                    scrapedAt={item.scrapedAt}
                    featured={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Regular news grid */}
          {regular.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {regular.map((item) => (
                <NewsCard
                  key={item.id}
                  title={item.title}
                  summary={item.summary}
                  aiSummary={item.aiSummary}
                  source={item.source}
                  url={item.url}
                  tags={item.tags as string[]}
                  scrapedAt={item.scrapedAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-night-500">
              <div className="text-4xl mb-4">◉</div>
              <p className="mb-2">No news items yet.</p>
              <p className="text-xs">The scraper runs daily at 7 AM UTC via GitHub Actions.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {pageNum > 1 && (
                <Link href={`/news?${tag ? `tag=${tag}&` : ''}page=${pageNum - 1}`} className="px-4 py-2 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 rounded-lg text-sm transition-all">
                  ← Previous
                </Link>
              )}
              <span className="text-night-500 text-sm">Page {pageNum} of {totalPages}</span>
              {pageNum < totalPages && (
                <Link href={`/news?${tag ? `tag=${tag}&` : ''}page=${pageNum + 1}`} className="px-4 py-2 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 rounded-lg text-sm transition-all">
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          {/* Past briefings */}
          <div>
            <h3 className="text-night-300 text-xs font-mono uppercase tracking-wider mb-3">Past Briefings</h3>
            <div className="space-y-2">
              {pastSummaries.map((s) => (
                <div key={s.id} className="p-3 bg-night-900 border border-night-800 rounded-lg">
                  <div className="text-white text-xs font-medium">{formatDate(s.summaryDate)}</div>
                  <div className="text-night-500 text-xs mt-1">{s.articlesCount} articles</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top categories */}
          <div>
            <h3 className="text-night-300 text-xs font-mono uppercase tracking-wider mb-3">Browse by Topic</h3>
            <div className="space-y-1">
              {ALL_TAGS.map((t) => (
                <Link
                  key={t}
                  href={`/news?tag=${t}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${tag === t ? 'bg-orange-900/20 text-orange-300' : 'text-night-400 hover:text-white hover:bg-night-800'}`}
                >
                  <span>{t}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Scraper info */}
          <div className="bg-night-900 border border-night-800 rounded-xl p-4">
            <h3 className="text-night-300 text-xs font-mono uppercase tracking-wider mb-3">Data Sources</h3>
            <div className="space-y-1.5 text-xs text-night-500">
              {['Palantir Blog RSS', 'Palantir GitHub API', 'SEC EDGAR RSS', 'SAM.gov Contracts', 'Reddit r/palantir', 'Hacker News API', 'NewsAPI.org', 'YouTube Data API'].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="text-green-500">●</span> {s}
                </div>
              ))}
            </div>
            <p className="text-night-600 text-xs mt-3">Runs daily via GitHub Actions · 7 AM UTC</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

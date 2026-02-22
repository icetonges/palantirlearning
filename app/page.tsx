// app/page.tsx — Home Dashboard
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { NAV_ITEMS, KNOWLEDGE_TABS } from '@/lib/navigation'
import { formatDate } from '@/lib/utils'
import NewsCard from '@/components/NewsCard'
import AIChat from '@/components/AIChat'

async function getDashboardData() {
  const [recentPages, recentNews, dailySummary, flashcardCount, quizCount] = await Promise.all([
    prisma.knowledgePage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, title: true, category: true, slug: true, excerpt: true, createdAt: true, subCategory: true },
    }),
    prisma.newsItem.findMany({
      orderBy: { scrapedAt: 'desc' },
      take: 6,
      select: { id: true, title: true, summary: true, aiSummary: true, source: true, url: true, tags: true, scrapedAt: true, featured: true },
    }),
    prisma.dailySummary.findFirst({
      orderBy: { summaryDate: 'desc' },
    }),
    prisma.flashcard.count(),
    prisma.quizSession.count(),
  ])
  return { recentPages, recentNews, dailySummary, flashcardCount, quizCount }
}

const CATEGORY_HREF: Record<string, string> = {
  FOUNDRY:  '/foundry',
  ONTOLOGY: '/ontology',
  AIP:      '/aip',
  APOLLO:   '/apollo',
}

const CATEGORY_COLOR: Record<string, string> = {
  FOUNDRY:  'text-blue-400',
  ONTOLOGY: 'text-violet-400',
  AIP:      'text-cyan-400',
  APOLLO:   'text-emerald-400',
  GENERAL:  'text-night-400',
}

export default async function HomePage() {
  const { recentPages, recentNews, dailySummary, flashcardCount, quizCount } = await getDashboardData()

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-night-950 border-b border-night-800">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-palantir-950/10 to-night-950/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-start gap-6 max-w-3xl">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-palantir-900/30 border border-palantir-700/40 rounded-full">
              <span className="w-1.5 h-1.5 bg-palantir-400 rounded-full animate-pulse" />
              <span className="text-palantir-300 text-xs font-mono">Self-Evolving Knowledge Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight tracking-tight">
              Master the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-palantir-400 to-cyan-400">
                Palantir
              </span>{' '}
              Stack
            </h1>

            <p className="text-night-300 text-xl leading-relaxed">
              Your personal knowledge hub for Palantir Foundry, Ontology, AIP, and Apollo.
              Daily AI intelligence briefings, interactive study tools, and auto-evolving documentation.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {KNOWLEDGE_TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex items-center gap-2 px-4 py-2 bg-night-800 hover:bg-night-700 border border-night-700 hover:border-palantir-500/50 rounded-lg text-sm font-medium text-night-200 hover:text-white transition-all"
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </Link>
              ))}
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-night-800 w-full">
              {[
                { label: 'Knowledge Pages', value: recentPages.length + '+' },
                { label: 'Flashcards',      value: flashcardCount.toString() },
                { label: 'Quiz Sessions',   value: quizCount.toString() },
                { label: 'News Items',      value: recentNews.length + '+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                  <div className="text-night-400 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* ── Knowledge Tabs Grid ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-2xl font-bold text-white">Knowledge Domains</h2>
            <span className="text-night-500 text-sm">4 platforms, continuously updated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KNOWLEDGE_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="group relative flex flex-col p-5 bg-night-900 border border-night-700 hover:border-night-600 rounded-xl transition-all card-glow"
              >
                <div className={`text-3xl mb-3 bg-gradient-to-br ${tab.color} w-12 h-12 flex items-center justify-center rounded-lg text-lg`}>
                  {tab.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-semibold">{tab.label}</h3>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-palantir-800/60 text-palantir-300 rounded font-mono border border-palantir-700/40">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <p className="text-night-400 text-xs leading-relaxed">{tab.description}</p>
                <span className="mt-4 text-xs text-palantir-400 group-hover:text-palantir-300 transition-colors">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── AI Chat + Daily Summary ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Chat */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-palantir-400 font-mono">✦</span> AI Assistant
            </h2>
            <AIChat />
          </div>

          {/* Daily Summary */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-orange-400 font-mono">◉</span> Daily Intel Briefing
            </h2>
            {dailySummary ? (
              <div className="bg-night-900 border border-orange-900/40 rounded-xl p-5 h-[520px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-night-400 font-mono">
                    {formatDate(dailySummary.summaryDate)}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded border border-orange-700/40 font-mono">
                    AI Generated
                  </span>
                </div>
                <div className="prose-palantir text-sm">
                  {dailySummary.content.split('\n').map((line, i) => (
                    <p key={i} className={`mb-2 ${line.startsWith('##') ? 'text-orange-300 font-semibold text-base' : line.startsWith('#') ? 'text-white font-bold text-lg' : 'text-night-300'}`}>
                      {line.replace(/^#+\s/, '')}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-night-900 border border-night-700 rounded-xl p-8 flex flex-col items-center justify-center h-[520px] text-center">
                <span className="text-5xl mb-4">◉</span>
                <p className="text-night-400 text-sm mb-2">No briefing yet</p>
                <p className="text-night-600 text-xs">The scraper runs daily at 7 AM UTC. Check back soon.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Recent Knowledge Pages ───────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Knowledge Pages</h2>
            <Link href="/archive" className="text-palantir-400 hover:text-palantir-300 text-sm transition-colors">
              View archive →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPages.length > 0 ? recentPages.map((page) => {
              const href = `${CATEGORY_HREF[page.category] || '/archive'}/${page.slug}`
              return (
                <Link
                  key={page.id}
                  href={href}
                  className="group flex flex-col p-4 bg-night-900 border border-night-700 hover:border-night-600 rounded-xl transition-all card-glow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-mono ${CATEGORY_COLOR[page.category]}`}>
                      {page.category}
                    </span>
                    {page.subCategory && (
                      <>
                        <span className="text-night-700">·</span>
                        <span className="text-xs text-night-500">{page.subCategory}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-white text-sm font-semibold mb-2 group-hover:text-palantir-200 transition-colors line-clamp-2">
                    {page.title}
                  </h3>
                  {page.excerpt && (
                    <p className="text-night-400 text-xs leading-relaxed line-clamp-2 flex-1">
                      {page.excerpt}
                    </p>
                  )}
                  <div className="text-night-600 text-xs mt-3">{formatDate(page.createdAt)}</div>
                </Link>
              )
            }) : (
              <div className="col-span-3 py-12 text-center text-night-500">
                <p className="mb-2">No knowledge pages yet.</p>
                <Link href="/notes" className="text-palantir-400 text-sm hover:underline">
                  Add your first note →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Latest News ──────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-orange-400">◉</span> Latest Palantir News
            </h2>
            <Link href="/news" className="text-palantir-400 hover:text-palantir-300 text-sm transition-colors">
              View all news →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNews.length > 0 ? recentNews.map((item) => (
              <NewsCard key={item.id} {...item} tags={item.tags as string[]} />
            )) : (
              <div className="col-span-3 py-12 text-center text-night-500">
                News will appear here after the scraper runs (daily at 7 AM UTC).
              </div>
            )}
          </div>
        </section>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/notes',     icon: '◱', label: 'Add Note',       desc: 'Capture knowledge',  color: 'border-palantir-700/50 hover:border-palantir-600' },
              { href: '/study',     icon: '◇', label: 'Study',          desc: 'Flashcards & quiz',  color: 'border-rose-700/50 hover:border-rose-600' },
              { href: '/news',      icon: '◉', label: 'News',           desc: 'Daily intelligence', color: 'border-orange-700/50 hover:border-orange-600' },
              { href: '/resources', icon: '◫', label: 'Resources',      desc: 'Docs & SDKs',        color: 'border-teal-700/50 hover:border-teal-600' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex flex-col items-center text-center p-4 bg-night-900 border ${action.color} rounded-xl transition-all hover:-translate-y-0.5`}
              >
                <span className="text-2xl mb-2 text-night-300">{action.icon}</span>
                <span className="text-white font-medium text-sm">{action.label}</span>
                <span className="text-night-500 text-xs mt-1">{action.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── All tabs overview ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">All Platform Sections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {NAV_ITEMS.filter((item) => item.href !== '/').map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 p-4 bg-night-900 border border-night-800 hover:border-night-700 rounded-lg transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium group-hover:text-palantir-200 transition-colors">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-palantir-800/60 text-palantir-300 rounded font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-night-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

// app/api/scraper/summarize/route.ts — Generate daily AI executive summary
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateScraperToken } from '@/lib/utils'
import { generateDailySummary } from '@/lib/gemini'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!validateScraperToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const forceRefresh = body?.force === true

  const d = new Date()
  const today    = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const tomorrow = new Date(today)
  tomorrow.setUTCDate(today.getUTCDate() + 1)

  // If force refresh, delete existing summary first
  if (forceRefresh) {
    await prisma.dailySummary.deleteMany({ where: { summaryDate: today } }).catch(() => {})
  } else {
    const existing = await prisma.dailySummary.findUnique({ where: { summaryDate: today } })
    if (existing) {
      return NextResponse.json({ message: 'Summary already exists for today', id: existing.id })
    }
  }

  // Get today's news — fall back to last 48h if nothing today
  let newsItems = await prisma.newsItem.findMany({
    where:   { scrapedAt: { gte: today, lt: tomorrow } },
    orderBy: { scrapedAt: 'desc' },
    take:    50,
    select:  { title: true, summary: true, source: true, tags: true, aiSummary: true },
  })

  if (newsItems.length === 0) {
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setUTCDate(today.getUTCDate() - 2)
    newsItems = await prisma.newsItem.findMany({
      where:   { scrapedAt: { gte: twoDaysAgo } },
      orderBy: { scrapedAt: 'desc' },
      take:    50,
      select:  { title: true, summary: true, source: true, tags: true, aiSummary: true },
    })
  }

  if (newsItems.length === 0) {
    return NextResponse.json({ message: 'No news items found, skipping summary' })
  }

  const items = newsItems.map(n => ({
    title:   n.title,
    summary: n.aiSummary || n.summary,
    source:  n.source,
    tags:    n.tags as string[],
  }))

  const content = await generateDailySummary(items)

  const summary = await prisma.dailySummary.upsert({
    where:  { summaryDate: today },
    create: { summaryDate: today, content, topicsCount: [...new Set(newsItems.flatMap(n => n.tags))].length, articlesCount: newsItems.length },
    update: { content, topicsCount: [...new Set(newsItems.flatMap(n => n.tags))].length, articlesCount: newsItems.length },
  })

  return NextResponse.json({ id: summary.id, articlesCount: newsItems.length })
}

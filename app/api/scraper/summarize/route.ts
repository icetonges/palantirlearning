// app/api/scraper/summarize/route.ts — Generate daily AI executive summary
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateScraperToken } from '@/lib/utils'
import { generateDailySummary } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!validateScraperToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today     = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const tomorrow  = new Date(today)
  tomorrow.setUTCDate(today.getUTCDate() + 1)

  // Check if summary already exists for today
  const existing = await prisma.dailySummary.findUnique({
    where: { summaryDate: today },
  })
  if (existing) {
    return NextResponse.json({ message: 'Summary already exists for today', id: existing.id })
  }

  // Get today's scraped news
  const newsItems = await prisma.newsItem.findMany({
    where: {
      scrapedAt: { gte: today, lt: tomorrow },
    },
    orderBy: { scrapedAt: 'desc' },
    take: 50,
    select: { title: true, summary: true, source: true, tags: true, aiSummary: true },
  })

  if (newsItems.length === 0) {
    return NextResponse.json({ message: 'No news items for today, skipping summary' })
  }

  // Generate AI summary
  const items = newsItems.map((n) => ({
    title:   n.title,
    summary: n.aiSummary || n.summary,
    source:  n.source,
    tags:    n.tags as string[],
  }))

  const content = await generateDailySummary(items)

  const summary = await prisma.dailySummary.create({
    data: {
      summaryDate:   today,
      content,
      topicsCount:   [...new Set(newsItems.flatMap((n) => n.tags))].length,
      articlesCount: newsItems.length,
    },
  })

  return NextResponse.json({ id: summary.id, articlesCount: newsItems.length })
}

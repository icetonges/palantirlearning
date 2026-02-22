// app/api/scraper/ingest/route.ts — Receive scraped news items from GitHub Actions
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateScraperToken, hashUrl } from '@/lib/utils'
import { summarizeNewsItem, classifyNewsTags } from '@/lib/gemini'

interface IngestItem {
  title:       string
  summary:     string
  source:      string
  url:         string
  publishedAt?: string
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!validateScraperToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { items }: { items: IngestItem[] } = await req.json()

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items array required' }, { status: 400 })
  }

  let created = 0
  let skipped = 0

  for (const item of items) {
    if (!item.url || !item.title) { skipped++; continue }

    const urlHash = hashUrl(item.url)

    // Check for duplicate
    const existing = await prisma.newsItem.findUnique({ where: { urlHash } })
    if (existing) { skipped++; continue }

    // AI summarize + classify (in parallel)
    const [aiSummary, tags] = await Promise.all([
      summarizeNewsItem(item.title, item.summary).catch(() => null),
      classifyNewsTags(item.title, item.summary).catch(() => ['GENERAL']),
    ])

    await prisma.newsItem.create({
      data: {
        title:      item.title,
        summary:    item.summary || '',
        aiSummary:  aiSummary || null,
        source:     item.source || 'Unknown',
        url:        item.url,
        urlHash,
        tags:       tags as ('FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'CONTRACT' | 'EARNINGS' | 'PARTNERSHIP' | 'CRITICISM' | 'RELEASE' | 'GENERAL')[],
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
      },
    }).catch((e) => { console.error('[ingest] DB error:', e); skipped++ })

    created++
  }

  return NextResponse.json({ created, skipped, total: items.length })
}

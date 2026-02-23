// app/api/scraper/debug/route.ts — diagnose token + news DB state
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateScraperToken } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const tokenOk    = validateScraperToken(authHeader)
  const newsCount  = await prisma.newsItem.count().catch(() => -1)
  const latest     = await prisma.newsItem.findFirst({
    orderBy: { scrapedAt: 'desc' },
    select:  { title: true, scrapedAt: true, source: true },
  }).catch(() => null)

  return NextResponse.json({
    tokenValid:    tokenOk,
    totalNews:     newsCount,
    latestArticle: latest,
    scraperToken:  process.env.SCRAPER_TOKEN ? `set (${process.env.SCRAPER_TOKEN.slice(0,6)}…)` : 'NOT SET',
    hint: tokenOk
      ? '✓ Token OK — ingest should work'
      : '✗ Token mismatch — SCRAPER_TOKEN in GitHub Secrets must match Vercel env var exactly',
  })
}

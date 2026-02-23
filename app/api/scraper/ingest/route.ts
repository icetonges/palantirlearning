// app/api/scraper/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateScraperToken, hashUrl } from '@/lib/utils'

// No Gemini calls here — save items fast, enrich later
export const maxDuration = 60

interface IngestItem {
  title:        string
  summary:      string
  source:       string
  url:          string
  publishedAt?: string
}

// Fast keyword-based tag classifier — no API call needed
function classifyTags(title: string, summary: string): string[] {
  const text = (title + ' ' + summary).toLowerCase()
  const tags: string[] = []
  if (/foundry|transform|pipeline|dataset|workshop|contour|slate/.test(text))   tags.push('FOUNDRY')
  if (/ontology|object.type|link.type|osdk/.test(text))                          tags.push('ONTOLOGY')
  if (/\baip\b|aip logic|aip studio|agent|llm|copilot/.test(text))              tags.push('AIP')
  if (/apollo|deployment|fleet|air.gap/.test(text))                              tags.push('APOLLO')
  if (/contract|award|government|defense|military|dod|army|navy|nga/.test(text)) tags.push('CONTRACT')
  if (/earn|revenue|q[1-4]|fiscal|stock|share|investor|pltr/.test(text))        tags.push('EARNINGS')
  if (/partner|collaborat|integrat|deal|alliance/.test(text))                    tags.push('PARTNERSHIP')
  if (/critic|concern|controversi|privacy|lawsuit|senate|congress/.test(text))  tags.push('CRITICISM')
  if (/release|launch|announc|version|update|new feature/.test(text))           tags.push('RELEASE')
  return tags.length > 0 ? tags.slice(0, 3) : ['GENERAL']
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!validateScraperToken(authHeader)) {
    console.error('[ingest] 401 — token mismatch. Check SCRAPER_TOKEN in Vercel + GitHub Secrets match exactly.')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { items?: IngestItem[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { items } = body
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items array required' }, { status: 400 })
  }

  console.log(`[ingest] Received ${items.length} items`)

  let created = 0
  let skipped = 0

  for (const item of items) {
    if (!item.url || !item.title) { skipped++; continue }

    const urlHash = hashUrl(item.url)

    try {
      const existing = await prisma.newsItem.findUnique({ where: { urlHash } })
      if (existing) { skipped++; continue }
    } catch (e) {
      console.error('[ingest] DB lookup error:', e)
      skipped++
      continue
    }

    const tags = classifyTags(item.title, item.summary || '')

    try {
      await prisma.newsItem.create({
        data: {
          title:       item.title.slice(0, 500),
          summary:     (item.summary || '').slice(0, 2000),
          aiSummary:   null,   // enriched later by /api/scraper/enrich
          source:      item.source || 'Unknown',
          url:         item.url,
          urlHash,
          tags:        tags as ('FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'CONTRACT' | 'EARNINGS' | 'PARTNERSHIP' | 'CRITICISM' | 'RELEASE' | 'GENERAL')[],
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        },
      })
      created++
    } catch (e) {
      console.error('[ingest] DB create error:', e)
      skipped++
    }
  }

  console.log(`[ingest] Done — created=${created} skipped=${skipped}`)
  return NextResponse.json({ created, skipped, total: items.length })
}

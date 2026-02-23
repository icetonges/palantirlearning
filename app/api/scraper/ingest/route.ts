// app/api/scraper/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashUrl } from '@/lib/utils'

export const maxDuration = 60

interface IngestItem {
  title:        string
  summary:      string
  source:       string
  url:          string
  publishedAt?: string
}

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
  const authHeader  = req.headers.get('authorization') ?? ''
  const receivedToken = authHeader.replace(/^Bearer\s+/i, '').trim()
  const expectedToken = (process.env.SCRAPER_TOKEN ?? '').trim()

  // Detailed mismatch logging — shows lengths and first/last chars to spot invisible chars
  if (receivedToken !== expectedToken) {
    console.error('[ingest] 401 token mismatch', {
      receivedLen:   receivedToken.length,
      expectedLen:   expectedToken.length,
      receivedStart: receivedToken.slice(0, 6),
      expectedStart: expectedToken.slice(0, 6),
      receivedEnd:   receivedToken.slice(-4),
      expectedEnd:   expectedToken.slice(-4),
      envVarSet:     !!process.env.SCRAPER_TOKEN,
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { items?: IngestItem[] }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { items } = body
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items array required' }, { status: 400 })
  }

  console.log(`[ingest] Received ${items.length} items`)
  let created = 0, skipped = 0

  for (const item of items) {
    if (!item.url || !item.title) { skipped++; continue }
    const urlHash = hashUrl(item.url)
    try {
      const existing = await prisma.newsItem.findUnique({ where: { urlHash } })
      if (existing) { skipped++; continue }
    } catch { skipped++; continue }

    try {
      await prisma.newsItem.create({
        data: {
          title:       item.title.slice(0, 500),
          summary:     (item.summary || '').slice(0, 2000),
          aiSummary:   null,
          source:      item.source || 'Unknown',
          url:         item.url,
          urlHash,
          tags:        classifyTags(item.title, item.summary || '') as ('FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'CONTRACT' | 'EARNINGS' | 'PARTNERSHIP' | 'CRITICISM' | 'RELEASE' | 'GENERAL')[],
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        },
      })
      created++
    } catch (e) { console.error('[ingest] DB error:', e); skipped++ }
  }

  console.log(`[ingest] Done — created=${created} skipped=${skipped}`)
  return NextResponse.json({ created, skipped, total: items.length })
}

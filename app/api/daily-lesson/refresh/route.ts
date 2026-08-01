// app/api/daily-lesson/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateScraperToken } from '@/lib/utils'
import { generateDailyTopic, generatePalantir101 } from '@/lib/gemini'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!validateScraperToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const d     = new Date()
  const today = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))

  // Delete existing cache
  await prisma.dailyLesson.deleteMany({ where: { lessonDate: today } }).catch(() => {})

  // Give the generators recent history (including today's now-deleted entry
  // won't be in it) so a manual refresh still avoids repeating a past topic.
  let topicHistory: string[] = []
  let p101History: string[] = []
  try {
    const past = await prisma.dailyLesson.findMany({
      orderBy: { lessonDate: 'desc' },
      take: 45,
      select: { topicTitle: true, palantir101: true },
    })
    topicHistory = past.map(p => p.topicTitle)
    p101History  = past.map(p => p.palantir101.split('\n').find(l => l.trim())?.slice(0, 160) ?? '').filter(Boolean)
  } catch (e) {
    console.warn('[daily-lesson/refresh] history read failed:', String(e))
  }

  try {
    const results = await Promise.all([
      generateDailyTopic(topicHistory),
      generatePalantir101(p101History),
    ])
    const topic = results[0]
    const p101  = results[1]

    const dbPayload = {
      topicTitle:   topic.title,
      topicDomain:  topic.domain,
      topicSubject: topic.subject,
      topicBody:    topic.body,
      palantir101:  p101,
    }

    await prisma.dailyLesson.upsert({
      where:  { lessonDate: today },
      create: { lessonDate: today, ...dbPayload },
      update: dbPayload,
    })

    return NextResponse.json({
      ok:      true,
      topic:   topic.title,
      domain:  topic.domain,
      message: `Refreshed — new topic: ${topic.title}`,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Generation failed', detail: String(e) }, { status: 500 })
  }
}

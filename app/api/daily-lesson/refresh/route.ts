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

  // Pick a new seed: use current timestamp seconds so each refresh gets a different topic
  const seed = Math.floor(Date.now() / 1000) % 997

  try {
    const results = await Promise.all([
      generateDailyTopic(seed),
      generatePalantir101(seed),
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

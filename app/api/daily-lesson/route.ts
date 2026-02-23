// app/api/daily-lesson/route.ts — Fetch/generate today's daily lesson
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDailyTopic, generatePalantir101 } from '@/lib/gemini'

function todayUTC(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function dateSeed(date: Date): number {
  const str = date.toISOString().slice(0, 10).replace(/-/g, '')
  return parseInt(str, 10) % 997
}

export async function GET() {
  const today = todayUTC()
  const seed  = dateSeed(today)

  // 1. Try DB cache first (table may not exist yet — handle gracefully)
  try {
    const cached = await prisma.dailyLesson.findUnique({ where: { lessonDate: today } })
    if (cached) {
      return NextResponse.json({
        topicTitle:   cached.topicTitle,
        topicDomain:  cached.topicDomain,
        topicSubject: cached.topicSubject,
        topicBody:    cached.topicBody,
        palantir101:  cached.palantir101,
        cached:       true,
      })
    }
  } catch {
    // Table doesn't exist yet (migration pending) — continue to generate without caching
    console.warn('[daily-lesson] DB table not ready, generating without cache')
  }

  // 2. Generate fresh content from Gemini
  try {
    const [topic, p101] = await Promise.all([
      generateDailyTopic(seed),
      generatePalantir101(seed),
    ])

    const result = {
      topicTitle:   topic.title,
      topicDomain:  topic.domain,
      topicSubject: topic.subject,
      topicBody:    topic.body,
      palantir101:  p101,
      cached:       false,
    }

    // 3. Try to persist — silently skip if table missing
    try {
      await prisma.dailyLesson.upsert({
        where:  { lessonDate: today },
        create: { lessonDate: today, ...result },
        update: result,
      })
    } catch {
      console.warn('[daily-lesson] Could not cache to DB (table may not exist yet)')
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[daily-lesson] Gemini generation failed:', err)
    return NextResponse.json({ error: 'Generation failed', detail: String(err) }, { status: 500 })
  }
}

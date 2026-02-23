// app/api/daily-lesson/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDailyTopic, generatePalantir101 } from '@/lib/gemini'

// Extend Vercel function timeout to 60s — two Gemini calls need breathing room
export const maxDuration = 60

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

  // 1. Return from DB cache if available
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
  } catch (e) {
    console.warn('[daily-lesson] DB read failed:', String(e))
  }

  // 2. Generate sequentially (not parallel) to avoid timeout on cold starts
  let topic: Awaited<ReturnType<typeof generateDailyTopic>>
  let p101:  string

  try {
    topic = await generateDailyTopic(seed)
  } catch (e) {
    console.error('[daily-lesson] generateDailyTopic failed:', e)
    return NextResponse.json({ error: 'topic_failed', detail: String(e) }, { status: 500 })
  }

  try {
    p101 = await generatePalantir101(seed)
  } catch (e) {
    console.error('[daily-lesson] generatePalantir101 failed:', e)
    return NextResponse.json({ error: 'p101_failed', detail: String(e) }, { status: 500 })
  }

  const result = {
    topicTitle:   topic.title,
    topicDomain:  topic.domain,
    topicSubject: topic.subject,
    topicBody:    topic.body,
    palantir101:  p101,
    cached:       false,
  }

  // 3. Persist to DB — silent fail if table missing
  try {
    await prisma.dailyLesson.upsert({
      where:  { lessonDate: today },
      create: { lessonDate: today, ...result },
      update: result,
    })
  } catch (e) {
    console.warn('[daily-lesson] DB write failed (table may not exist):', String(e))
  }

  return NextResponse.json(result)
}

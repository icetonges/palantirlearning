// app/api/daily-lesson/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDailyTopic, generatePalantir101 } from '@/lib/gemini'

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

  // 2. Generate both in parallel
  let topicResult: Awaited<ReturnType<typeof generateDailyTopic>>
  let p101Result: string

  try {
    const results = await Promise.all([
      generateDailyTopic(seed),
      generatePalantir101(seed),
    ])
    topicResult = results[0]
    p101Result  = results[1]
  } catch (e) {
    console.error('[daily-lesson] Generation failed:', e)
    return NextResponse.json({ error: 'generation_failed', detail: String(e) }, { status: 500 })
  }

  const dbPayload = {
    topicTitle:   topicResult.title,
    topicDomain:  topicResult.domain,
    topicSubject: topicResult.subject,
    topicBody:    topicResult.body,
    palantir101:  p101Result,
  }

  try {
    await prisma.dailyLesson.upsert({
      where:  { lessonDate: today },
      create: { lessonDate: today, ...dbPayload },
      update: dbPayload,
    })
  } catch (e) {
    console.warn('[daily-lesson] DB write failed:', String(e))
  }

  return NextResponse.json({ ...dbPayload, cached: false })
}

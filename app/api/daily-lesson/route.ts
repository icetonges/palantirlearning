// app/api/daily-lesson/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDailyTopic, generatePalantir101 } from '@/lib/gemini'

export const maxDuration = 60

function todayUTC(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

// How many past days of history to show the model so it avoids repeating itself.
const HISTORY_LOOKBACK = 45

async function recentHistory() {
  try {
    const past = await prisma.dailyLesson.findMany({
      orderBy: { lessonDate: 'desc' },
      take: HISTORY_LOOKBACK,
      select: { topicTitle: true, palantir101: true },
    })
    return {
      topicHistory: past.map(p => p.topicTitle),
      p101History:  past.map(p => p.palantir101.split('\n').find(l => l.trim())?.slice(0, 160) ?? '').filter(Boolean),
    }
  } catch (e) {
    console.warn('[daily-lesson] history read failed:', String(e))
    return { topicHistory: [] as string[], p101History: [] as string[] }
  }
}

export async function GET() {
  const today = todayUTC()

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

  // 2. Generate both in parallel, giving each generator recent history so it
  //    picks something new instead of repeating a past day's topic/angle.
  let topicResult: Awaited<ReturnType<typeof generateDailyTopic>>
  let p101Result: string

  try {
    const { topicHistory, p101History } = await recentHistory()
    const results = await Promise.all([
      generateDailyTopic(topicHistory),
      generatePalantir101(p101History),
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

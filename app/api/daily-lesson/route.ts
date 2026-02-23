// app/api/daily-lesson/route.ts — Fetch (and lazily generate) today's daily lesson
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDailyTopic, generatePalantir101 } from '@/lib/gemini'

function todayUTC(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

// Deterministic seed from date — same topic all day, rotates daily
function dateSeed(date: Date): number {
  const str = date.toISOString().slice(0, 10).replace(/-/g, '')
  return parseInt(str, 10) % 997 // prime modulus for good spread
}

export async function GET() {
  const today = todayUTC()
  const seed  = dateSeed(today)

  // Return cached if already generated today
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

  // Generate fresh content
  try {
    const [topic, p101] = await Promise.all([
      generateDailyTopic(seed),
      generatePalantir101(seed),
    ])

    // Persist so subsequent requests are instant
    await prisma.dailyLesson.upsert({
      where:  { lessonDate: today },
      create: {
        lessonDate:   today,
        topicTitle:   topic.title,
        topicDomain:  topic.domain,
        topicSubject: topic.subject,
        topicBody:    topic.body,
        palantir101:  p101,
      },
      update: {
        topicTitle:   topic.title,
        topicDomain:  topic.domain,
        topicSubject: topic.subject,
        topicBody:    topic.body,
        palantir101:  p101,
      },
    })

    return NextResponse.json({
      topicTitle:   topic.title,
      topicDomain:  topic.domain,
      topicSubject: topic.subject,
      topicBody:    topic.body,
      palantir101:  p101,
      cached:       false,
    })
  } catch (err) {
    console.error('[daily-lesson] Generation failed:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

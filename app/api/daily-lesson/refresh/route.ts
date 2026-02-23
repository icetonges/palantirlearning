// app/api/daily-lesson/refresh/route.ts — Delete today's cached lesson so it regenerates
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateScraperToken } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!validateScraperToken(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const d = new Date()
  const today = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))

  try {
    await prisma.dailyLesson.delete({ where: { lessonDate: today } })
    return NextResponse.json({ ok: true, message: 'Today\'s lesson cleared — next GET will regenerate it' })
  } catch {
    return NextResponse.json({ ok: true, message: 'No cached lesson for today (already fresh)' })
  }
}

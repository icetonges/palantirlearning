// app/api/study/route.ts — Study session tracking
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isOwner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [totalCards, recentSessions] = await Promise.all([
    prisma.flashcard.count(),
    prisma.quizSession.findMany({
      orderBy: { takenAt: 'desc' },
      take: 20,
      select: { category: true, score: true, total: true, percentage: true, takenAt: true },
    }),
  ])

  return NextResponse.json({ totalCards, recentSessions })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isOwner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, category, score, total, percentage, answersJson } = await req.json()

  if (type === 'quiz') {
    const qs = await prisma.quizSession.create({
      data: {
        category,
        score,
        total,
        percentage: percentage || (score / total) * 100,
        answersJson: answersJson || [],
      },
    })
    return NextResponse.json({ id: qs.id })
  }

  return NextResponse.json({ recorded: true })
}

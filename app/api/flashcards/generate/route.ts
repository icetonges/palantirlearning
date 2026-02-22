// app/api/flashcards/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateFlashcards } from '@/lib/gemini'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const list     = searchParams.get('list')
  const category = searchParams.get('category')

  if (list) {
    // Return existing flashcards for study mode
    const flashcards = await prisma.flashcard.findMany({
      where:   category ? { category: category as 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL' } : {},
      orderBy: { createdAt: 'asc' },
    })
    // Shuffle
    const shuffled = flashcards.sort(() => Math.random() - 0.5)
    return NextResponse.json({ flashcards: shuffled, total: shuffled.length })
  }

  return NextResponse.json({ error: 'Use POST to generate, GET with ?list=true to retrieve' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { pageId, count = 8 } = await req.json()

  if (!pageId) return NextResponse.json({ error: 'pageId is required' }, { status: 400 })

  const page = await prisma.knowledgePage.findUnique({ where: { id: pageId } })
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const cards = await generateFlashcards(page.content, page.category, count)

  const created = await prisma.flashcard.createMany({
    data: cards.map((c) => ({
      category:    page.category,
      subCategory: page.subCategory || null,
      question:    c.question,
      answer:      c.answer,
      difficulty:  c.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
      tags:        page.tags,
      sourcePageId: page.id,
    })),
  })

  await prisma.knowledgePage.update({
    where: { id: page.id },
    data:  { flashcardCount: { increment: created.count } },
  })

  return NextResponse.json({ created: created.count, cards })
}

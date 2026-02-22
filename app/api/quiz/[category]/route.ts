// app/api/quiz/[category]/route.ts — Generate quiz questions via Gemini
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateQuiz } from '@/lib/gemini'

export async function GET(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  const { category }  = await params
  const { searchParams } = new URL(req.url)
  const count = parseInt(searchParams.get('count') || '10')

  const validCategories = ['FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO', 'GENERAL']
  const cat = validCategories.includes(category.toUpperCase())
    ? category.toUpperCase() as 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL'
    : 'FOUNDRY'

  // Get 3 random knowledge pages from this category for context
  const pages = await prisma.knowledgePage.findMany({
    where:   { category: cat },
    orderBy: { createdAt: 'desc' },
    take:    4,
    select:  { title: true, content: true },
  })

  if (pages.length === 0) {
    // Fallback: use seeded content
    return NextResponse.json({ error: 'No knowledge pages found for this category. Add some notes first.' }, { status: 404 })
  }

  const contextText = pages
    .map((p) => `## ${p.title}\n\n${p.content.slice(0, 2000)}`)
    .join('\n\n---\n\n')

  const questions = await generateQuiz(contextText, cat, count)

  return NextResponse.json({ questions, category: cat, count: questions.length })
}

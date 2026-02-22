// app/api/notes/route.ts — Save note → auto-generate knowledge page
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateDatedSlug, markdownToPlainText, truncate } from '@/lib/utils'
import { summarizeNote } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isOwner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, category, subCategory, content } = await req.json()

  if (!title?.trim() || !content?.trim() || !category) {
    return NextResponse.json({ error: 'title, content, and category are required' }, { status: 400 })
  }

  // Generate slug
  let slug = generateDatedSlug(title)
  const existing = await prisma.knowledgePage.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  // Generate excerpt from plain text
  const plainText = markdownToPlainText(content)
  const excerpt   = truncate(plainText, 280)

  // Create page immediately (without waiting for AI)
  const page = await prisma.knowledgePage.create({
    data: {
      slug,
      title: title.trim(),
      category,
      subCategory: subCategory || null,
      content: content.trim(),
      excerpt,
      sourceType: 'NOTE',
      tags: [],
    },
  })

  // Async: generate AI summary and tags (don't block the response)
  summarizeNote(content, category).then(async (aiResult) => {
    await prisma.knowledgePage.update({
      where: { id: page.id },
      data: {
        aiSummary:   aiResult.summary,
        tags:        aiResult.tags,
        subCategory: aiResult.subCategory || subCategory || null,
      },
    })
  }).catch((e) => console.error('[notes] AI summarization failed:', e))

  return NextResponse.json({ id: page.id, slug: page.slug, category: page.category }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isOwner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const pages = await prisma.knowledgePage.findMany({
    where:   category ? { category: category as 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL' } : {},
    orderBy: { createdAt: 'desc' },
    select:  { id: true, slug: true, title: true, category: true, subCategory: true, excerpt: true, tags: true, sourceType: true, createdAt: true },
  })

  return NextResponse.json({ pages })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.isOwner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.knowledgePage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

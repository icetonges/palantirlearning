// app/api/notes/route.ts — CRUD for knowledge pages
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDatedSlug, markdownToPlainText, truncate } from '@/lib/utils'
import { summarizeNote } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { title, category, subCategory, content } = await req.json()
  if (!title?.trim() || !content?.trim() || !category) {
    return NextResponse.json({ error: 'title, content, and category are required' }, { status: 400 })
  }
  let slug = generateDatedSlug(title)
  const existing = await prisma.knowledgePage.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`
  const plainText = markdownToPlainText(content)
  const excerpt   = truncate(plainText, 280)
  const page = await prisma.knowledgePage.create({
    data: { slug, title: title.trim(), category, subCategory: subCategory || null, content: content.trim(), excerpt, sourceType: 'NOTE', tags: [] },
  })
  summarizeNote(content, category).then(async (aiResult) => {
    await prisma.knowledgePage.update({
      where: { id: page.id },
      data:  { aiSummary: aiResult.summary, tags: aiResult.tags, subCategory: aiResult.subCategory || subCategory || null },
    })
  }).catch((e) => console.error('[notes] AI summarization failed:', e))
  return NextResponse.json({ id: page.id, slug: page.slug, category: page.category }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id          = searchParams.get('id')
  const category    = searchParams.get('category')
  const subCategory = searchParams.get('subCategory')
  const q           = searchParams.get('q')

  // Single-page fetch by ID (for edit mode)
  if (id) {
    const page = await prisma.knowledgePage.findUnique({
      where:  { id },
      select: { id: true, slug: true, title: true, category: true, subCategory: true, content: true, excerpt: true, aiSummary: true, tags: true, sourceType: true, viewCount: true, pinned: true, createdAt: true, updatedAt: true },
    })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ page })
  }

  const pages = await prisma.knowledgePage.findMany({
    where: {
      ...(category    ? { category: category as 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL' } : {}),
      ...(subCategory ? { subCategory: { contains: subCategory, mode: 'insensitive' } } : {}),
      ...(q ? { OR: [
        { title:       { contains: q, mode: 'insensitive' } },
        { content:     { contains: q, mode: 'insensitive' } },
        { excerpt:     { contains: q, mode: 'insensitive' } },
        { subCategory: { contains: q, mode: 'insensitive' } },
        { aiSummary:   { contains: q, mode: 'insensitive' } },
      ]} : {}),
    },
    orderBy: { createdAt: 'desc' },
    select:  { id: true, slug: true, title: true, category: true, subCategory: true, excerpt: true, aiSummary: true, tags: true, sourceType: true, viewCount: true, pinned: true, createdAt: true, updatedAt: true },
  })
  const counts    = await prisma.knowledgePage.groupBy({ by: ['category'], _count: { id: true } })
  const subCounts = await prisma.knowledgePage.groupBy({ by: ['subCategory'], _count: { id: true }, where: { subCategory: { not: null } } })
  return NextResponse.json({ pages, counts, subCounts })
}

export async function PUT(req: NextRequest) {
  const { id, title, category, subCategory, content, pinned } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updateData: Record<string, unknown> = {}
  if (title       !== undefined) updateData.title       = title.trim()
  if (category    !== undefined) updateData.category    = category
  if (subCategory !== undefined) updateData.subCategory = subCategory || null
  if (pinned      !== undefined) updateData.pinned      = pinned
  if (content     !== undefined) {
    const plainText = markdownToPlainText(content)
    updateData.content = content.trim()
    updateData.excerpt = truncate(plainText, 280)
  }

  const page = await prisma.knowledgePage.update({ where: { id }, data: updateData })

  // Re-run AI summary if content changed
  if (content !== undefined) {
    summarizeNote(content, category || page.category).then(async (aiResult) => {
      await prisma.knowledgePage.update({
        where: { id: page.id },
        data:  { aiSummary: aiResult.summary, tags: aiResult.tags },
      })
    }).catch(() => {})
  }
  return NextResponse.json({ id: page.id, slug: page.slug, category: page.category })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.knowledgePage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

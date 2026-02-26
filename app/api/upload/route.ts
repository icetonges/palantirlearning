// app/api/upload/route.ts — Document upload → extract text → generate knowledge page
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateDatedSlug, markdownToPlainText, truncate } from '@/lib/utils'
import { processDocument, generateFlashcards } from '@/lib/gemini'
import { htmlToMarkdown } from '@/lib/htmlToMarkdown'

export async function POST(req: NextRequest) {
  const formData    = await req.formData()
  const file        = formData.get('file') as File | null
  const category    = (formData.get('category') as string) || 'GENERAL'
  const subCategory = (formData.get('subCategory') as string) || null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const maxSize = 20 * 1024 * 1024 // 20MB
  if (file.size > maxSize) return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  let extractedText = ''

  // ── Text extraction ─────────────────────────────────────────────────────────
  const mimeType = file.type || 'text/plain'

  if (mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      const pdfParse = (await import('pdf-parse')).default
      const pdfData  = await pdfParse(buffer)
      extractedText  = pdfData.text
    } catch (e) {
      console.error('[upload] PDF parse error:', e)
      return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 422 })
    }
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    try {
      const mammoth = await import('mammoth')
      // convertToHtml with image handler — embeds images as base64 data URIs
      const result  = await mammoth.convertToHtml(
        { buffer },
        {
          convertImage: mammoth.images.imgElement((image) => {
            return image.read('base64').then((imageBuffer) => ({
              src: `data:${image.contentType};base64,${imageBuffer}`,
            }))
          }),
        }
      )
      // Store as HTML directly — preserves ALL formatting, tables, images
      extractedText = result.value
    } catch (e) {
      console.error('[upload] DOCX parse error:', e)
      return NextResponse.json({ error: 'Failed to parse DOCX' }, { status: 422 })
    }
  } else if (
    mimeType === 'text/plain' || mimeType === 'text/markdown' ||
    file.name.endsWith('.txt') || file.name.endsWith('.md')
  ) {
    extractedText = buffer.toString('utf-8')
  } else {
    return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' }, { status: 400 })
  }

  if (!extractedText.trim()) {
    return NextResponse.json({ error: 'Could not extract text from file' }, { status: 422 })
  }

  // ── AI processing ───────────────────────────────────────────────────────────
  let aiMeta = {
    title:       file.name.replace(/\.[^.]+$/, ''),
    category:    category as 'FOUNDRY' | 'ONTOLOGY' | 'AIP' | 'APOLLO' | 'GENERAL',
    summary:     '',
    tags:        [] as string[],
    subCategory: subCategory || '',
  }

  try {
    const result = await processDocument(extractedText, file.name)
    aiMeta = { ...aiMeta, ...result }
  } catch (e) {
    console.error('[upload] AI processing failed, using defaults:', e)
  }

  // ── Create knowledge page ───────────────────────────────────────────────────
  let slug = generateDatedSlug(aiMeta.title)
  const existing = await prisma.knowledgePage.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const excerpt = truncate(markdownToPlainText(extractedText), 280)

  const page = await prisma.knowledgePage.create({
    data: {
      slug,
      title:       aiMeta.title,
      category:    aiMeta.category,
      subCategory: aiMeta.subCategory || subCategory || null,
      content:     extractedText,
      excerpt:     aiMeta.summary || excerpt,
      aiSummary:   aiMeta.summary || null,
      tags:        aiMeta.tags,
      sourceType:  'UPLOAD',
    },
  })

  // Save document metadata
  await prisma.document.create({
    data: {
      filename:     `${slug}.${file.name.split('.').pop()}`,
      originalName: file.name,
      mimeType:     mimeType,
      sizeBytes:    file.size,
      category:     aiMeta.category,
      processed:    true,
      pageSlug:     slug,
    },
  })

  // Async: generate flashcards
  generateFlashcards(extractedText, aiMeta.category, 8).then(async (cards) => {
    await prisma.flashcard.createMany({
      data: cards.map((c) => ({
        category:    aiMeta.category,
        subCategory: aiMeta.subCategory || null,
        question:    c.question,
        answer:      c.answer,
        difficulty:  c.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        tags:        aiMeta.tags,
        sourcePageId: page.id,
      })),
    })
    await prisma.knowledgePage.update({
      where: { id: page.id },
      data:  { flashcardCount: cards.length },
    })
  }).catch((e) => console.error('[upload] Flashcard generation failed:', e))

  return NextResponse.json({ id: page.id, slug: page.slug, category: page.category, title: page.title }, { status: 201 })
}

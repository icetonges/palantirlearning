// app/api/chat/route.ts — AI assistant chat endpoint
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { agentChat } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    // Gather context: recent knowledge pages + recent news
    const [recentPages, recentNews] = await Promise.all([
      prisma.knowledgePage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { title: true, excerpt: true, category: true, slug: true },
      }),
      prisma.newsItem.findMany({
        orderBy: { scrapedAt: 'desc' },
        take: 5,
        select: { title: true, aiSummary: true, source: true },
      }),
    ])

    const pagesContext = recentPages
      .map((p) => `[${p.category}] ${p.title}: ${p.excerpt || ''}`)
      .join('\n')

    const newsContext = recentNews
      .map((n) => `${n.title} (${n.source}): ${n.aiSummary || ''}`)
      .join('\n')

    const reply = await agentChat(message, {
      recentPages: pagesContext,
      recentNews:  newsContext,
    })

    return NextResponse.json({ reply })
  } catch (err: unknown) {
    console.error('[chat] Error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { reply: `⚠️ AI assistant error: ${message}. Check that GEMINI_API_KEY is set in Vercel environment variables.` },
      { status: 200 } // Return 200 so the UI shows the error message in chat
    )
  }
}

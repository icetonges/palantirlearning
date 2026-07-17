// app/api/pages/view/route.ts — Fire-and-forget view counter
//
// Called client-side (see components/ViewTracker.tsx) instead of incrementing
// viewCount inside the page component. Two reasons:
//   1. Detail pages are now statically generated with ISR, so the page
//      component only runs during (re)generation, not on every visit — an
//      inline increment would undercount views badly.
//   2. Even on dynamic routes, a DB write should never block the response.
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { slug } = await req.json()
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    // Don't await-block on errors from an unknown/stale slug
    await prisma.knowledgePage.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    }).catch(() => null)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

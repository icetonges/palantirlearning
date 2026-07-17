// lib/queries.ts — Request-deduped data fetchers
//
// Wrapping these in React's `cache()` means generateMetadata() and the page
// component can both call the same function for the same slug and only pay
// for ONE database round trip per render pass, instead of two.
import { cache } from 'react'
import { prisma } from '@/lib/db'

export const getKnowledgePageBySlug = cache(async (slug: string) => {
  return prisma.knowledgePage.findUnique({
    where: { slug },
    include: { flashcards: { select: { id: true } } },
  })
})

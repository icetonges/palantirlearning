// lib/utils.ts — Utility functions
import crypto from 'crypto'

/** Generate a URL-safe slug from a title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-|-$/g, '')
}

/** Generate a dated slug: 2026-02-22-my-title */
export function generateDatedSlug(title: string, date?: Date): string {
  const d = date || new Date()
  const dateStr = d.toISOString().split('T')[0]
  return `${dateStr}-${generateSlug(title)}`
}

/** SHA-256 hash of a URL string (for dedup) */
export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex')
}

/** Truncate text to a maximum length with ellipsis */
export function truncate(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3).trimEnd() + '...'
}

/** Format a date as human-readable: "Feb 22, 2026" */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })
}

/** Format a date as relative time: "2 hours ago" */
export function timeAgo(date: Date | string): string {
  const now   = new Date()
  const then  = new Date(date)
  const diff  = now.getTime() - then.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)

  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return formatDate(date)
}

/** Group items by year-month for archive sidebar */
export function groupByYearMonth<T extends { createdAt: Date }>(
  items: T[]
): Record<string, Record<string, T[]>> {
  return items.reduce(
    (acc, item) => {
      const d     = new Date(item.createdAt)
      const year  = d.getFullYear().toString()
      const month = d.toLocaleString('en-US', { month: 'long' })
      if (!acc[year])         acc[year] = {}
      if (!acc[year][month])  acc[year][month] = []
      acc[year][month].push(item)
      return acc
    },
    {} as Record<string, Record<string, T[]>>
  )
}

/** Validate that the scraper request has a valid bearer token */
export function validateScraperToken(authHeader: string | null): boolean {
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '').trim()
  return token === process.env.SCRAPER_TOKEN
}

/** Extract plain text from markdown (for excerpts) */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|.*\|/g, '')
    .replace(/\n+/g, ' ')
    .trim()
}

/** Category label map */
export const CATEGORY_LABELS: Record<string, string> = {
  FOUNDRY:   'Foundry',
  ONTOLOGY:  'Ontology',
  AIP:       'AIP',
  APOLLO:    'Apollo',
  GENERAL:   'General',
  NEWS:      'News',
  RESOURCES: 'Resources',
}

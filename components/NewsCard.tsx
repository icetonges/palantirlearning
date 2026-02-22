'use client'
// components/NewsCard.tsx
import { timeAgo } from '@/lib/utils'

const TAG_COLORS: Record<string, string> = {
  FOUNDRY:     'bg-blue-900/40 text-blue-300 border-blue-700/40',
  ONTOLOGY:    'bg-violet-900/40 text-violet-300 border-violet-700/40',
  AIP:         'bg-cyan-900/40 text-cyan-300 border-cyan-700/40',
  APOLLO:      'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  CONTRACT:    'bg-green-900/40 text-green-300 border-green-700/40',
  EARNINGS:    'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  PARTNERSHIP: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  CRITICISM:   'bg-red-900/40 text-red-300 border-red-700/40',
  RELEASE:     'bg-palantir-900/40 text-palantir-300 border-palantir-700/40',
  GENERAL:     'bg-night-800 text-night-300 border-night-700',
}

interface NewsCardProps {
  title:      string
  summary:    string
  aiSummary?: string | null
  source:     string
  url:        string
  tags:       string[]
  scrapedAt:  Date | string
  featured?:  boolean
}

export default function NewsCard({
  title, summary, aiSummary, source, url, tags, scrapedAt, featured
}: NewsCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block group rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-night-900 ${
        featured
          ? 'border-palantir-600/50 bg-palantir-950/30 hover:border-palantir-500/60'
          : 'border-night-700 bg-night-900/40 hover:border-night-600'
      }`}
    >
      <div className="p-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${TAG_COLORS[tag] || TAG_COLORS.GENERAL}`}
            >
              {tag}
            </span>
          ))}
          {featured && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border bg-palantir-800/60 text-palantir-300 border-palantir-600/40 font-mono">
              FEATURED
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white text-sm font-semibold leading-snug mb-2 group-hover:text-palantir-200 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* AI Summary (preferred) or original */}
        <p className="text-night-300 text-xs leading-relaxed line-clamp-3">
          {aiSummary || summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-night-800">
          <span className="text-night-400 text-xs font-medium">{source}</span>
          <span className="text-night-500 text-xs">{timeAgo(scrapedAt)}</span>
        </div>
      </div>
    </a>
  )
}

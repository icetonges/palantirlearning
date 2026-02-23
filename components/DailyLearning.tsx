'use client'
// components/DailyLearning.tsx — Daily Learning Topic + Palantir 101 sections

import { useState, useEffect } from 'react'

interface DailyLesson {
  topicTitle:   string
  topicDomain:  string
  topicSubject: string
  topicBody:    string
  palantir101:  string
  cached?:      boolean
}

const DOMAIN_STYLE: Record<string, { badge: string; bar: string; icon: string }> = {
  FOUNDRY:  { badge: 'text-blue-300 bg-blue-900/30 border-blue-700/50',    bar: 'bg-blue-500',    icon: '⬡' },
  ONTOLOGY: { badge: 'text-violet-300 bg-violet-900/30 border-violet-700/50', bar: 'bg-violet-500', icon: '◈' },
  AIP:      { badge: 'text-cyan-300 bg-cyan-900/30 border-cyan-700/50',      bar: 'bg-cyan-400',    icon: '✦' },
  APOLLO:   { badge: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/50', bar: 'bg-emerald-500', icon: '◎' },
  GENERAL:  { badge: 'text-night-300 bg-night-800 border-night-700',         bar: 'bg-night-400',   icon: '◰' },
}

// ─── Markdown-to-JSX renderer (lightweight, no deps) ─────────────────────────
function renderBody(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={key++} className="text-white font-semibold text-base mt-5 mb-2 flex items-center gap-2">
          <span className="w-1 h-4 bg-palantir-500 rounded-full inline-block shrink-0" />
          {line.slice(3)}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={key++} className="text-white font-bold text-lg mt-4 mb-3">{line.slice(2)}</h2>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={key++} className="text-night-300 text-sm leading-relaxed ml-4 mb-1 list-disc">
          {inlineFormat(line.slice(2))}
        </li>
      )
    } else if (/^\d+\. /.test(line)) {
      elements.push(
        <li key={key++} className="text-night-300 text-sm leading-relaxed ml-4 mb-1 list-decimal">
          {inlineFormat(line.replace(/^\d+\. /, ''))}
        </li>
      )
    } else if (line.trim() === '') {
      // skip blank lines between paragraphs
    } else {
      elements.push(
        <p key={key++} className="text-night-300 text-sm leading-relaxed mb-3">
          {inlineFormat(line)}
        </p>
      )
    }
  }
  return elements
}

function inlineFormat(text: string): React.ReactNode {
  // Bold: **text** and inline code: `text`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="text-cyan-300 bg-night-800 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>
    }
    return part
  })
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-night-800 rounded ${i % 3 === 0 ? 'w-2/5' : i % 4 === 3 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  )
}

// ─── Daily Topic Section ──────────────────────────────────────────────────────
export function DailyTopicSection({ lesson, loading }: { lesson: DailyLesson | null; loading: boolean }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const s = lesson ? (DOMAIN_STYLE[lesson.topicDomain] || DOMAIN_STYLE.GENERAL) : DOMAIN_STYLE.FOUNDRY

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-700/40 flex items-center justify-center">
            <span className="text-amber-400 text-sm">◈</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Daily Learning Topic</h2>
            <p className="text-night-500 text-xs">{today} · Refreshes at midnight UTC</p>
          </div>
        </div>
        {lesson && !loading && (
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${s.badge}`}>
              {lesson.topicDomain}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded border font-mono text-night-400 bg-night-800 border-night-700">
              {lesson.topicSubject}
            </span>
          </div>
        )}
      </div>

      <div className="bg-night-900 border border-amber-900/30 hover:border-amber-800/40 rounded-2xl overflow-hidden transition-colors">
        {/* Color bar */}
        <div className={`h-0.5 w-full ${loading ? 'bg-night-800' : s.bar} opacity-60`} />

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-5 bg-night-800 rounded w-2/3 animate-pulse" />
              <Skeleton lines={8} />
            </div>
          ) : lesson ? (
            <>
              {/* Topic title */}
              <div className="flex items-start gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  lesson.topicDomain === 'FOUNDRY'  ? 'bg-blue-900/30 border border-blue-700/30' :
                  lesson.topicDomain === 'ONTOLOGY' ? 'bg-violet-900/30 border border-violet-700/30' :
                  lesson.topicDomain === 'AIP'      ? 'bg-cyan-900/30 border border-cyan-700/30' :
                  'bg-emerald-900/30 border border-emerald-700/30'
                }`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-night-500 text-xs font-mono mb-0.5">
                    {lesson.topicDomain} › {lesson.topicSubject}
                  </p>
                  <h3 className="text-white font-bold text-lg leading-tight">{lesson.topicTitle}</h3>
                </div>
              </div>

              {/* Body content */}
              <div className="prose-like space-y-0">
                {renderBody(lesson.topicBody)}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-night-500">
              <div className="text-3xl mb-3">◈</div>
              <p className="text-sm">Generating today&apos;s topic&hellip;</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Palantir 101 Section ─────────────────────────────────────────────────────
export function Palantir101Section({ lesson, loading }: { lesson: DailyLesson | null; loading: boolean }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-palantir-900/50 border border-palantir-700/40 flex items-center justify-center">
            <span className="text-palantir-400 text-sm font-bold">P</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Palantir 101</h2>
            <p className="text-night-500 text-xs">{today} · Tech stack deep-dive + learning strategy</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded border font-mono text-palantir-400 bg-palantir-900/20 border-palantir-700/40">
          Daily Overview
        </span>
      </div>

      <div className="bg-night-900 border border-palantir-900/40 hover:border-palantir-800/50 rounded-2xl overflow-hidden transition-colors">
        {/* Color bar */}
        <div className={`h-0.5 w-full ${loading ? 'bg-night-800' : 'bg-gradient-to-r from-palantir-600 to-cyan-500'} opacity-70`} />

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-5 bg-night-800 rounded w-1/2 animate-pulse" />
              <Skeleton lines={9} />
            </div>
          ) : lesson ? (
            <div className="space-y-0">
              {renderBody(lesson.palantir101)}
            </div>
          ) : (
            <div className="py-8 text-center text-night-500">
              <div className="text-3xl mb-3 text-palantir-700">P</div>
              <p className="text-sm">Generating Palantir 101&hellip;</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Combined loader (fetches once, shares data) ──────────────────────────────
export function DailyLearningBlock() {
  const [lesson,  setLesson]  = useState<DailyLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    fetch('/api/daily-lesson')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (data.error) {
          console.error('[DailyLearning] API error:', data.detail || data.error)
          setError(true)
          return
        }
        setLesson(data)
      })
      .catch((err) => {
        console.error('[DailyLearning] Fetch failed:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-10">
      {error ? (
        <div className="p-4 bg-night-900 border border-night-800 rounded-xl text-center text-night-500 text-sm">
          <span className="text-amber-500 mr-2">⚠</span>
          Daily content unavailable — Gemini API key may not be configured.
        </div>
      ) : (
        <>
          <DailyTopicSection  lesson={lesson} loading={loading} />
          <Palantir101Section lesson={lesson} loading={loading} />
        </>
      )}
    </div>
  )
}

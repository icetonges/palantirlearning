'use client'
// components/DailyLearning.tsx — Text-only daily sections. Palantir 101 first, then Daily Topic.

import { useState, useEffect } from 'react'

interface DailyLesson {
  topicTitle:   string
  topicDomain:  string
  topicSubject: string
  topicBody:    string
  palantir101:  string
}

const DC: Record<string, { badge: string; bar: string; border: string; text: string; icon: string }> = {
  FOUNDRY:  { badge: 'text-blue-300 bg-blue-900/30 border-blue-700/50',    bar: 'from-blue-600 to-blue-400',       border: 'border-blue-900/40',    text: 'text-blue-300',    icon: '⬡' },
  ONTOLOGY: { badge: 'text-violet-300 bg-violet-900/30 border-violet-700/50', bar: 'from-violet-600 to-violet-400', border: 'border-violet-900/40',  text: 'text-violet-300',  icon: '◈' },
  AIP:      { badge: 'text-cyan-300 bg-cyan-900/30 border-cyan-700/50',      bar: 'from-cyan-600 to-cyan-400',       border: 'border-cyan-900/40',    text: 'text-cyan-300',    icon: '✦' },
  APOLLO:   { badge: 'text-emerald-300 bg-emerald-900/30 border-emerald-700/50', bar: 'from-emerald-600 to-emerald-400', border: 'border-emerald-900/40', text: 'text-emerald-300', icon: '◎' },
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3 py-2">
      <div className="h-3.5 bg-night-800 rounded w-2/5" />
      <div className="h-3 bg-night-800 rounded w-full" />
      <div className="h-3 bg-night-800 rounded w-5/6" />
      <div className="h-3 bg-night-800 rounded w-full" />
      <div className="h-3 bg-night-800 rounded w-4/5" />
      <div className="h-3.5 bg-night-800 rounded w-1/3 mt-4" />
      <div className="h-3 bg-night-800 rounded w-full" />
      <div className="h-3 bg-night-800 rounded w-full" />
      <div className="h-3 bg-night-800 rounded w-3/4" />
    </div>
  )
}

// Lightweight markdown → React (headers, bold, inline code, bullets)
function Prose({ text, headingClass }: { text: string; headingClass: string }) {
  const nodes: React.ReactNode[] = []
  let k = 0
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={k++} className={`flex items-center gap-2 text-sm font-semibold mt-5 mb-2 ${headingClass}`}>
          <span className="w-1 h-3.5 rounded-full bg-current opacity-50 shrink-0 inline-block" />
          {line.slice(3)}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      nodes.push(<h2 key={k++} className="text-white font-bold text-base mt-4 mb-2">{line.slice(2)}</h2>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push(
        <li key={k++} className="text-night-300 text-sm leading-relaxed ml-4 mb-1 list-disc">{fmt(line.slice(2))}</li>
      )
    } else if (line.trim()) {
      nodes.push(<p key={k++} className="text-night-300 text-sm leading-relaxed mb-2">{fmt(line)}</p>)
    }
  }
  return <>{nodes}</>
}

function fmt(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="text-cyan-300 bg-night-800 px-1 py-0.5 rounded text-xs font-mono">{p.slice(1, -1)}</code>
    return p
  })
}

// ─── Palantir 101 ─────────────────────────────────────────────────────────────
export function Palantir101Section({ lesson, loading }: { lesson: DailyLesson | null; loading: boolean }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-palantir-900/50 border border-palantir-700/40 flex items-center justify-center">
          <span className="text-palantir-400 text-xs font-bold">P</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-none">Palantir 101</h2>
          <p className="text-night-600 text-[10px] mt-0.5">{today} · Tech stack + learning strategy</p>
        </div>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded border font-mono text-palantir-400 bg-palantir-900/20 border-palantir-700/40">Daily</span>
      </div>

      <div className="bg-night-900 border border-palantir-900/40 rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-palantir-600 via-cyan-500 to-blue-500 opacity-70" />
        <div className="px-6 py-5">
          {loading
            ? <Skeleton />
            : lesson
              ? <Prose text={lesson.palantir101} headingClass="text-palantir-300" />
              : <p className="text-night-500 text-sm text-center py-6">Generating Palantir 101…</p>
          }
        </div>
      </div>
    </section>
  )
}

// ─── Daily Learning Topic ─────────────────────────────────────────────────────
export function DailyTopicSection({ lesson, loading }: { lesson: DailyLesson | null; loading: boolean }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const dc = lesson ? (DC[lesson.topicDomain] || DC.FOUNDRY) : DC.FOUNDRY

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-900/40 border border-amber-700/40 flex items-center justify-center">
          <span className="text-amber-400 text-xs">◈</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-none">Daily Learning Topic</h2>
          <p className="text-night-600 text-[10px] mt-0.5">{today} · Refreshes at midnight UTC</p>
        </div>
        {lesson && !loading && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${dc.badge}`}>{lesson.topicDomain}</span>
            <span className="text-[10px] px-2 py-0.5 rounded border font-mono text-night-400 bg-night-800 border-night-700">{lesson.topicSubject}</span>
          </div>
        )}
      </div>

      <div className={`bg-night-900 border ${loading ? 'border-night-800' : dc.border} rounded-2xl overflow-hidden`}>
        <div className={`h-0.5 bg-gradient-to-r ${dc.bar} opacity-60`} />
        <div className="px-6 py-5">
          {loading ? (
            <Skeleton />
          ) : lesson ? (
            <>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-night-800">
                <span className={`text-xl ${dc.text}`}>{dc.icon}</span>
                <div>
                  <p className="text-night-600 text-[10px] font-mono">{lesson.topicDomain} › {lesson.topicSubject}</p>
                  <h3 className="text-white font-bold text-base leading-tight">{lesson.topicTitle}</h3>
                </div>
              </div>
              <Prose text={lesson.topicBody} headingClass={dc.text} />
            </>
          ) : (
            <p className="text-night-500 text-sm text-center py-6">Generating today&apos;s topic…</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Combined block ───────────────────────────────────────────────────────────
export function DailyLearningBlock() {
  const [lesson,  setLesson]  = useState<DailyLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [errDetail, setErrDetail] = useState('')

  useEffect(() => {
    fetch('/api/daily-lesson')
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setErrDetail(`${data.error}: ${data.detail || ''}`)
          setError(true)
          return
        }
        setLesson(data)
      })
      .catch(e => { setErrDetail(String(e)); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  if (error) return (
    <div className="p-4 bg-night-900 border border-amber-900/40 rounded-xl text-center space-y-1">
      <p className="text-amber-400 text-sm font-medium">⚠ Daily content unavailable</p>
      <p className="text-night-500 text-xs font-mono break-all">{errDetail || 'Unknown error'}</p>
    </div>
  )

  return (
    <div className="space-y-8">
      <Palantir101Section lesson={lesson} loading={loading} />
      <DailyTopicSection  lesson={lesson} loading={loading} />
    </div>
  )
}

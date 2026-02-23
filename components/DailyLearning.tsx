'use client'
// components/DailyLearning.tsx
// Text is the primary content. Visuals (diagrams, flow maps, code) are enrichment
// layered alongside — if visuals fail to generate, text still reads perfectly.

import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProcessStep { step: number; title: string; desc: string }
interface Connection  { from: string; to: string; label: string }
interface TopicVisuals {
  processSteps: ProcessStep[]
  connections:  Connection[]
  codeSnippet:  string
  keyTags:      string[]
}
interface DataFlowStage  { stage: string; detail: string }
interface LearningStep   { week: string; focus: string; action: string }
interface StackItem      { name: string; icon: string; color: string; role: string }
interface P101Visuals {
  dataFlow:     DataFlowStage[]
  learningPath: LearningStep[]
  insight:      string
  stackSummary: StackItem[]
}
interface DailyLesson {
  topicTitle:   string
  topicDomain:  string
  topicSubject: string
  topicBody:    string   // JSON: { prose: string, visuals: TopicVisuals|null }
  palantir101:  string   // JSON: { prose: string, visuals: P101Visuals|null }
}

// ─── Color tokens ─────────────────────────────────────────────────────────────
const DC: Record<string, { bg: string; border: string; text: string; bar: string; icon: string }> = {
  FOUNDRY:  { bg: 'bg-blue-900/20',    border: 'border-blue-700/40',    text: 'text-blue-300',    bar: 'from-blue-600 to-blue-400',       icon: '⬡' },
  ONTOLOGY: { bg: 'bg-violet-900/20',  border: 'border-violet-700/40',  text: 'text-violet-300',  bar: 'from-violet-600 to-violet-400',   icon: '◈' },
  AIP:      { bg: 'bg-cyan-900/20',    border: 'border-cyan-700/40',    text: 'text-cyan-300',    bar: 'from-cyan-600 to-cyan-400',       icon: '✦' },
  APOLLO:   { bg: 'bg-emerald-900/20', border: 'border-emerald-700/40', text: 'text-emerald-300', bar: 'from-emerald-600 to-emerald-400', icon: '◎' },
}
const SC: Record<string, string> = {
  blue:    'bg-blue-900/30 border-blue-600/50 text-blue-200',
  violet:  'bg-violet-900/30 border-violet-600/50 text-violet-200',
  cyan:    'bg-cyan-900/30 border-cyan-600/50 text-cyan-200',
  emerald: 'bg-emerald-900/30 border-emerald-600/50 text-emerald-200',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-night-800 rounded w-2/5"/>
      <div className="h-3 bg-night-800 rounded w-full"/>
      <div className="h-3 bg-night-800 rounded w-5/6"/>
      <div className="h-3 bg-night-800 rounded w-full"/>
      <div className="grid grid-cols-4 gap-2 pt-1">
        {[...Array(4)].map((_,i)=><div key={i} className="h-16 bg-night-800 rounded-xl"/>)}
      </div>
      <div className="h-3 bg-night-800 rounded w-full"/>
      <div className="h-3 bg-night-800 rounded w-4/5"/>
      <div className="flex gap-2 pt-1">
        {[...Array(4)].map((_,i)=><div key={i} className="h-7 flex-1 bg-night-800 rounded"/>)}
      </div>
      <div className="h-3 bg-night-800 rounded w-full"/>
      <div className="h-3 bg-night-800 rounded w-3/4"/>
    </div>
  )
}

// ─── Prose renderer (markdown → React) ────────────────────────────────────────
function Prose({ text, accentClass }: { text: string; accentClass: string }) {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let k = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={k++} className={`flex items-center gap-2 font-semibold text-sm mt-5 mb-2 ${accentClass}`}>
          <span className="w-1 h-3.5 rounded-full bg-current opacity-60 inline-block shrink-0"/>
          {line.slice(3)}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      nodes.push(<h2 key={k++} className="text-white font-bold text-base mt-4 mb-2">{line.slice(2)}</h2>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push(
        <li key={k++} className="text-night-300 text-sm leading-relaxed ml-4 mb-1 list-disc">
          {fmt(line.slice(2))}
        </li>
      )
    } else if (line.trim()) {
      nodes.push(<p key={k++} className="text-night-300 text-sm leading-relaxed mb-2">{fmt(line)}</p>)
    }
  }
  return <>{nodes}</>
}

function fmt(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{p.slice(2,-2)}</strong>
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="text-cyan-300 bg-night-800 px-1 py-0.5 rounded text-xs font-mono">{p.slice(1,-1)}</code>
    return p
  })
}

// ─── Visual widgets ───────────────────────────────────────────────────────────

// Stack architecture diagram
function StackDiagram({ items }: { items: StackItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-2 relative">
      {/* dashed connectors */}
      <div className="absolute top-1/2 left-[22%] right-[22%] h-px border-t border-dashed border-night-700 -translate-y-1/2 pointer-events-none"/>
      {items.map(n => (
        <div key={n.name} className={`border rounded-xl p-3 text-center relative ${SC[n.color] || SC.blue}`}>
          <div className="text-xl mb-0.5">{n.icon}</div>
          <div className="font-bold text-xs">{n.name}</div>
          <div className="text-[9px] opacity-60 leading-tight mt-0.5">{n.role}</div>
        </div>
      ))}
    </div>
  )
}

// Data flow pipeline
function DataFlow({ stages }: { stages: DataFlowStage[] }) {
  const cls = [
    'text-night-400 bg-night-800/60 border-night-700',
    'text-blue-300 bg-blue-900/20 border-blue-700/40',
    'text-violet-300 bg-violet-900/20 border-violet-700/40',
    'text-cyan-300 bg-cyan-900/20 border-cyan-700/40',
  ]
  return (
    <div className="flex items-stretch gap-1">
      {stages.map((s, i) => (
        <div key={s.stage} className="flex items-center gap-1 flex-1">
          <div className={`flex-1 px-2 py-2 rounded-lg border text-center ${cls[i % cls.length]}`}>
            <div className="font-bold text-xs">{s.stage}</div>
            <div className="text-[9px] opacity-60 mt-0.5 leading-tight">{s.detail}</div>
          </div>
          {i < stages.length - 1 && <span className="text-night-700 text-[10px] shrink-0">→</span>}
        </div>
      ))}
    </div>
  )
}

// Process flow steps
function ProcessFlow({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="flex items-start gap-1">
      {steps.map((s, i) => (
        <div key={s.step} className="flex items-start gap-1 flex-1">
          <div className="flex-1 bg-night-800/50 border border-night-800 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-4 h-4 rounded-full bg-palantir-800 border border-palantir-600/60 flex items-center justify-center text-[9px] font-bold text-palantir-300 shrink-0">{s.step}</span>
              <span className="text-white text-[10px] font-semibold leading-tight">{s.title}</span>
            </div>
            <p className="text-night-500 text-[10px] leading-relaxed pl-5">{s.desc}</p>
          </div>
          {i < steps.length - 1 && <span className="text-night-700 text-[10px] mt-3 shrink-0">→</span>}
        </div>
      ))}
    </div>
  )
}

// Connection map
function Connections({ nodes }: { nodes: Connection[] }) {
  return (
    <div className="space-y-1.5">
      {nodes.map((n, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px]">
          <span className="flex-1 text-center px-2 py-1 bg-night-800 border border-night-700 rounded font-mono text-night-200">{n.from}</span>
          <span className="text-night-600 italic shrink-0 text-[9px] w-12 text-center">{n.label}</span>
          <span className="text-night-700 shrink-0">→</span>
          <span className="flex-1 text-center px-2 py-1 bg-palantir-900/30 border border-palantir-700/40 rounded font-mono text-palantir-300">{n.to}</span>
        </div>
      ))}
    </div>
  )
}

// Code block
function Code({ code }: { code: string }) {
  return (
    <div className="bg-night-950 border border-night-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-night-800 bg-night-900/50">
        <span className="w-2 h-2 rounded-full bg-red-500/50"/>
        <span className="w-2 h-2 rounded-full bg-amber-500/50"/>
        <span className="w-2 h-2 rounded-full bg-green-500/50"/>
        <span className="text-night-700 text-[9px] font-mono ml-1">code example</span>
      </div>
      <pre className="p-3 text-[11px] text-cyan-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Learning path cards
function LearningPath({ steps }: { steps: LearningStep[] }) {
  const cls = [
    'border-palantir-600/50 bg-palantir-900/20',
    'border-cyan-600/50 bg-cyan-900/20',
    'border-violet-600/50 bg-violet-900/20',
  ]
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((s, i) => (
        <div key={i} className={`border rounded-xl p-3 relative ${cls[i]}`}>
          <div className="absolute -top-2.5 left-3">
            <span className="text-[9px] font-mono px-2 py-0.5 bg-night-900 border border-night-700 rounded-full text-night-500">{s.week}</span>
          </div>
          <div className="mt-1 font-semibold text-white text-[11px] mb-1">{s.focus}</div>
          <div className="text-night-400 text-[10px] leading-relaxed">{s.action}</div>
        </div>
      ))}
    </div>
  )
}

// Tag row
function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(t => (
        <span key={t} className="text-[10px] px-2 py-0.5 bg-night-800 border border-night-700 rounded-full text-night-400 font-mono">#{t}</span>
      ))}
    </div>
  )
}

// ─── Palantir 101 Section ─────────────────────────────────────────────────────
export function Palantir101Section({ lesson, loading }: { lesson: DailyLesson | null; loading: boolean }) {
  let prose = ''
  let visuals: P101Visuals | null = null

  if (lesson?.palantir101) {
    try {
      const parsed = JSON.parse(lesson.palantir101)
      prose   = parsed.prose   || lesson.palantir101  // fallback: treat as raw text
      visuals = parsed.visuals || null
    } catch {
      prose = lesson.palantir101  // old format: plain prose
    }
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-palantir-900/50 border border-palantir-700/40 flex items-center justify-center">
          <span className="text-palantir-400 text-xs font-bold">P</span>
        </div>
        <h2 className="text-lg font-bold text-white">Palantir 101</h2>
        <span className="text-[10px] px-2 py-0.5 rounded border font-mono text-palantir-400 bg-palantir-900/20 border-palantir-700/40">Daily Overview</span>
        <span className="text-night-600 text-xs ml-auto">Refreshes daily</span>
      </div>

      <div className="bg-night-900 border border-palantir-900/40 rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-palantir-600 via-cyan-500 to-blue-500 opacity-70"/>
        <div className="p-6">
          {loading ? <Skel/> : prose ? (
            <div className="space-y-5">

              {/* Stack diagram — sits right at top as orientation visual */}
              {visuals?.stackSummary && (
                <div>
                  <p className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Tech Stack at a Glance</p>
                  <StackDiagram items={visuals.stackSummary}/>
                </div>
              )}

              {/* Primary prose content */}
              <div className="prose-area">
                <Prose text={prose} accentClass="text-palantir-300"/>
              </div>

              {/* Data flow — visual enrichment after the text explains it */}
              {visuals?.dataFlow && (
                <div className="pt-1">
                  <p className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Foundry Data Pipeline</p>
                  <DataFlow stages={visuals.dataFlow}/>
                </div>
              )}

              {/* Learning path */}
              {visuals?.learningPath && (
                <div>
                  <p className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-3">Recommended Study Path</p>
                  <LearningPath steps={visuals.learningPath}/>
                </div>
              )}

              {/* Insight callout */}
              {visuals?.insight && (
                <div className="flex gap-3 p-3.5 bg-palantir-950/60 border border-palantir-800/40 rounded-xl">
                  <span className="text-lg shrink-0">💡</span>
                  <div>
                    <p className="text-palantir-300 text-xs font-semibold mb-0.5">The Key Insight</p>
                    <p className="text-night-300 text-sm leading-relaxed">{visuals.insight}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-night-500 text-sm text-center py-6">Generating Palantir 101…</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Daily Topic Section ──────────────────────────────────────────────────────
export function DailyTopicSection({ lesson, loading }: { lesson: DailyLesson | null; loading: boolean }) {
  let prose = ''
  let visuals: TopicVisuals | null = null

  if (lesson?.topicBody) {
    try {
      const parsed = JSON.parse(lesson.topicBody)
      prose   = parsed.prose   || lesson.topicBody
      visuals = parsed.visuals || null
    } catch {
      prose = lesson.topicBody
    }
  }

  const dc = lesson ? (DC[lesson.topicDomain] || DC.FOUNDRY) : DC.FOUNDRY

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-900/40 border border-amber-700/40 flex items-center justify-center">
          <span className="text-amber-400 text-xs">◈</span>
        </div>
        <h2 className="text-lg font-bold text-white">Daily Learning Topic</h2>
        {lesson && !loading && (
          <>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${dc.text} ${dc.bg} ${dc.border}`}>{lesson.topicDomain}</span>
            <span className="text-[10px] px-2 py-0.5 rounded border font-mono text-night-400 bg-night-800 border-night-700">{lesson.topicSubject}</span>
          </>
        )}
        <span className="text-night-600 text-xs ml-auto">Refreshes daily</span>
      </div>

      <div className={`bg-night-900 border ${loading ? 'border-night-800' : dc.border} rounded-2xl overflow-hidden`}>
        <div className={`h-0.5 bg-gradient-to-r ${dc.bar} opacity-60`}/>
        <div className="p-6">
          {loading ? <Skel/> : prose ? (
            <div className="space-y-5">

              {/* Topic header */}
              <div className="flex items-start gap-3 pb-4 border-b border-night-800">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${dc.bg} border ${dc.border}`}>{dc.icon}</div>
                <div className="flex-1">
                  <p className="text-night-600 text-[10px] font-mono mb-0.5">{lesson?.topicDomain} › {lesson?.topicSubject}</p>
                  <h3 className="text-white font-bold text-base leading-tight">{lesson?.topicTitle}</h3>
                  {/* Key tags as visual chips */}
                  {visuals?.keyTags && <Tags tags={visuals.keyTags}/>}
                </div>
              </div>

              {/* Process flow sits BEFORE the prose — gives reader a mental map first */}
              {visuals?.processSteps && (
                <div>
                  <p className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">How It Works — Process Flow</p>
                  <ProcessFlow steps={visuals.processSteps}/>
                </div>
              )}

              {/* Primary prose — the real learning content */}
              <div className="prose-area">
                <Prose text={prose} accentClass={dc.text}/>
              </div>

              {/* Connection map + code — visual enrichment after text explains context */}
              {(visuals?.connections || visuals?.codeSnippet) && (
                <div className="grid grid-cols-2 gap-4 pt-1">
                  {visuals?.connections && (
                    <div>
                      <p className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Data Connections</p>
                      <Connections nodes={visuals.connections}/>
                    </div>
                  )}
                  {visuals?.codeSnippet && (
                    <div>
                      <p className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Code Pattern</p>
                      <Code code={visuals.codeSnippet}/>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-night-500 text-sm text-center py-6">Generating today&apos;s topic…</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Combined loader ──────────────────────────────────────────────────────────
export function DailyLearningBlock() {
  const [lesson,  setLesson]  = useState<DailyLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    fetch('/api/daily-lesson')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => { if (data.error) { setError(true); return }; setLesson(data) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (error) return (
    <div className="p-4 bg-night-900 border border-amber-900/40 rounded-xl text-center">
      <p className="text-amber-400 text-sm font-medium mb-1">⚠ Daily content unavailable</p>
      <p className="text-night-500 text-xs">Gemini API key not configured or unreachable</p>
    </div>
  )

  return (
    <div className="space-y-8">
      <Palantir101Section lesson={lesson} loading={loading}/>
      <DailyTopicSection  lesson={lesson} loading={loading}/>
    </div>
  )
}

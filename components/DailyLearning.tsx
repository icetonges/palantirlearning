'use client'
// components/DailyLearning.tsx — Visual Daily Learning: Palantir 101 + Daily Topic

import { useState, useEffect } from 'react'

interface StackNode   { name: string; icon: string; role: string; color: string; connects: string[] }
interface DataFlowStage { stage: string; label: string; detail: string }
interface LearningStep  { week: string; focus: string; action: string; why: string }
interface P101Data { tagline: string; stack: StackNode[]; dataFlow: DataFlowStage[]; learningPath: LearningStep[]; insight: string }

interface ConnectionNode { from: string; to: string; label: string }
interface ProcessStep    { step: number; title: string; desc: string }
interface KeyPoint       { icon: string; title: string; body: string }
interface TopicData { headline: string; connectionMap: ConnectionNode[]; processSteps: ProcessStep[]; keyPoints: KeyPoint[]; codeSnippet: string }

interface DailyLesson {
  topicTitle: string; topicDomain: string; topicSubject: string
  topicBody: string; palantir101: string; cached?: boolean
}

const DC: Record<string, { bg: string; border: string; text: string; bar: string; icon: string }> = {
  FOUNDRY:  { bg: 'bg-blue-900/20',    border: 'border-blue-700/40',    text: 'text-blue-300',    bar: 'from-blue-600 to-blue-400',       icon: '⬡' },
  ONTOLOGY: { bg: 'bg-violet-900/20',  border: 'border-violet-700/40',  text: 'text-violet-300',  bar: 'from-violet-600 to-violet-400',   icon: '◈' },
  AIP:      { bg: 'bg-cyan-900/20',    border: 'border-cyan-700/40',    text: 'text-cyan-300',    bar: 'from-cyan-600 to-cyan-400',       icon: '✦' },
  APOLLO:   { bg: 'bg-emerald-900/20', border: 'border-emerald-700/40', text: 'text-emerald-300', bar: 'from-emerald-600 to-emerald-400', icon: '◎' },
}
const SC: Record<string, { bg: string; border: string; text: string }> = {
  blue:    { bg: 'bg-blue-900/30',    border: 'border-blue-600/50',    text: 'text-blue-200'    },
  violet:  { bg: 'bg-violet-900/30',  border: 'border-violet-600/50',  text: 'text-violet-200'  },
  cyan:    { bg: 'bg-cyan-900/30',    border: 'border-cyan-600/50',    text: 'text-cyan-200'    },
  emerald: { bg: 'bg-emerald-900/30', border: 'border-emerald-600/50', text: 'text-emerald-200' },
}

function Skel() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-night-800 rounded w-3/5" />
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_,i)=><div key={i} className="h-24 bg-night-800 rounded-xl"/>)}</div>
      <div className="flex gap-2">{[...Array(4)].map((_,i)=><div key={i} className="h-8 flex-1 bg-night-800 rounded-lg"/>)}</div>
      <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_,i)=><div key={i} className="h-20 bg-night-800 rounded-xl"/>)}</div>
    </div>
  )
}

function StackDiagram({ stack }: { stack: StackNode[] }) {
  return (
    <div className="relative">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:0}} aria-hidden>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="rgba(99,102,241,0.4)"/>
          </marker>
        </defs>
        <line x1="22%" y1="50%" x2="36%" y2="50%" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arr)"/>
        <line x1="52%" y1="50%" x2="66%" y2="50%" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arr)"/>
        <line x1="82%" y1="50%" x2="96%" y2="50%" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#arr)"/>
      </svg>
      <div className="relative grid grid-cols-4 gap-3" style={{zIndex:1}}>
        {stack.map(n => {
          const c = SC[n.color] || SC.blue
          return (
            <div key={n.name} className={`${c.bg} ${c.border} border rounded-xl p-3 text-center`}>
              <div className={`text-2xl mb-1 ${c.text}`}>{n.icon}</div>
              <div className={`font-bold text-sm ${c.text}`}>{n.name}</div>
              <div className="text-night-500 text-[10px] leading-tight mt-1">{n.role}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DataFlowDiagram({ stages }: { stages: DataFlowStage[] }) {
  const colors = ['text-night-400 bg-night-800/60 border-night-700','text-blue-300 bg-blue-900/20 border-blue-700/40','text-violet-300 bg-violet-900/20 border-violet-700/40','text-cyan-300 bg-cyan-900/20 border-cyan-700/40']
  return (
    <div className="flex items-stretch gap-1">
      {stages.map((s, i) => (
        <div key={s.stage} className="flex items-center gap-1 flex-1">
          <div className={`flex-1 px-2 py-2.5 rounded-lg border text-center ${colors[i % colors.length]}`}>
            <div className="font-bold text-xs">{s.stage}</div>
            <div className="text-[9px] opacity-60 mt-0.5 leading-tight">{s.detail}</div>
          </div>
          {i < stages.length - 1 && <span className="text-night-700 text-xs shrink-0">→</span>}
        </div>
      ))}
    </div>
  )
}

function LearningPathDiagram({ steps }: { steps: LearningStep[] }) {
  const colors = ['border-palantir-600/50 bg-palantir-900/20','border-cyan-600/50 bg-cyan-900/20','border-violet-600/50 bg-violet-900/20']
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((s, i) => (
        <div key={i} className={`${colors[i]} border rounded-xl p-3 relative`}>
          <div className="absolute -top-2.5 left-3">
            <span className="text-[9px] font-mono px-2 py-0.5 bg-night-900 border border-night-700 rounded-full text-night-500">{s.week}</span>
          </div>
          <div className="mt-1 font-semibold text-white text-xs mb-1">{s.focus}</div>
          <div className="text-night-400 text-[10px] leading-relaxed mb-1.5">{s.action}</div>
          <div className="text-[9px] text-night-600 italic">↳ {s.why}</div>
        </div>
      ))}
    </div>
  )
}

function ProcessFlowDiagram({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="flex items-start gap-1">
      {steps.map((s, i) => (
        <div key={s.step} className="flex items-start gap-1 flex-1">
          <div className="flex-1 bg-night-800/40 border border-night-800 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-palantir-800 border border-palantir-600/60 flex items-center justify-center shrink-0">
                <span className="text-palantir-300 text-[9px] font-bold">{s.step}</span>
              </div>
              <span className="text-white text-[10px] font-semibold">{s.title}</span>
            </div>
            <p className="text-night-500 text-[10px] leading-relaxed pl-6">{s.desc}</p>
          </div>
          {i < steps.length - 1 && <span className="text-night-700 text-xs mt-3 shrink-0">→</span>}
        </div>
      ))}
    </div>
  )
}

function ConnectionMapDiagram({ nodes }: { nodes: ConnectionNode[] }) {
  return (
    <div className="space-y-1.5">
      {nodes.map((n, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-night-200 font-mono text-[10px] px-2 py-1 bg-night-800 border border-night-700 rounded flex-1 text-center">{n.from}</span>
          <div className="flex flex-col items-center shrink-0">
            <span className="text-night-600 text-[8px] italic">{n.label}</span>
            <span className="text-night-600 text-xs">→</span>
          </div>
          <span className="text-palantir-300 font-mono text-[10px] px-2 py-1 bg-palantir-900/30 border border-palantir-700/40 rounded flex-1 text-center">{n.to}</span>
        </div>
      ))}
    </div>
  )
}

function KeyPointCards({ points }: { points: KeyPoint[] }) {
  const borders = ['border-palantir-700/40','border-blue-700/40','border-amber-700/40','border-cyan-700/40']
  return (
    <div className="grid grid-cols-2 gap-2">
      {points.map((p, i) => (
        <div key={i} className={`p-3 bg-night-800/40 border ${borders[i % borders.length]} rounded-xl`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base leading-none">{p.icon}</span>
            <span className="text-white font-semibold text-xs">{p.title}</span>
          </div>
          <p className="text-night-400 text-[11px] leading-relaxed">{p.body}</p>
        </div>
      ))}
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="bg-night-950 border border-night-800 rounded-xl overflow-hidden h-full">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-night-800">
        <span className="w-2 h-2 rounded-full bg-red-500/50"/>
        <span className="w-2 h-2 rounded-full bg-amber-500/50"/>
        <span className="w-2 h-2 rounded-full bg-green-500/50"/>
        <span className="text-night-700 text-[9px] font-mono ml-1">example</span>
      </div>
      <pre className="p-3 text-[10px] text-cyan-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap"><code>{code}</code></pre>
    </div>
  )
}

export function Palantir101Section({ lesson, loading }: { lesson: DailyLesson | null; loading: boolean }) {
  let data: P101Data | null = null
  if (lesson?.palantir101) { try { data = JSON.parse(lesson.palantir101) } catch {} }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-palantir-900/50 border border-palantir-700/40 flex items-center justify-center">
          <span className="text-palantir-400 text-xs font-bold">P</span>
        </div>
        <h2 className="text-lg font-bold text-white">Palantir 101</h2>
        <span className="text-[10px] px-2 py-0.5 rounded border font-mono text-palantir-400 bg-palantir-900/20 border-palantir-700/40">Daily Overview</span>
      </div>

      <div className="bg-night-900 border border-palantir-900/40 rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-palantir-600 via-cyan-500 to-blue-500 opacity-70"/>
        <div className="p-5 space-y-5">
          {loading ? <Skel/> : data ? (
            <>
              <p className="text-night-200 text-sm">{data.tagline}</p>

              <div>
                <div className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Tech Stack Architecture</div>
                <StackDiagram stack={data.stack}/>
              </div>

              <div>
                <div className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Foundry Data Flow</div>
                <DataFlowDiagram stages={data.dataFlow}/>
              </div>

              <div>
                <div className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-3">Recommended Learning Path</div>
                <LearningPathDiagram steps={data.learningPath}/>
              </div>

              <div className="flex gap-3 p-3 bg-palantir-950/50 border border-palantir-800/40 rounded-xl">
                <span className="text-xl shrink-0">💡</span>
                <div>
                  <div className="text-palantir-300 text-xs font-semibold mb-0.5">Key Insight</div>
                  <p className="text-night-300 text-xs leading-relaxed">{data.insight}</p>
                </div>
              </div>
            </>
          ) : <div className="py-6 text-center text-night-500 text-sm">Generating Palantir 101…</div>}
        </div>
      </div>
    </section>
  )
}

export function DailyTopicSection({ lesson, loading }: { lesson: DailyLesson | null; loading: boolean }) {
  let data: TopicData | null = null
  if (lesson?.topicBody) { try { data = JSON.parse(lesson.topicBody) } catch {} }
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
        <div className="p-5 space-y-5">
          {loading ? <Skel/> : (lesson && data) ? (
            <>
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${dc.bg} border ${dc.border}`}>{dc.icon}</div>
                <div>
                  <p className="text-night-600 text-[10px] font-mono mb-0.5">{lesson.topicDomain} › {lesson.topicSubject}</p>
                  <h3 className="text-white font-bold text-base leading-tight">{lesson.topicTitle}</h3>
                  <p className={`${dc.text} text-xs mt-1`}>{data.headline}</p>
                </div>
              </div>

              {/* Process Flow */}
              <div>
                <div className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Process Flow</div>
                <ProcessFlowDiagram steps={data.processSteps}/>
              </div>

              {/* Connection Map + Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Data Connections</div>
                  <ConnectionMapDiagram nodes={data.connectionMap}/>
                </div>
                <div>
                  <div className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Code Pattern</div>
                  <CodeBlock code={data.codeSnippet}/>
                </div>
              </div>

              {/* Key Points */}
              <div>
                <div className="text-night-600 text-[10px] font-mono uppercase tracking-widest mb-2">Key Concepts</div>
                <KeyPointCards points={data.keyPoints}/>
              </div>
            </>
          ) : <div className="py-6 text-center text-night-500 text-sm">Generating today&apos;s topic…</div>}
        </div>
      </div>
    </section>
  )
}

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
    <div className="p-4 bg-night-900 border border-night-800 rounded-xl text-center text-night-500 text-sm">
      <span className="text-amber-500 mr-2">⚠</span>Daily content unavailable — check Gemini API key.
    </div>
  )

  return (
    <div className="space-y-8">
      <Palantir101Section lesson={lesson} loading={loading}/>
      <DailyTopicSection  lesson={lesson} loading={loading}/>
    </div>
  )
}

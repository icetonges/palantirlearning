'use client'
// app/study/page.tsx — Study Hub: Flashcards + Quiz + Progress

import { useState, useEffect, useCallback } from 'react'
import FlashcardDeck from '@/components/FlashcardDeck'
import QuizEngine from '@/components/QuizEngine'

type StudyMode = 'pick' | 'flashcards' | 'quiz' | 'progress'

const CATEGORIES = ['ALL', 'FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO']
const CAT_COLORS: Record<string, string> = {
  ALL:      'text-night-300',
  FOUNDRY:  'text-blue-400',
  ONTOLOGY: 'text-violet-400',
  AIP:      'text-cyan-400',
  APOLLO:   'text-emerald-400',
}

interface Flashcard {
  id: string; question: string; answer: string; difficulty: string; category: string; subCategory: string | null
}

interface QuizQuestion { question: string; options: string[]; correctIndex: number; explanation: string }

interface ProgressRecord {
  category: string; score: number; total: number; percentage: number; takenAt: string
}

export default function StudyPage() {
  const [mode,         setMode]         = useState<StudyMode>('pick')
  const [category,     setCategory]     = useState('ALL')
  const [flashcards,   setFlashcards]   = useState<Flashcard[]>([])
  const [quizQs,       setQuizQs]       = useState<QuizQuestion[]>([])
  const [progress,     setProgress]     = useState<ProgressRecord[]>([])
  const [generating,   setGenerating]   = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [genError,     setGenError]     = useState('')
  const [totalCards,   setTotalCards]   = useState(0)

  // Load stats on mount
  useEffect(() => {
    fetch('/api/study').then(r => r.json()).then(d => {
      setTotalCards(d.totalCards || 0)
      setProgress(d.recentSessions || [])
    }).catch(() => {})
  }, [])

  const loadFlashcards = useCallback(async () => {
    setLoading(true)
    try {
      const url = category === 'ALL' ? '/api/flashcards/generate?list=true' : `/api/flashcards/generate?list=true&category=${category}`
      const res  = await fetch(url)
      const data = await res.json()
      setFlashcards(data.flashcards || [])
      setMode('flashcards')
    } catch { setGenError('Failed to load flashcards') } finally { setLoading(false) }
  }, [category])

  const generateQuiz = useCallback(async () => {
    setGenerating(true)
    setGenError('')
    try {
      const cat = category === 'ALL' ? 'FOUNDRY' : category
      const res  = await fetch(`/api/quiz/${cat}?count=10`)
      const data = await res.json()
      if (data.questions?.length) {
        setQuizQs(data.questions)
        setMode('quiz')
      } else throw new Error('No questions generated')
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'Failed to generate quiz')
    } finally { setGenerating(false) }
  }, [category])

  const handleFlashcardComplete = async (results: { correct: number; total: number }) => {
    const cat = category === 'ALL' ? 'GENERAL' : category
    await fetch('/api/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'flashcard', category: cat, ...results }),
    }).catch(() => {})
  }

  const handleQuizComplete = async (score: number, total: number, answers: boolean[]) => {
    const cat = category === 'ALL' ? 'GENERAL' : category
    await fetch('/api/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'quiz', category: cat, score, total, percentage: (score/total)*100, answersJson: answers }),
    }).catch(() => {})
  }

  if (mode === 'flashcards' && flashcards.length > 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setMode('pick')} className="flex items-center gap-2 text-night-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Study Hub
        </button>
        <h2 className="text-xl font-bold text-white mb-2">Flashcards — {category === 'ALL' ? 'All Categories' : category}</h2>
        <p className="text-night-500 text-sm mb-6">{flashcards.length} cards loaded</p>
        <FlashcardDeck cards={flashcards} onComplete={handleFlashcardComplete} />
      </div>
    )
  }

  if (mode === 'quiz' && quizQs.length > 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setMode('pick')} className="flex items-center gap-2 text-night-400 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Study Hub
        </button>
        <h2 className="text-xl font-bold text-white mb-6">Quiz — {category === 'ALL' ? 'Mixed' : category}</h2>
        <QuizEngine questions={quizQs} category={category} onComplete={handleQuizComplete} />
      </div>
    )
  }

  // Main pick screen
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-rose-400">◇</span> Study Hub
        </h1>
        <p className="text-night-400 text-sm">
          AI-generated flashcards and quizzes built from your knowledge pages. Study by domain, track your progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Flashcards', value: totalCards,          color: 'text-rose-400' },
          { label: 'Quiz Sessions',    value: progress.length,     color: 'text-palantir-400' },
          { label: 'Avg Score',        value: progress.length > 0 ? Math.round(progress.reduce((a, b) => a + b.percentage, 0) / progress.length) + '%' : '—', color: 'text-green-400' },
          { label: 'Best Score',       value: progress.length > 0 ? Math.round(Math.max(...progress.map(p => p.percentage))) + '%' : '—', color: 'text-yellow-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-night-900 border border-night-700 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            <div className="text-night-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="mb-6">
        <label className="block text-night-300 text-sm font-medium mb-2">Study Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                category === cat ? 'bg-night-700 border-palantir-500 text-white' : 'bg-night-800 border-night-700 text-night-400 hover:text-white'
              }`}
            >
              <span className={CAT_COLORS[cat]}>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Flashcards */}
        <div className="bg-night-900 border border-rose-800/40 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">◇</span>
            <div>
              <h3 className="text-white font-bold">Flashcards</h3>
              <p className="text-night-400 text-xs">{totalCards} cards · Click to reveal · Rate yourself</p>
            </div>
          </div>
          <p className="text-night-400 text-sm mb-4">
            Flip through flashcards generated from your knowledge pages. Rate each card to track mastery.
          </p>
          <button
            onClick={loadFlashcards}
            disabled={loading}
            className="w-full py-2.5 bg-rose-800/40 hover:bg-rose-700/40 border border-rose-700/50 text-rose-300 rounded-lg text-sm font-medium transition-all"
          >
            {loading ? '⟳ Loading…' : '◇ Start Flashcards'}
          </button>
        </div>

        {/* Quiz */}
        <div className="bg-night-900 border border-palantir-800/40 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">◈</span>
            <div>
              <h3 className="text-white font-bold">Quiz</h3>
              <p className="text-night-400 text-xs">10 questions · AI-generated · Multiple choice</p>
            </div>
          </div>
          <p className="text-night-400 text-sm mb-4">
            Gemini generates fresh multiple-choice questions from your knowledge pages. Results are tracked over time.
          </p>
          <button
            onClick={generateQuiz}
            disabled={generating}
            className="w-full py-2.5 bg-palantir-800/40 hover:bg-palantir-700/40 border border-palantir-700/50 text-palantir-300 rounded-lg text-sm font-medium transition-all"
          >
            {generating ? '✦ Generating with AI…' : '✦ Generate Quiz'}
          </button>
        </div>
      </div>

      {genError && (
        <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-300 text-sm mb-6">
          {genError}
        </div>
      )}

      {/* Recent sessions */}
      {progress.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Quiz Sessions</h2>
          <div className="space-y-2">
            {progress.slice(0, 8).map((session, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-night-900 border border-night-800 rounded-lg">
                <div className={`text-sm font-mono font-bold ${session.percentage >= 80 ? 'text-green-400' : session.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(session.percentage)}%
                </div>
                <div className="flex-1">
                  <span className={`text-xs font-mono ${CAT_COLORS[session.category] || 'text-night-400'}`}>{session.category}</span>
                  <span className="text-night-500 text-xs ml-3">{session.score}/{session.total} correct</span>
                </div>
                <div className="text-night-600 text-xs">{new Date(session.takenAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Flashcard Generation tip */}
      <div className="mt-8 p-4 bg-night-800/50 border border-night-700 rounded-xl">
        <h3 className="text-night-200 text-sm font-medium mb-2">💡 How to generate more flashcards</h3>
        <p className="text-night-400 text-sm">
          Open any knowledge page (Foundry, Ontology, AIP, Apollo) and click the <span className="text-rose-400">◇ Generate Flashcards</span> button.
          Gemini AI will create 8+ Q&A pairs from the page content and add them to your study deck.
        </p>
      </div>
    </div>
  )
}

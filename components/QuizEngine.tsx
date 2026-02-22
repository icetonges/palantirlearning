'use client'
// components/QuizEngine.tsx — Multiple choice quiz

import { useState } from 'react'

interface Question {
  question:     string
  options:      string[]
  correctIndex: number
  explanation:  string
}

interface Props {
  questions:  Question[]
  category:   string
  onComplete: (score: number, total: number, answers: boolean[]) => void
}

export default function QuizEngine({ questions, category, onComplete }: Props) {
  const [currentQ,  setCurrentQ]  = useState(0)
  const [selected,  setSelected]  = useState<number | null>(null)
  const [revealed,  setRevealed]  = useState(false)
  const [score,     setScore]     = useState(0)
  const [answers,   setAnswers]   = useState<boolean[]>([])
  const [finished,  setFinished]  = useState(false)

  const q = questions[currentQ]
  const progress = ((currentQ) / questions.length) * 100

  const handleSelect = (idx: number) => {
    if (revealed) return
    setSelected(idx)
  }

  const handleReveal = () => {
    if (selected === null) return
    setRevealed(true)
    if (selected === q.correctIndex) setScore((s) => s + 1)
  }

  const handleNext = () => {
    const isCorrect = selected === q.correctIndex
    const newAnswers = [...answers, isCorrect]
    setAnswers(newAnswers)

    if (currentQ + 1 >= questions.length) {
      const finalScore = isCorrect ? score + 1 : score
      onComplete(finalScore, questions.length, newAnswers)
      setFinished(true)
    } else {
      setCurrentQ((q) => q + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="text-center py-10 animate-fade-in">
        <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 60 ? '📖' : '🔁'}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{category} Quiz Complete</h3>
        <div className={`text-4xl font-mono font-bold mb-4 ${pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
          {pct}%
        </div>
        <p className="text-night-300 mb-2">{score} / {questions.length} correct</p>
        <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto mt-6">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                a ? 'bg-green-700 text-white' : 'bg-red-800 text-white'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-night-400 mb-2">
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span className="text-green-400">{score} correct</span>
      </div>
      <div className="h-1.5 bg-night-800 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-palantir-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="bg-night-900 border border-night-700 rounded-xl p-6 mb-4">
        <p className="text-white text-base font-medium leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {q.options.map((option, idx) => {
          let cls = 'border-night-700 bg-night-900/40 text-night-200 hover:border-palantir-500/60 hover:bg-palantir-900/20'
          if (revealed) {
            if (idx === q.correctIndex)    cls = 'border-green-600 bg-green-900/30 text-green-200'
            else if (idx === selected)     cls = 'border-red-600 bg-red-900/30 text-red-200'
            else                           cls = 'border-night-800 bg-night-900/20 text-night-500'
          } else if (selected === idx)     cls = 'border-palantir-500 bg-palantir-900/30 text-white'

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${cls}`}
            >
              <span className="font-mono text-night-500 mr-3">{String.fromCharCode(65 + idx)}.</span>
              {option}
            </button>
          )
        })}
      </div>

      {/* Explanation (after reveal) */}
      {revealed && (
        <div className="bg-night-800/60 border border-night-700 rounded-lg p-4 mb-4 animate-fade-in">
          <div className="text-xs text-night-400 font-mono mb-1">EXPLANATION</div>
          <p className="text-night-200 text-sm leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className="flex-1 py-3 bg-palantir-700 hover:bg-palantir-600 disabled:bg-night-800 disabled:text-night-500 text-white rounded-lg text-sm font-medium transition-all"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-palantir-700 hover:bg-palantir-600 text-white rounded-lg text-sm font-medium transition-all"
          >
            {currentQ + 1 >= questions.length ? 'Finish Quiz' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  )
}

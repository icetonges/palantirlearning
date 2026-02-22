'use client'
// components/FlashcardDeck.tsx — Interactive flashcard study deck

import { useState, useCallback } from 'react'

interface Flashcard {
  id:         string
  question:   string
  answer:     string
  difficulty: string
  category:   string
  subCategory?: string | null
}

interface Props {
  cards:      Flashcard[]
  onComplete: (results: { correct: number; total: number }) => void
}

const DIFF_COLORS: Record<string, string> = {
  EASY:   'text-green-400 bg-green-900/30 border-green-700/40',
  MEDIUM: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40',
  HARD:   'text-red-400 bg-red-900/30 border-red-700/40',
}

export default function FlashcardDeck({ cards, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped,      setFlipped]      = useState(false)
  const [correct,      setCorrect]      = useState(0)
  const [finished,     setFinished]     = useState(false)
  const [results,      setResults]      = useState<boolean[]>([])

  const card = cards[currentIndex]

  const handleRate = useCallback(
    (isCorrect: boolean) => {
      const newResults = [...results, isCorrect]
      setResults(newResults)
      if (isCorrect) setCorrect((c) => c + 1)

      if (currentIndex + 1 >= cards.length) {
        setFinished(true)
        onComplete({ correct: isCorrect ? correct + 1 : correct, total: cards.length })
      } else {
        setCurrentIndex((i) => i + 1)
        setFlipped(false)
      }
    },
    [correct, currentIndex, cards.length, results, onComplete]
  )

  if (!cards.length) {
    return (
      <div className="text-center py-16">
        <div className="text-night-400 text-5xl mb-4">◇</div>
        <p className="text-night-300">No flashcards yet. Generate them from a knowledge page.</p>
      </div>
    )
  }

  if (finished) {
    const pct = Math.round((correct / cards.length) * 100)
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎯' : pct >= 60 ? '📚' : '💪'}</div>
        <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
        <p className="text-night-300 mb-6">
          {correct} / {cards.length} correct — {pct}%
        </p>
        <div className="w-full max-w-xs mx-auto h-2 bg-night-800 rounded-full overflow-hidden mb-8">
          <div
            className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          {results.map((r, i) => (
            <span
              key={i}
              className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                r ? 'bg-green-700 text-white' : 'bg-red-800 text-white'
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const progress = ((currentIndex) / cards.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4 text-sm text-night-400">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-green-400">{correct} ✓</span>
          <span className="text-red-400">{currentIndex - correct} ✗</span>
        </div>
      </div>
      <div className="h-1.5 bg-night-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-palantir-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-full transition-all duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '280px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-night-900 border border-night-700 rounded-xl p-6 flex flex-col"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-0.5 rounded border ${DIFF_COLORS[card.difficulty] || DIFF_COLORS.MEDIUM}`}>
                  {card.difficulty}
                </span>
                {card.subCategory && (
                  <span className="text-xs px-2 py-0.5 rounded bg-night-800 text-night-400 border border-night-700">
                    {card.subCategory}
                  </span>
                )}
              </div>
              <span className="text-night-500 text-xs">Click to reveal</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white text-lg font-medium text-center leading-relaxed">
                {card.question}
              </p>
            </div>
            <div className="text-center text-night-600 text-xs mt-4">◇ QUESTION</div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-night-800 border border-palantir-700/50 rounded-xl p-6 flex flex-col"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center text-palantir-400 text-xs mb-4 font-mono">◈ ANSWER</div>
            <div className="flex-1 overflow-y-auto">
              <p className="text-night-100 text-sm leading-relaxed whitespace-pre-wrap">
                {card.answer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons — only show when flipped */}
      {flipped && (
        <div className="flex gap-3 mt-6 animate-slide-up">
          <button
            onClick={() => handleRate(false)}
            className="flex-1 py-3 bg-red-900/30 hover:bg-red-800/40 border border-red-700/50 text-red-300 rounded-lg text-sm font-medium transition-all"
          >
            ✗ Missed
          </button>
          <button
            onClick={() => handleRate(true)}
            className="flex-1 py-3 bg-green-900/30 hover:bg-green-800/40 border border-green-700/50 text-green-300 rounded-lg text-sm font-medium transition-all"
          >
            ✓ Got It
          </button>
        </div>
      )}

      {!flipped && (
        <p className="text-center text-night-500 text-xs mt-4">
          Click the card to reveal the answer
        </p>
      )}
    </div>
  )
}

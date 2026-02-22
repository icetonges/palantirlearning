'use client'
// components/AIChat.tsx — AI agent chat (home page)

import { useState, useRef, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface Message {
  role:    'user' | 'assistant'
  content: string
}

const STARTER_PROMPTS = [
  'What is the Palantir Ontology SDK?',
  'Explain AIP Logic functions with an example',
  'How do incremental transforms work in Foundry?',
  'What is Apollo fleet management?',
  'Show me today\'s Palantir news summary',
]

export default function AIChat() {
  const [messages, setMessages]   = useState<Message[]>([{
    role:    'assistant',
    content: '**Palantir Learning AI** 🤖\n\nI\'m your expert guide to Palantir Foundry, Ontology, AIP, and Apollo. Ask me anything — concepts, code examples, news, or study tips.',
  }])
  const [input,    setInput]      = useState('')
  const [loading,  setLoading]    = useState(false)
  const bottomRef    = useRef<HTMLDivElement>(null)
  const mountedRef   = useRef(false)

  useEffect(() => {
    // Skip scroll on initial mount — only scroll when new messages arrive
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Unable to reach AI. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col bg-night-900 border border-night-700 rounded-xl overflow-hidden" style={{ height: '520px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-night-800 bg-night-950/50">
        <span className="text-palantir-400 text-sm font-mono">✦</span>
        <span className="text-white text-sm font-semibold">Palantir AI Assistant</span>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-palantir-700 flex items-center justify-center text-xs text-white mr-2 mt-0.5 shrink-0 font-mono">
                ✦
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-palantir-700/50 text-white ml-auto'
                  : 'bg-night-800 text-night-100'
              }`}
            >
              {msg.role === 'assistant' ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-palantir-700 flex items-center justify-center text-xs text-white mr-2 shrink-0 font-mono">✦</div>
            <div className="bg-night-800 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-palantir-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-palantir-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-palantir-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs px-2.5 py-1 bg-night-800 hover:bg-night-700 border border-night-700 hover:border-palantir-500/50 text-night-300 hover:text-white rounded-full transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-night-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask about Foundry, Ontology, AIP, Apollo…"
          disabled={loading}
          className="flex-1 bg-night-800 border border-night-700 rounded-lg px-3 py-2 text-sm text-white placeholder-night-500 focus:outline-none focus:border-palantir-500 transition-colors"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-palantir-700 hover:bg-palantir-600 disabled:bg-night-800 disabled:text-night-600 text-white rounded-lg text-sm font-medium transition-all"
        >
          Send
        </button>
      </div>
    </div>
  )
}

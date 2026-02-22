'use client'
// app/notes/page.tsx — Note input + Document upload (Self-Evolving Engine)

import { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

const CATEGORIES = ['FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO', 'GENERAL']
const SUBCATS: Record<string, string[]> = {
  FOUNDRY:  ['Core Concepts', 'Data Connection & Ingestion', 'Datasets & Branches', 'Transforms', 'PySpark & Python', 'SQL Transforms', 'Contour Analytics', 'Workshop Apps', 'Slate', 'Foundry ML', 'OSDK in Foundry', 'Security & Markings', 'DevTools & CLI'],
  ONTOLOGY: ['Core Concepts', 'Object Types', 'Link Types', 'Actions & Rules', 'OSDK (TypeScript)', 'OSDK (Python)', 'Time Series', 'Search & Filtering', 'Ontology Sync', 'Aggregations'],
  AIP:      ['Core Concepts', 'AIP Logic', 'AIP Copilot', 'AIP Studio', 'Function Repository', 'LLM Configuration', 'Prompt Engineering', 'Security & Governance', 'Use Cases', 'Performance'],
  APOLLO:   ['Core Concepts', 'Software Distribution', 'Fleet Management', 'Enrollment', 'Configuration Policies', 'Health Monitoring', 'Apollo CLI', 'Air-Gapped Deployments', 'Government & DoD'],
  GENERAL:  ['General', 'Architecture', 'Best Practices', 'Comparison', 'Career'],
}

const CAT_COLORS: Record<string, string> = {
  FOUNDRY:  'border-blue-700/50 bg-blue-900/20',
  ONTOLOGY: 'border-violet-700/50 bg-violet-900/20',
  AIP:      'border-cyan-700/50 bg-cyan-900/20',
  APOLLO:   'border-emerald-700/50 bg-emerald-900/20',
  GENERAL:  'border-night-700 bg-night-800/20',
}

export default function NotesPage() {
  const searchParams = useSearchParams()
  const initialCat   = searchParams.get('category') || 'FOUNDRY'

  const [mode,       setMode]       = useState<'note' | 'upload'>('note')
  const [title,      setTitle]      = useState('')
  const [category,   setCategory]   = useState(initialCat)
  const [subCat,     setSubCat]     = useState(SUBCATS[initialCat]?.[0] || '')
  const [content,    setContent]    = useState('')
  const [file,       setFile]       = useState<File | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState<{ slug: string; category: string } | null>(null)
  const [error,      setError]      = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    setSubCat(SUBCATS[cat]?.[0] || '')
  }

  const handleSubmitNote = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/notes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title, category, subCategory: subCat, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setResult({ slug: data.slug, category: data.category })
      setTitle('')
      setContent('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a file.'); return }
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      formData.append('subCategory', subCat)
      const res  = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setResult({ slug: data.slug, category: data.category })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const HREF_MAP: Record<string, string> = {
    FOUNDRY: 'foundry', ONTOLOGY: 'ontology', AIP: 'aip', APOLLO: 'apollo', GENERAL: 'archive',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span className="text-palantir-400">◱</span> Add Knowledge
        </h1>
        <p className="text-night-400 text-sm">
          Every note or document you add automatically generates a new knowledge page in the appropriate tab,
          with an AI-generated summary, tags, and permanent URL. The platform self-evolves.
        </p>
      </div>

      {/* Success state */}
      {result && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400 text-lg">✓</span>
            <span className="text-green-300 font-semibold">Knowledge page created!</span>
          </div>
          <p className="text-green-400/70 text-sm mb-3">
            AI summary generated · Tags extracted · Permanent URL assigned
          </p>
          <div className="flex gap-3">
            <a
              href={`/${HREF_MAP[result.category] || 'archive'}/${result.slug}`}
              className="px-4 py-2 bg-green-800/30 hover:bg-green-700/30 border border-green-700/50 text-green-300 rounded-lg text-sm transition-all"
            >
              View Page →
            </a>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 rounded-lg text-sm transition-all"
            >
              Add Another
            </button>
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div className="flex gap-1 p-1 bg-night-900 border border-night-700 rounded-xl mb-6">
        {(['note', 'upload'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === m ? 'bg-palantir-700 text-white' : 'text-night-400 hover:text-white'
            }`}
          >
            {m === 'note' ? '✎ Write Note' : '⬆ Upload Document'}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {/* Category selector */}
        <div>
          <label className="block text-night-200 text-sm font-medium mb-2">Knowledge Domain *</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  category === cat
                    ? CAT_COLORS[cat] + ' text-white border-opacity-80'
                    : 'bg-night-800/50 border-night-700 text-night-400 hover:text-white hover:bg-night-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-category */}
        <div>
          <label className="block text-night-200 text-sm font-medium mb-2">Sub-category</label>
          <select
            value={subCat}
            onChange={(e) => setSubCat(e.target.value)}
            className="w-full px-4 py-2.5 bg-night-800 border border-night-700 rounded-lg text-white text-sm focus:outline-none focus:border-palantir-500 transition-colors"
          >
            {(SUBCATS[category] || []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {mode === 'note' ? (
          <>
            {/* Title */}
            <div>
              <label className="block text-night-200 text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PySpark Incremental Transforms — Best Practices"
                className="w-full px-4 py-2.5 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500 text-sm focus:outline-none focus:border-palantir-500 transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-night-200 text-sm font-medium mb-2">
                Content * <span className="text-night-500 font-normal">(Markdown supported)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                placeholder={`# My Note Title\n\n## Overview\n\nWrite your knowledge here. Full Markdown is supported including:\n- Code blocks (\`\`\`python ... \`\`\`)\n- Tables\n- Headers\n- Links\n\n## Key Points\n\n1. First point\n2. Second point\n\n## Code Example\n\n\`\`\`python\nfrom transforms.api import transform, Input, Output\n\n@transform(\n    output=Output('/my/output'),\n    source=Input('/my/source'),\n)\ndef compute(output, source):\n    df = source.dataframe()\n    output.write_dataframe(df)\n\`\`\``}
                className="w-full px-4 py-3 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-600 text-sm font-mono leading-relaxed focus:outline-none focus:border-palantir-500 transition-colors resize-none"
              />
              <p className="text-night-600 text-xs mt-1.5">
                {content.length} characters · Gemini AI will auto-generate a summary and tags on save
              </p>
            </div>

            <button
              onClick={handleSubmitNote}
              disabled={loading || !title.trim() || !content.trim()}
              className="w-full py-3 bg-palantir-700 hover:bg-palantir-600 disabled:bg-night-800 disabled:text-night-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> Saving & generating AI summary…</>
              ) : (
                '◱ Save Note & Generate Page'
              )}
            </button>
          </>
        ) : (
          <>
            {/* File upload */}
            <div>
              <label className="block text-night-200 text-sm font-medium mb-2">
                Document * <span className="text-night-500 font-normal">(PDF, DOCX, or TXT — max 20MB)</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  file ? 'border-palantir-500/60 bg-palantir-900/10' : 'border-night-700 hover:border-palantir-500/40'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="text-3xl">📄</div>
                    <div className="text-white font-medium">{file.name}</div>
                    <div className="text-night-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl text-night-500">⬆</div>
                    <div className="text-night-300 font-medium">Click to select or drag & drop</div>
                    <div className="text-night-600 text-sm">PDF, DOCX, TXT · Max 20MB</div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="bg-night-800/50 border border-night-700 rounded-xl p-4">
              <h3 className="text-night-200 text-sm font-medium mb-2">What happens when you upload:</h3>
              <ol className="space-y-1.5 text-xs text-night-400">
                <li>1. Text is extracted from your document (PDF → pdf-parse, DOCX → mammoth)</li>
                <li>2. Gemini AI infers the title, category, sub-category, and topic tags</li>
                <li>3. A 2-3 sentence AI summary is generated</li>
                <li>4. A new knowledge page is created with a permanent URL</li>
                <li>5. Flashcards can be optionally generated from the content</li>
              </ol>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full py-3 bg-palantir-700 hover:bg-palantir-600 disabled:bg-night-800 disabled:text-night-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⟳</span> Uploading, extracting & processing…</>
              ) : (
                '⬆ Upload & Generate Knowledge Page'
              )}
            </button>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

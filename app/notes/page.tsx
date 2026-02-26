'use client'
// app/notes/page.tsx — Note editor with live preview + image upload

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const DocumentRenderer = dynamic(() => import('@/components/DocumentRenderer'), { ssr: false })

const CATEGORIES = ['FOUNDRY', 'ONTOLOGY', 'AIP', 'APOLLO', 'GENERAL']
const SUBCATS: Record<string, string[]> = {
  FOUNDRY:  ['Core Concepts', 'Data Connection & Ingestion', 'Datasets & Branches', 'Transforms', 'PySpark & Python', 'SQL Transforms', 'Contour Analytics', 'Workshop Apps', 'Slate', 'Foundry ML', 'OSDK in Foundry', 'Security & Markings', 'DevTools & CLI'],
  ONTOLOGY: ['Core Concepts', 'Object Types', 'Link Types', 'Actions & Rules', 'OSDK (TypeScript)', 'OSDK (Python)', 'Time Series', 'Search & Filtering', 'Ontology Sync', 'Aggregations'],
  AIP:      ['Core Concepts', 'AIP Logic', 'AIP Copilot', 'AIP Studio', 'Function Repository', 'LLM Configuration', 'Prompt Engineering', 'Security & Governance', 'Use Cases', 'Performance'],
  APOLLO:   ['Core Concepts', 'Software Distribution', 'Fleet Management', 'Enrollment', 'Configuration Policies', 'Health Monitoring', 'Apollo CLI', 'Air-Gapped Deployments', 'Government & DoD'],
  GENERAL:  ['General', 'Architecture', 'Best Practices', 'Comparison', 'Career'],
}
const CAT_COLORS: Record<string, string> = {
  FOUNDRY:  'border-blue-700/50 bg-blue-900/20 text-blue-300',
  ONTOLOGY: 'border-violet-700/50 bg-violet-900/20 text-violet-300',
  AIP:      'border-cyan-700/50 bg-cyan-900/20 text-cyan-300',
  APOLLO:   'border-emerald-700/50 bg-emerald-900/20 text-emerald-300',
  GENERAL:  'border-night-700 bg-night-800/20 text-night-300',
}
const HREF_MAP: Record<string, string> = {
  FOUNDRY: 'foundry', ONTOLOGY: 'ontology', AIP: 'aip', APOLLO: 'apollo', GENERAL: 'archive',
}

type Mode    = 'note' | 'upload'
type TabMode = 'write' | 'preview'

interface ExistingPage {
  id: string; slug: string; title: string; category: string
  subCategory: string | null; content: string; aiSummary: string | null
  tags: string[]; viewCount: number; createdAt: string; updatedAt: string
}

function NotesContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const editId       = searchParams.get('edit')
  const initialCat   = searchParams.get('category') || 'FOUNDRY'

  const [mode,        setMode]        = useState<Mode>('note')
  const [tabMode,     setTabMode]     = useState<TabMode>('write')
  const [editPage,    setEditPage]    = useState<ExistingPage | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const [title,    setTitle]    = useState('')
  const [category, setCategory] = useState(initialCat)
  const [subCat,   setSubCat]   = useState(SUBCATS[initialCat]?.[0] || '')
  const [content,  setContent]  = useState('')
  const [file,     setFile]     = useState<File | null>(null)

  const [loading,       setLoading]       = useState(false)
  const [imgUploading,  setImgUploading]  = useState(false)
  const [result,        setResult]        = useState<{ slug: string; category: string; isEdit?: boolean } | null>(null)
  const [error,         setError]         = useState('')

  const fileInputRef  = useRef<HTMLInputElement>(null)
  const imgInputRef   = useRef<HTMLInputElement>(null)
  const textareaRef   = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!editId) return
    setLoadingEdit(true)
    fetch(`/api/notes?id=${editId}`)
      .then(r => r.json())
      .then(data => {
        const p: ExistingPage = data.page
        if (!p) return
        setEditPage(p); setTitle(p.title); setCategory(p.category)
        setSubCat(p.subCategory || SUBCATS[p.category]?.[0] || ''); setContent(p.content)
      })
      .catch(() => setError('Failed to load page for editing'))
      .finally(() => setLoadingEdit(false))
  }, [editId])

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    if (!editPage) setSubCat(SUBCATS[cat]?.[0] || '')
  }

  // ── Insert markdown snippet at cursor ──────────────────────────────────────
  const insertAtCursor = useCallback((before: string, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const sel   = content.slice(start, end)
    const newContent = content.slice(0, start) + before + sel + after + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, start + before.length + sel.length)
    }, 0)
  }, [content])

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (imgFile: File) => {
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', imgFile)
      const res  = await fetch('/api/upload/image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        insertAtCursor(`![${imgFile.name.replace(/\.[^.]+$/, '')}](${data.url})`)
      }
    } catch { setError('Image upload failed') }
    finally { setImgUploading(false) }
  }

  // ── Toolbar buttons ────────────────────────────────────────────────────────
  const toolbar = [
    { label: 'B',   title: 'Bold',          action: () => insertAtCursor('**', '**') },
    { label: 'I',   title: 'Italic',        action: () => insertAtCursor('*', '*') },
    { label: 'H2',  title: 'Heading 2',     action: () => insertAtCursor('\n## ', '') },
    { label: 'H3',  title: 'Heading 3',     action: () => insertAtCursor('\n### ', '') },
    { label: '—',   title: 'Divider',       action: () => insertAtCursor('\n\n---\n\n', '') },
    { label: '{ }', title: 'Inline code',   action: () => insertAtCursor('`', '`') },
    { label: '≡',   title: 'Bullet list',   action: () => insertAtCursor('\n- ', '') },
    { label: '1.',  title: 'Numbered list', action: () => insertAtCursor('\n1. ', '') },
    { label: '❝',   title: 'Blockquote',    action: () => insertAtCursor('\n> ', '') },
    { label: '⬡',   title: 'Table',         action: () => insertAtCursor('\n| Column 1 | Column 2 | Column 3 |\n|---|---|---|\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |\n', '') },
    { label: '🔗',  title: 'Link',          action: () => insertAtCursor('[', '](https://)') },
  ]

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSubmitNote = async () => {
    if (!title.trim() || !content.trim()) { setError('Title and content are required.'); return }
    setLoading(true); setError('')
    try {
      if (editPage) {
        const res  = await fetch('/api/notes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editPage.id, title, category, subCategory: subCat || null, content }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Update failed')
        setResult({ slug: data.slug, category: data.category, isEdit: true })
      } else {
        const res  = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, category, subCategory: subCat, content }) })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to save')
        setResult({ slug: data.slug, category: data.category })
        setTitle(''); setContent('')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally { setLoading(false) }
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a file.'); return }
    setLoading(true); setError('')
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally { setLoading(false) }
  }

  if (loadingEdit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="text-4xl animate-spin inline-block mb-4 text-palantir-400">⟳</div>
        <p className="text-night-400 text-sm">Loading…</p>
      </div>
    )
  }

  const isEditMode = !!editId

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          {isEditMode && (
            <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-night-800 hover:bg-night-700 border border-night-700 text-night-400 hover:text-white transition-all text-xs">← Back</button>
          )}
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-palantir-400">{isEditMode ? '✎' : '◱'}</span>
            {isEditMode ? 'Edit Knowledge Page' : 'Add Knowledge'}
          </h1>
        </div>
        <p className="text-night-400 text-sm mt-1">
          Notes are rendered as a clean document with full formatting support — tables, images, code, charts.
        </p>
      </div>

      {/* Success */}
      {result && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-400">✓</span>
            <span className="text-green-300 font-semibold">{result.isEdit ? 'Changes saved!' : 'Knowledge page created!'}</span>
          </div>
          <div className="flex gap-3">
            <a href={`/${HREF_MAP[result.category] || 'archive'}/${result.slug}`} className="px-4 py-2 bg-green-800/30 hover:bg-green-700/30 border border-green-700/50 text-green-300 rounded-lg text-sm transition-all">
              View Page →
            </a>
            {!result.isEdit && (
              <button onClick={() => setResult(null)} className="px-4 py-2 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 rounded-lg text-sm transition-all">
                Add Another
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode toggle */}
      {!isEditMode && (
        <div className="flex gap-1 p-1 bg-night-900 border border-night-700 rounded-xl mb-5">
          {(['note', 'upload'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-palantir-700 text-white' : 'text-night-400 hover:text-white'}`}>
              {m === 'note' ? '✎ Write Note' : '⬆ Upload DOCX / PDF'}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-night-200 text-sm font-medium mb-2">Knowledge Domain *</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${category === cat ? CAT_COLORS[cat] : 'bg-night-800/50 border-night-700 text-night-400 hover:text-white hover:bg-night-800'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-category */}
        <div>
          <label className="block text-night-200 text-sm font-medium mb-2">Sub-category</label>
          <select value={subCat} onChange={(e) => setSubCat(e.target.value)}
            className="w-full px-4 py-2.5 bg-night-800 border border-night-700 rounded-lg text-white text-sm focus:outline-none focus:border-palantir-500">
            {(SUBCATS[category] || []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {(mode === 'note' || isEditMode) ? (
          <>
            {/* Title */}
            <div>
              <label className="block text-night-200 text-sm font-medium mb-2">Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PySpark Incremental Transforms — Best Practices"
                className="w-full px-4 py-2.5 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500 text-sm focus:outline-none focus:border-palantir-500"
              />
            </div>

            {/* Editor / Preview tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1 p-0.5 bg-night-900 border border-night-700 rounded-lg">
                  {(['write', 'preview'] as const).map((t) => (
                    <button key={t} onClick={() => setTabMode(t)}
                      className={`px-4 py-1.5 rounded-md text-sm transition-all ${tabMode === t ? 'bg-palantir-700 text-white' : 'text-night-400 hover:text-white'}`}>
                      {t === 'write' ? '✎ Write' : '👁 Preview'}
                    </button>
                  ))}
                </div>
                <span className="text-night-600 text-xs">{content.length} chars · Markdown supported</span>
              </div>

              {tabMode === 'write' ? (
                <>
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-1 p-2 bg-night-900 border border-night-700 border-b-0 rounded-t-lg">
                    {toolbar.map((btn) => (
                      <button key={btn.label} onClick={btn.action} title={btn.title}
                        className="px-2.5 py-1 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 hover:text-white rounded text-xs font-mono transition-all min-w-[28px] text-center">
                        {btn.label}
                      </button>
                    ))}
                    {/* Image insert button */}
                    <button
                      onClick={() => imgInputRef.current?.click()}
                      disabled={imgUploading}
                      title="Insert image"
                      className="px-2.5 py-1 bg-night-800 hover:bg-night-700 border border-night-700 text-night-300 hover:text-white rounded text-xs transition-all"
                    >
                      {imgUploading ? '⟳' : '🖼'}
                    </button>
                    <input ref={imgInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }} />
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={26}
                    placeholder={`# My Note Title\n\n## Overview\n\nWrite your knowledge here. Full Markdown is supported:\n\n## Tables\n\n| Column 1 | Column 2 | Column 3 |\n|---|---|---|\n| Cell | Cell | Cell |\n\n## Code\n\n\`\`\`python\ndef hello():\n    print("Hello Palantir")\n\`\`\`\n\n## Images\n\nUse the 🖼 button in the toolbar to insert images.`}
                    className="w-full px-4 py-3 bg-night-800 border border-night-700 rounded-b-lg text-white placeholder-night-600 text-sm font-mono leading-relaxed focus:outline-none focus:border-palantir-500 resize-y"
                  />
                </>
              ) : (
                /* Live preview — white document style */
                <div className="border border-night-700 rounded-lg overflow-hidden">
                  <div className="bg-night-900 px-4 py-2 border-b border-night-700 text-night-500 text-xs font-mono">
                    Preview — as it will appear on the knowledge page
                  </div>
                  <div className="bg-night-950 p-4 sm:p-8 min-h-64">
                    {content.trim()
                      ? <DocumentRenderer content={content} />
                      : <p className="text-slate-400 text-sm italic text-center py-16">Start writing to see a preview…</p>
                    }
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleSubmitNote} disabled={loading || !title.trim() || !content.trim()}
              className="w-full py-3 bg-palantir-700 hover:bg-palantir-600 disabled:bg-night-800 disabled:text-night-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin">⟳</span> {isEditMode ? 'Saving…' : 'Saving & generating AI summary…'}</> : isEditMode ? '✓ Save Changes' : '◱ Save Note & Generate Page'}
            </button>

            {isEditMode && editPage && !result && (
              <div className="flex gap-2">
                <Link href={`/${HREF_MAP[editPage.category] || 'archive'}/${editPage.slug}`}
                  className="flex-1 py-2 text-center bg-night-800 hover:bg-night-700 border border-night-700 text-night-400 hover:text-white rounded-lg text-xs transition-all">
                  ↗ View Published Page
                </Link>
                <Link href="/archive" className="flex-1 py-2 text-center bg-night-800 hover:bg-night-700 border border-night-700 text-night-400 hover:text-white rounded-lg text-xs transition-all">
                  ← Back to Archive
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            {/* File upload */}
            <div>
              <label className="block text-night-200 text-sm font-medium mb-2">
                Document * <span className="text-night-500 font-normal">(DOCX, PDF, TXT — max 20MB)</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${file ? 'border-palantir-500/60 bg-palantir-900/10' : 'border-night-700 hover:border-palantir-500/40'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f) }}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="text-3xl">📄</div>
                    <div className="text-white font-medium">{file.name}</div>
                    <div className="text-night-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null) }} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl">⬆</div>
                    <div className="text-night-300 font-medium">Click to select or drag & drop</div>
                    <div className="text-night-500 text-sm">DOCX files will preserve all formatting, tables, and images exactly as in Word</div>
                    <div className="text-night-600 text-xs">DOCX · PDF · TXT · MD · Max 20MB</div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div className="bg-night-800/50 border border-night-700 rounded-xl p-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-night-300"><strong className="text-white">DOCX</strong> — full fidelity: tables, images, headings, bold, lists all preserved</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-night-300"><strong className="text-white">PDF</strong> — text extracted, formatting approximated</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span className="text-night-300"><strong className="text-white">Markdown/TXT</strong> — rendered directly with full styling</span>
                </div>
              </div>
            </div>

            <button onClick={handleUpload} disabled={loading || !file}
              className="w-full py-3 bg-palantir-700 hover:bg-palantir-600 disabled:bg-night-800 disabled:text-night-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin">⟳</span> Uploading & processing…</> : '⬆ Upload & Generate Knowledge Page'}
            </button>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>
        )}
      </div>
    </div>
  )
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-24 text-center"><div className="text-4xl animate-spin inline-block text-palantir-400">⟳</div></div>}>
      <NotesContent />
    </Suspense>
  )
}

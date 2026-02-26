'use client'
// components/DocumentRenderer.tsx
// Renders notes as a clean white document — supports HTML (from DOCX) and Markdown

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useRef } from 'react'
import hljs from 'highlight.js'

interface Props {
  content: string
  className?: string
}

// Detect if content is HTML (from DOCX upload) or Markdown (from note editor)
function isHtmlContent(content: string): boolean {
  const trimmed = content.trim()
  return trimmed.startsWith('<') && (
    trimmed.includes('<p>') || trimmed.includes('<h') ||
    trimmed.includes('<table') || trimmed.includes('<ul') ||
    trimmed.includes('<ol') || trimmed.includes('<div')
  )
}

// ── HTML Document Renderer (for DOCX uploads) ────────────────────────────────
function HtmlDocument({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })
  }, [content])

  return (
    <div
      ref={ref}
      className="doc-html"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

// ── Markdown Document Renderer (for written notes) ───────────────────────────
function MarkdownDocument({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })
  }, [content])

  return (
    <div ref={ref} className="doc-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1>{children}</h1>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          h4: ({ children }) => <h4>{children}</h4>,
          h5: ({ children }) => <h5>{children}</h5>,
          p:  ({ children }) => <p>{children}</p>,
          a:  ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          ),
          img: ({ src, alt }) => (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alt || ''} />
              {alt && <figcaption>{alt}</figcaption>}
            </figure>
          ),
          code: ({ className: cls, children, ...props }) => {
            const isBlock = cls?.startsWith('language-')
            if (!isBlock) return <code className="inline-code" {...props}>{children}</code>
            return <code className={cls} {...props}>{children}</code>
          },
          pre:        ({ children })  => <pre>{children}</pre>,
          ul:         ({ children })  => <ul>{children}</ul>,
          ol:         ({ children })  => <ol>{children}</ol>,
          li:         ({ children })  => <li>{children}</li>,
          blockquote: ({ children })  => <blockquote>{children}</blockquote>,
          table:      ({ children })  => <div className="table-wrap"><table>{children}</table></div>,
          thead:      ({ children })  => <thead>{children}</thead>,
          tbody:      ({ children })  => <tbody>{children}</tbody>,
          tr:         ({ children })  => <tr>{children}</tr>,
          th:         ({ children })  => <th>{children}</th>,
          td:         ({ children })  => <td>{children}</td>,
          hr:         ()              => <hr />,
          strong:     ({ children })  => <strong>{children}</strong>,
          em:         ({ children })  => <em>{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DocumentRenderer({ content, className = '' }: Props) {
  const isHtml = isHtmlContent(content)
  return (
    <div className={`document-paper ${className}`}>
      {isHtml
        ? <HtmlDocument content={content} />
        : <MarkdownDocument content={content} />
      }
    </div>
  )
}

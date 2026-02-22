'use client'
// components/MarkdownRenderer.tsx — Markdown with syntax highlighting and tables

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect } from 'react'
import hljs from 'highlight.js'

interface Props {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: Props) {
  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })
  }, [content])

  return (
    <div className={`prose-palantir ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-8 mb-4 pb-2 border-b border-night-700">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-palantir-200 mt-6 mb-3 pb-1 border-b border-night-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-night-100 mt-5 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-night-200 mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-night-200 leading-relaxed mb-4">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-palantir-400 hover:text-palantir-300 underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          code: ({ className: cls, children, ...props }) => {
            const isInline = !cls
            if (isInline) {
              return (
                <code
                  className="bg-night-800 text-palantir-200 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return <code className={cls} {...props}>{children}</code>
          },
          pre: ({ children }) => (
            <pre className="bg-night-900 border border-night-700 rounded-lg p-4 overflow-x-auto my-4 text-sm">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-night-200 space-y-1.5 mb-4 ml-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-night-200 space-y-1.5 mb-4 ml-4">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-palantir-600 pl-4 my-4 text-night-300 italic bg-night-900/50 py-2 rounded-r-md">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border border-night-700 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-night-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-night-100 font-semibold border border-night-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-night-300 border border-night-700">{children}</td>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-night-900/30 hover:bg-night-800/40 transition-colors">
              {children}
            </tr>
          ),
          hr: () => <hr className="border-night-700 my-6" />,
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-night-200 italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-neutral max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="mb-4 mt-6 text-3xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-5 text-2xl font-semibold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-4 text-xl font-semibold">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="mb-2 mt-3 text-lg font-semibold">{children}</h4>
        ),

        // Paragraphs
        p: ({ children }) => <p className="mb-3 leading-7">{children}</p>,

        // Lists
        ul: ({ children }) => (
          <ul className="mb-3 ml-6 list-disc space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 ml-6 list-decimal space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-7">{children}</li>,

        // Tables
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-border px-4 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border px-4 py-2">{children}</td>
        ),

        // Code
        code: ({ children, className, ...props }) => {
          const isInline = !className || !className.includes('language-')
          return isInline ? (
            <code
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          ) : (
            <code
              className="block overflow-x-auto rounded bg-muted p-3 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          )
        },

        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-4 border-primary pl-4 italic">
            {children}
          </blockquote>
        ),

        // Horizontal Rule
        hr: () => <hr className="my-4 border-t border-border" />,

        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),

        // Emphasis/Italic
        em: ({ children }) => <em className="italic">{children}</em>,
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

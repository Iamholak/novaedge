'use client'

import dynamic from 'next/dynamic'
import type Editor from '@monaco-editor/react'
import { loader } from '@monaco-editor/react'

import { FileCode2, Info, Sparkles } from 'lucide-react'

loader.config({
  paths: {
    vs: '/monaco/vs',
  },
})

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center bg-muted/40 text-sm text-muted-foreground">
        Loading editor...
      </div>
    ),
  }
) as typeof Editor

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your post in Markdown...',
  minHeight = '400px',
}: RichTextEditorProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileCode2 className="h-4 w-4 text-primary" />
          Monaco Markdown Editor
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            Headings, lists, tables, code fences
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1">
            <Info className="h-3.5 w-3.5" />
            Raw HTML is blocked on the public blog
          </span>
        </div>
      </div>

      <MonacoEditor
        height={minHeight}
        defaultLanguage="markdown"
        value={value}
        onChange={(nextValue: string | undefined) => onChange(nextValue ?? '')}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          fontSize: 14,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          renderWhitespace: 'selection',
        }}
        theme="vs-dark"
        loading={placeholder}
      />
    </div>
  )
}

import type { ComponentProps } from 'react'

import sanitizeHtml from 'sanitize-html'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { isLikelyHtml, safeMarkdownUrl } from '@/lib/content'

type BlogContentProps = {
  content: string
}

export function BlogContent({ content }: BlogContentProps) {
  if (isLikelyHtml(content)) {
    const sanitizedHtml = sanitizeHtml(content, {
      allowedTags: [
        ...sanitizeHtml.defaults.allowedTags,
        'img',
        'h1',
        'h2',
        'h3',
        'h4',
        'blockquote',
        'pre',
        'code',
      ],
      allowedAttributes: {
        a: ['href', 'name', 'target', 'rel'],
        img: ['src', 'alt', 'title'],
        '*': ['class'],
      },
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', {
          target: '_blank',
          rel: 'noopener noreferrer',
        }),
      },
    })

    return (
      <div
        className="prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary prose-pre:bg-muted prose-code:text-foreground"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    )
  }

  return (
    <div className="prose max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-a:text-primary prose-pre:bg-muted prose-code:text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url: string) => safeMarkdownUrl(url)}
        components={{
          a: (props: ComponentProps<'a'>) => (
            <a {...props} rel="noopener noreferrer" target="_blank" />
          ),
          img: (props: ComponentProps<'img'>) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt ?? ''} className="rounded-2xl border border-border" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

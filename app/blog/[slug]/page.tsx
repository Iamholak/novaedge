import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlogContent } from '@/components/blog-content'
import { Button } from '@/components/ui/button'
import { dbOne } from '@/lib/db'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  featured_image?: string | null
  published_at: string
}

export const dynamic = 'force-dynamic'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await dbOne<BlogPost>(
    `SELECT id, title, slug, content, featured_image, published_at
     FROM blog_posts
     WHERE slug = $1 AND status = 'published'`,
    [slug]
  )

  if (!post) {
    notFound()
  }

  return (
    <div className="bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/blog">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8 md:py-6">
        <article>
          {post.featured_image && (
            <div className="mb-6 h-64 overflow-hidden rounded-xl border border-border bg-muted md:h-80">
              <img
                src={post.featured_image}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <header className="mb-6">
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              {post.title}
            </h1>
            <p className="text-muted-foreground">
              Published on{' '}
              {new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </header>

          <div className="rounded-xl border border-border bg-card p-5 md:p-6">
            <BlogContent content={post.content} />
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <Link href="/blog">
              <Button variant="outline">Back to Blog</Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  )
}

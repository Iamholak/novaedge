import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { dbMany } from '@/lib/db'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image?: string | null
  created_at: string
  published_at: string
}

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const posts = await dbMany<BlogPost>(
    `SELECT id, title, slug, excerpt, featured_image, created_at, published_at
     FROM blog_posts
     WHERE status = 'published'
     ORDER BY published_at DESC NULLS LAST, created_at DESC`
  )

  return (
    <div className="bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8 md:flex-row md:items-center md:gap-6">
          <Link href="/" className="shrink-0">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Blog</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
              Insights, updates, and stories from NovaEdge Solutions
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8 md:py-6">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
            <p className="text-base text-muted-foreground">No published posts yet</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post: BlogPost) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 sm:flex-row">
                  {post.featured_image && (
                    <div className="h-40 w-full flex-shrink-0 overflow-hidden bg-muted sm:h-48 sm:w-48">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-8">
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </h2>
                      <p className="mb-4 text-muted-foreground">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <span className="text-sm font-medium text-primary">Read More</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

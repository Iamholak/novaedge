import { NextRequest, NextResponse } from 'next/server'

import { dbOne } from '@/lib/db'

type BlogPostRow = {
  id: string
  title: string
  slug: string
  content: string
  featured_image: string | null
  published_at: string | null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const data = await dbOne<BlogPostRow>(
      `SELECT id, title, slug, content, featured_image, published_at
       FROM blog_posts
       WHERE slug = $1 AND status = 'published'`,
      [slug]
    )

    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
}

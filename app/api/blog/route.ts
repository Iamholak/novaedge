import { NextResponse } from 'next/server'

import { dbMany } from '@/lib/db'

type PublicBlogPostRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  created_at: string
  published_at: string | null
}

export async function GET() {
  try {
    const data = await dbMany<PublicBlogPostRow>(
      `SELECT id, title, slug, excerpt, featured_image, created_at, published_at
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST, created_at DESC`
    )

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching published posts:', error)
    return NextResponse.json({ data: [] }, { status: 200 })
  }
}

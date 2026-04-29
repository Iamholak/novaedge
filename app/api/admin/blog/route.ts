import { NextRequest, NextResponse } from 'next/server'

import {
  invalidOriginResponse,
  isSameOriginRequest,
  requireAdminUser,
  unauthorizedResponse,
} from '@/lib/admin-auth'
import { writeAdminAuditLog } from '@/lib/audit-log'
import { dbMany, dbOne } from '@/lib/db'
import { blogPostSchema } from '@/lib/validation'

type AdminBlogPostRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  status: string
  featured_image: string | null
  created_at: string
  published_at: string | null
}

export async function GET(request: NextRequest) {
  const user = await requireAdminUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const data = await dbMany<AdminBlogPostRow>(
      `SELECT id, title, slug, excerpt, status, featured_image, created_at, published_at
       FROM blog_posts
       ORDER BY created_at DESC`
    )

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return invalidOriginResponse()
  }

  const user = await requireAdminUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const parsedBody = blogPostSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid blog post payload' }, { status: 400 })
    }

    const { title, slug, excerpt, content, status, featuredImage } = parsedBody.data

    const data = await dbOne<AdminBlogPostRow>(
      `INSERT INTO blog_posts
         (title, slug, excerpt, content, status, featured_image, author_id, published_at)
       VALUES
         ($1, $2, $3, $4, $5::varchar, $6, $7, CASE WHEN $5::varchar = 'published' THEN NOW() ELSE NULL END)
       RETURNING id, title, slug, excerpt, status, featured_image, created_at, published_at`,
      [title, slug, excerpt, content, status, featuredImage, user.id]
    )

    if (data) {
      await writeAdminAuditLog(request, user, {
        action: 'blog_post.created',
        entityType: 'blog_post',
        entityId: data.id,
        details: {
          slug: data.slug,
          status: data.status,
        },
      })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }

    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

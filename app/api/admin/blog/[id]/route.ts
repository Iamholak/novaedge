import { NextRequest, NextResponse } from 'next/server'

import {
  invalidOriginResponse,
  isSameOriginRequest,
  requireAdminUser,
  unauthorizedResponse,
} from '@/lib/admin-auth'
import { writeAdminAuditLog } from '@/lib/audit-log'
import { dbOne, dbQuery } from '@/lib/db'
import { blogPostSchema } from '@/lib/validation'

type BlogPostRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: string
  featured_image: string | null
  created_at: string
  updated_at: string | null
  published_at: string | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdminUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await params
    const data = await dbOne<BlogPostRow>(
      `SELECT id, title, slug, excerpt, content, status, featured_image, created_at, updated_at, published_at
       FROM blog_posts
       WHERE id = $1`,
      [id]
    )

    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await writeAdminAuditLog(request, user, {
      action: 'blog_post.updated',
      entityType: 'blog_post',
      entityId: data.id,
      details: {
        slug: data.slug,
        status: data.status,
      },
    })

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const { title, slug, excerpt, content, status, featuredImage } = parsedBody.data

    const data = await dbOne<BlogPostRow>(
      `UPDATE blog_posts
       SET
         title = $1,
         slug = $2,
         excerpt = $3,
         content = $4,
         status = $5,
         featured_image = $6,
         published_at = CASE
           WHEN $5 = 'published' AND published_at IS NULL THEN NOW()
           WHEN $5 = 'draft' THEN NULL
           ELSE published_at
         END,
         updated_at = NOW()
       WHERE id = $7
       RETURNING id, title, slug, excerpt, content, status, featured_image, created_at, updated_at, published_at`,
      [title, slug, excerpt, content, status, featuredImage, id]
    )

    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }

    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSameOriginRequest(request)) {
    return invalidOriginResponse()
  }

  const user = await requireAdminUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await params
    const existing = await dbOne<Pick<BlogPostRow, 'id' | 'slug' | 'status'>>(
      `SELECT id, slug, status
       FROM blog_posts
       WHERE id = $1`,
      [id]
    )

    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await dbQuery(`DELETE FROM blog_posts WHERE id = $1`, [id])
    await writeAdminAuditLog(request, user, {
      action: 'blog_post.deleted',
      entityType: 'blog_post',
      entityId: existing.id,
      details: {
        slug: existing.slug,
        status: existing.status,
      },
    })

    return NextResponse.json({ message: 'Post deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

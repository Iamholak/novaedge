import { NextRequest, NextResponse } from 'next/server'

import {
  invalidOriginResponse,
  isSameOriginRequest,
  requireAdminUser,
  unauthorizedResponse,
} from '@/lib/admin-auth'
import { writeAdminAuditLog } from '@/lib/audit-log'
import { dbOne, dbQuery } from '@/lib/db'
import { projectInquiryStatusSchema } from '@/lib/validation'

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
    const parsedBody = projectInquiryStatusSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid inquiry status' }, { status: 400 })
    }

    const { id } = await params
    const data = await dbOne(
      `UPDATE project_inquiries
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [parsedBody.data.status, id]
    )

    if (!data) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    await writeAdminAuditLog(request, user, {
      action: 'project_inquiry.status_updated',
      entityType: 'project_inquiry',
      entityId: id,
      details: {
        status: parsedBody.data.status,
      },
    })

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error updating inquiry:', error)
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
    const existing = await dbOne<{ id: string; email: string; company: string | null; status: string }>(
      `SELECT id, email, company, status
       FROM project_inquiries
       WHERE id = $1`,
      [id]
    )

    if (!existing) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    await dbQuery(`DELETE FROM project_inquiries WHERE id = $1`, [id])
    await writeAdminAuditLog(request, user, {
      action: 'project_inquiry.deleted',
      entityType: 'project_inquiry',
      entityId: existing.id,
      details: {
        email: existing.email,
        company: existing.company,
        status: existing.status,
      },
    })

    return NextResponse.json({ message: 'Inquiry deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting inquiry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

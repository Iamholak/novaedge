import { NextRequest, NextResponse } from 'next/server'

import {
  invalidOriginResponse,
  isSameOriginRequest,
  requireAdminUser,
  unauthorizedResponse,
} from '@/lib/admin-auth'
import { writeAdminAuditLog } from '@/lib/audit-log'
import { dbOne, dbQuery } from '@/lib/db'
import { contactMessageStatusSchema } from '@/lib/validation'

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
    const parsedBody = contactMessageStatusSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid message status' }, { status: 400 })
    }

    const { id } = await params
    const data = await dbOne(
      `UPDATE contact_messages
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [parsedBody.data.status, id]
    )

    if (!data) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    await writeAdminAuditLog(request, user, {
      action: 'contact_message.status_updated',
      entityType: 'contact_message',
      entityId: id,
      details: {
        status: parsedBody.data.status,
      },
    })

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error updating message:', error)
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
    const existing = await dbOne<{ id: string; email: string; subject: string; status: string }>(
      `SELECT id, email, subject, status
       FROM contact_messages
       WHERE id = $1`,
      [id]
    )

    if (!existing) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    await dbQuery(`DELETE FROM contact_messages WHERE id = $1`, [id])
    await writeAdminAuditLog(request, user, {
      action: 'contact_message.deleted',
      entityType: 'contact_message',
      entityId: existing.id,
      details: {
        email: existing.email,
        subject: existing.subject,
        status: existing.status,
      },
    })

    return NextResponse.json({ message: 'Message deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

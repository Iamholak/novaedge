import { NextRequest, NextResponse } from 'next/server'

import {
  invalidOriginResponse,
  isSameOriginRequest,
  requireAdminUser,
  unauthorizedResponse,
} from '@/lib/admin-auth'
import { writeAdminAuditLog } from '@/lib/audit-log'
import { dbOne } from '@/lib/db'
import { companyStatSchema } from '@/lib/validation'

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
    const body = await request.json()
    const parsedBody = companyStatSchema.safeParse({
      value: typeof body?.value === 'number' ? body.value : Number(body?.value),
    })
    if (!parsedBody.success) {
      return NextResponse.json({ success: false, error: 'Invalid stat value' }, { status: 400 })
    }

    const { id: statKey } = await params
    const data = await dbOne(
      `UPDATE company_stats
       SET value = $1, updated_at = NOW()
       WHERE stat_key = $2
       RETURNING id, stat_key, value, updated_at`,
      [parsedBody.data.value, statKey]
    )

    if (!data) {
      return NextResponse.json({ success: false, error: 'Stat not found' }, { status: 404 })
    }

    await writeAdminAuditLog(request, user, {
      action: 'company_stat.updated',
      entityType: 'company_stat',
      entityId: data.id,
      details: {
        statKey: data.stat_key,
        value: data.value,
      },
    })

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update stat' }, { status: 500 })
  }
}

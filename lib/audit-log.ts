import 'server-only'

import { NextRequest } from 'next/server'

import { dbQuery } from '@/lib/db'
import { SQL } from '@/lib/sql'

type AdminAuditActor = {
  id: string
  email: string
}

type AdminAuditEntry = {
  action: string
  entityType: string
  entityId: string
  details?: Record<string, unknown>
}

function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function writeAdminAuditLog(
  request: NextRequest,
  actor: AdminAuditActor,
  entry: AdminAuditEntry
) {
  await dbQuery(SQL.auditLogs.insert, [
    actor.id,
    actor.email,
    entry.action,
    entry.entityType,
    entry.entityId,
    getClientIp(request),
    request.headers.get('user-agent') || '',
    JSON.stringify(entry.details ?? {}),
  ])
}

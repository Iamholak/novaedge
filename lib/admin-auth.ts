import { NextRequest, NextResponse } from 'next/server'

import { getSessionUser } from '@/lib/auth'

export async function requireAdminUser(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value

  if (!token) {
    return null
  }

  return getSessionUser(token)
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } }
  )
}

export function invalidOriginResponse() {
  return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
}

export function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!origin) {
    return false
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

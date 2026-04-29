import { NextRequest, NextResponse } from 'next/server'

import {
  invalidOriginResponse,
  isSameOriginRequest,
  unauthorizedResponse,
} from '@/lib/admin-auth'
import { deleteSession, getSessionUser } from '@/lib/auth'
import { writeAdminAuditLog } from '@/lib/audit-log'

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return invalidOriginResponse()
    }

    const token = request.cookies.get('admin_session')?.value
    if (!token) {
      return unauthorizedResponse()
    }

    const user = await getSessionUser(token)
    await deleteSession(token)

    if (user) {
      await writeAdminAuditLog(request, user, {
        action: 'admin.logout',
        entityType: 'admin_user',
        entityId: user.id,
        details: {
          email: user.email,
        },
      })
    }

    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )

    response.cookies.delete('admin_session')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_session')?.value
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = await getSessionUser(token)
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

import { writeAdminAuditLog } from '@/lib/audit-log'
import { invalidOriginResponse, isSameOriginRequest } from '@/lib/admin-auth'
import { createSession, getAdminUser, verifyPassword } from '@/lib/auth'
import { consumeRateLimit } from '@/lib/rate-limit'
import { adminLoginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return invalidOriginResponse()
    }

    const parsedBody = adminLoginSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }

    const { email, password } = parsedBody.data
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const limiter = await consumeRateLimit(`admin-login:${clientIp}:${email}`, 5, 15 * 60 * 1000)

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil(limiter.retryAfterMs / 1000).toString() },
        }
      )
    }

    const user = await getAdminUser(email)
    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const sessionResult = await createSession(user.id, expiresAt)
    await writeAdminAuditLog(request, user, {
      action: 'admin.login',
      entityType: 'admin_user',
      entityId: user.id,
      details: {
        email: user.email,
      },
    })

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )

    response.cookies.set({
      name: 'admin_session',
      value: sessionResult.token,
      httpOnly: true,
      secure:
        process.env.SESSION_COOKIE_SECURE === 'true' ||
        (process.env.SESSION_COOKIE_SECURE !== 'false' &&
          process.env.NODE_ENV === 'production'),
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

import {
  invalidOriginResponse,
  isSameOriginRequest,
  requireAdminUser,
  unauthorizedResponse,
} from '@/lib/admin-auth'
import { getEmailSettings, saveEmailSettings } from '@/lib/email-settings'
import { verifyMailSettings } from '@/lib/mail'
import { writeAdminAuditLog } from '@/lib/audit-log'
import { emailSettingsSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const user = await requireAdminUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const settings = await getEmailSettings()
    return NextResponse.json(
      {
        data: {
          ...settings,
          smtpPassword: settings.smtpPassword ? '********' : '',
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Email settings fetch error:', error)
    return NextResponse.json({ error: 'Failed to load email settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return invalidOriginResponse()
  }

  const user = await requireAdminUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const existing = await getEmailSettings()
    const parsedBody = emailSettingsSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid email settings payload' }, { status: 400 })
    }

    const nextSettings = {
      ...parsedBody.data,
      smtpPassword:
        parsedBody.data.smtpPassword === '********'
          ? existing.smtpPassword
          : parsedBody.data.smtpPassword,
    }

    if (nextSettings.provider === 'smtp' && !nextSettings.smtpPassword) {
      return NextResponse.json({ error: 'SMTP password is required' }, { status: 400 })
    }

    await verifyMailSettings(nextSettings)

    await saveEmailSettings(nextSettings)
    await writeAdminAuditLog(request, user, {
      action: 'email_settings.updated',
      entityType: 'app_settings',
      entityId: 'email_settings',
      details: {
        provider: nextSettings.provider,
        fromEmail: nextSettings.fromEmail,
        adminNotificationEmail: nextSettings.adminNotificationEmail,
        smtpHost: nextSettings.provider === 'smtp' ? nextSettings.smtpHost : '',
        smtpPort: nextSettings.provider === 'smtp' ? nextSettings.smtpPort : null,
        smtpSecure: nextSettings.provider === 'smtp' ? nextSettings.smtpSecure : null,
        smtpUser: nextSettings.provider === 'smtp' ? nextSettings.smtpUser : '',
      },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Email settings update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save email settings' },
      { status: 400 }
    )
  }
}

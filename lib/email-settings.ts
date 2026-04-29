import 'server-only'

import { dbOne, dbQuery } from '@/lib/db'
import { decryptSecret, encryptSecret } from '@/lib/crypto'
import { SQL } from '@/lib/sql'

export type EmailProvider = 'resend' | 'smtp'

export type EmailSettings = {
  provider: EmailProvider
  fromEmail: string
  adminNotificationEmail: string
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPassword: string
}

type EmailSettingsRow = {
  setting_value: {
    provider?: EmailProvider
    fromEmail?: string
    adminNotificationEmail?: string
    smtpHost?: string
    smtpPort?: number
    smtpSecure?: boolean
    smtpUser?: string
    smtpPasswordEncrypted?: string
  } | null
}

const EMAIL_SETTINGS_KEY = 'email_settings'

function getDefaultSettings(): EmailSettings {
  return {
    provider: (process.env.EMAIL_PROVIDER as EmailProvider) || 'resend',
    fromEmail: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@novaedge.com',
    adminNotificationEmail:
      process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@novaedge.com',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
  }
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const defaults = getDefaultSettings()
  const row = await dbOne<EmailSettingsRow>(SQL.emailSettings.selectByKey, [EMAIL_SETTINGS_KEY])

  const stored = row?.setting_value
  if (!stored) {
    return defaults
  }

  return {
    provider: stored.provider || defaults.provider,
    fromEmail: stored.fromEmail || defaults.fromEmail,
    adminNotificationEmail:
      stored.adminNotificationEmail || defaults.adminNotificationEmail,
    smtpHost: stored.smtpHost || defaults.smtpHost,
    smtpPort: stored.smtpPort || defaults.smtpPort,
    smtpSecure: stored.smtpSecure ?? defaults.smtpSecure,
    smtpUser: stored.smtpUser || defaults.smtpUser,
    smtpPassword: stored.smtpPasswordEncrypted
      ? decryptSecret(stored.smtpPasswordEncrypted)
      : defaults.smtpPassword,
  }
}

export async function saveEmailSettings(
  settings: Omit<EmailSettings, 'smtpPassword'> & {
    smtpPassword?: string
  }
) {
  const existing = await getEmailSettings()
  const smtpPassword =
    settings.smtpPassword && settings.smtpPassword.trim()
      ? settings.smtpPassword.trim()
      : existing.smtpPassword

  const payload = {
    provider: settings.provider,
    fromEmail: settings.fromEmail,
    adminNotificationEmail: settings.adminNotificationEmail,
    smtpHost: settings.smtpHost,
    smtpPort: settings.smtpPort,
    smtpSecure: settings.smtpSecure,
    smtpUser: settings.smtpUser,
    smtpPasswordEncrypted: smtpPassword ? encryptSecret(smtpPassword) : '',
  }

  await dbQuery(SQL.emailSettings.upsertByKey, [EMAIL_SETTINGS_KEY, JSON.stringify(payload)])
}

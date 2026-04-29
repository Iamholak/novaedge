import 'server-only'

import nodemailer from 'nodemailer'
import { Resend } from 'resend'

import { getEmailSettings } from '@/lib/email-settings'

type SendMailInput = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

function createSmtpTransport(settings: Awaited<ReturnType<typeof getEmailSettings>>) {
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
  })
}

export async function verifyMailSettings(
  settings: Awaited<ReturnType<typeof getEmailSettings>>
) {
  if (settings.provider === 'smtp') {
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      throw new Error('SMTP is selected but SMTP settings are incomplete')
    }

    await createSmtpTransport(settings).verify()
    return
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
}

export async function sendMail({ to, subject, html, replyTo }: SendMailInput) {
  const settings = await getEmailSettings()

  if (settings.provider === 'smtp') {
    await createSmtpTransport(settings).sendMail({
      from: settings.fromEmail,
      to,
      subject,
      html,
      replyTo,
    })

    return
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const resend = new Resend(resendApiKey)
  await resend.emails.send({
    from: settings.fromEmail,
    to,
    subject,
    html,
    replyTo,
  })
}

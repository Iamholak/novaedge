import { NextRequest, NextResponse } from 'next/server'

import { invalidOriginResponse, isSameOriginRequest } from '@/lib/admin-auth'
import { escapeHtml } from '@/lib/content'
import { dbQuery } from '@/lib/db'
import { getEmailSettings } from '@/lib/email-settings'
import { sendMail } from '@/lib/mail'
import { consumeRateLimit } from '@/lib/rate-limit'
import { contactMessageSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return invalidOriginResponse()
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const limiter = await consumeRateLimit(`contact:${clientIp}`, 5, 10 * 60 * 1000)

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil(limiter.retryAfterMs / 1000).toString() },
        }
      )
    }

    const parsedBody = contactMessageSchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 })
    }

    const { name, email, subject, message } = parsedBody.data

    await dbQuery(
      `INSERT INTO contact_messages (name, email, subject, message, status)
       VALUES ($1, $2, $3, $4, 'new')`,
      [name, email, subject, message]
    )

    try {
      const settings = await getEmailSettings()
      await sendMail({
        to: settings.adminNotificationEmail,
        replyTo: email,
        subject: `New contact message: ${subject}`,
        html: `
          <h2>New contact message</h2>
          <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p>${escapeHtml(message).replaceAll('\n', '<br />')}</p>
        `,
      })
    } catch (mailError) {
      console.error('Contact email delivery error:', mailError)
    }

    return NextResponse.json(
      { success: true, message: 'Message received successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

import { invalidOriginResponse, isSameOriginRequest } from '@/lib/admin-auth'
import { escapeHtml } from '@/lib/content'
import { dbQuery } from '@/lib/db'
import { getEmailSettings } from '@/lib/email-settings'
import { sendMail } from '@/lib/mail'
import { consumeRateLimit } from '@/lib/rate-limit'
import { projectInquirySchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return invalidOriginResponse()
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const limiter = await consumeRateLimit(`project-inquiry:${clientIp}`, 5, 10 * 60 * 1000)

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil(limiter.retryAfterMs / 1000).toString() },
        }
      )
    }

    const parsedBody = projectInquirySchema.safeParse(await request.json())
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid project inquiry' }, { status: 400 })
    }

    const { name, email, company, phone, projectDescription, budget, timeline } = parsedBody.data

    await dbQuery(
      `INSERT INTO project_inquiries
         (name, email, company, phone, project_description, budget, timeline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')`,
      [name, email, company, phone, projectDescription, budget, timeline]
    )

    try {
      const settings = await getEmailSettings()
      const companyHtml = company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ''
      const phoneHtml = phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''
      const budgetHtml = budget ? `<p><strong>Budget:</strong> ${escapeHtml(budget)}</p>` : ''
      const timelineHtml = timeline
        ? `<p><strong>Timeline:</strong> ${escapeHtml(timeline)}</p>`
        : ''

      await sendMail({
        to: settings.adminNotificationEmail,
        replyTo: email,
        subject: `New Project Inquiry from ${name}`,
        html: `
          <h2>New project inquiry</h2>
          <p><strong>From:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${companyHtml}
          ${phoneHtml}
          <p><strong>Project description:</strong></p>
          <p>${escapeHtml(projectDescription).replaceAll('\n', '<br />')}</p>
          ${budgetHtml}
          ${timelineHtml}
        `,
      })
    } catch (mailError) {
      console.error('Project inquiry email delivery error:', mailError)
    }

    return NextResponse.json({ message: 'Inquiry sent successfully' }, { status: 201 })
  } catch (error) {
    console.error('Project inquiry API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

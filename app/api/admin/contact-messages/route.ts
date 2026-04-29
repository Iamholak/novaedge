import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser, unauthorizedResponse } from '@/lib/admin-auth'
import { dbMany } from '@/lib/db'

type ContactMessageRow = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
  updated_at: string | null
}

export async function GET(request: NextRequest) {
  const user = await requireAdminUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const data = await dbMany<ContactMessageRow>(
      `SELECT id, name, email, subject, message, status, created_at, updated_at
       FROM contact_messages
       ORDER BY created_at DESC`
    )

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

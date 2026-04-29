import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser, unauthorizedResponse } from '@/lib/admin-auth'
import { dbMany } from '@/lib/db'

type ProjectInquiryRow = {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  project_description: string
  budget: string | null
  timeline: string | null
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
    const data = await dbMany<ProjectInquiryRow>(
      `SELECT id, name, email, company, phone, project_description, budget, timeline, status, created_at, updated_at
       FROM project_inquiries
       ORDER BY created_at DESC`
    )

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

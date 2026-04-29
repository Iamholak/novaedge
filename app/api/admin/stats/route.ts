import { NextRequest, NextResponse } from 'next/server'

import { requireAdminUser, unauthorizedResponse } from '@/lib/admin-auth'
import { dbMany } from '@/lib/db'

type CompanyStatRow = {
  id: string
  stat_key: string
  value: number
  updated_at: string | null
}

export async function GET(request: NextRequest) {
  const user = await requireAdminUser(request)
  if (!user) {
    return unauthorizedResponse()
  }

  try {
    const data = await dbMany<CompanyStatRow>(
      `SELECT id, stat_key, value, updated_at
       FROM company_stats
       ORDER BY stat_key ASC`
    )

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}

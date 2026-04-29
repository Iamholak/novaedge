import { NextResponse } from 'next/server'

import { dbMany } from '@/lib/db'

type PublicStatRow = {
  stat_key: string
  value: number
}

const PUBLIC_STATS = ['clients_served', 'success_rate', 'team_experts', 'years_excellence']

export async function GET() {
  try {
    const data = await dbMany<PublicStatRow>(
      `SELECT stat_key, value
       FROM company_stats
       WHERE stat_key = ANY($1::text[])
       ORDER BY stat_key ASC`,
      [PUBLIC_STATS]
    )

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('Public stats API error:', error)
    return NextResponse.json({ data: [] }, { status: 200 })
  }
}

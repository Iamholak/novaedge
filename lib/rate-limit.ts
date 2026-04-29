import 'server-only'

import { dbOne, dbQuery } from '@/lib/db'
import { SQL } from '@/lib/sql'

type RateLimitRow = {
  allowed: boolean
  count: number
  retry_after_ms: string | number
}

let lastCleanupAt = 0

async function cleanupExpiredBuckets() {
  const now = Date.now()
  if (now - lastCleanupAt < 60_000) {
    return
  }

  lastCleanupAt = now
  await dbQuery(SQL.rateLimits.cleanupExpired)
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  void cleanupExpiredBuckets()

  const row = await dbOne<RateLimitRow>(SQL.rateLimits.consume, [key, limit, windowMs])
  if (!row) {
    return { allowed: true, retryAfterMs: 0 }
  }

  return {
    allowed: row.allowed,
    retryAfterMs: Number(row.retry_after_ms || 0),
  }
}

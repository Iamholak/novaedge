import 'server-only'

import { Pool, type QueryResultRow } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __novaEdgeDbPool: Pool | undefined
}

function resolveSslConfig() {
  if (process.env.POSTGRES_SSL === 'disable') {
    return false
  }

  if (process.env.POSTGRES_SSL === 'require' || process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false }
  }

  return false
}

function createPool() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }

  return new Pool({
    connectionString,
    ssl: resolveSslConfig(),
    max: 10,
    idleTimeoutMillis: 30_000,
  })
}

function getPool() {
  if (!global.__novaEdgeDbPool) {
    global.__novaEdgeDbPool = createPool()
  }

  return global.__novaEdgeDbPool
}

export async function dbQuery<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = []
) {
  return getPool().query<T>(text, [...params])
}

export async function dbMany<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = []
) {
  const result = await dbQuery<T>(text, params)
  return result.rows
}

export async function dbOne<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = []
) {
  const result = await dbQuery<T>(text, params)
  return result.rows[0] ?? null
}

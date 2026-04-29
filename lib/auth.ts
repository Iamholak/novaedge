import bcrypt from 'bcrypt'
import crypto from 'crypto'

import { dbOne, dbQuery } from '@/lib/db'
import { normalizeEmail } from '@/lib/content'
import { SQL } from '@/lib/sql'

type AdminUserRecord = {
  id: string
  email: string
  password_hash: string
  full_name: string | null
  is_active: boolean
}

type SessionUserRecord = {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
}

function hashSessionToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createAdminUser(
  email: string,
  password: string,
  fullName: string
) {
  const passwordHash = await hashPassword(password)

  const result = await dbQuery<AdminUserRecord>(SQL.auth.insertAdminUser, [
    normalizeEmail(email),
    passwordHash,
    fullName.trim(),
  ])

  return result.rows[0]
}

export async function getAdminUser(email: string) {
  return dbOne<AdminUserRecord>(SQL.auth.selectAdminUserByEmail, [normalizeEmail(email)])
}

export async function createSession(userId: string, expiresAt: Date) {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashSessionToken(token)

  await dbQuery(SQL.auth.insertAdminSession, [userId, tokenHash, expiresAt.toISOString()])

  return { token }
}

export async function getSessionUser(token: string) {
  return dbOne<SessionUserRecord>(SQL.auth.selectSessionUserByToken, [hashSessionToken(token)])
}

export async function deleteSession(token: string) {
  await dbQuery(SQL.auth.deleteSessionByToken, [hashSessionToken(token)])
}

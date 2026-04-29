import crypto from 'crypto'

function getEncryptionKey() {
  const secret = process.env.APP_ENCRYPTION_KEY
  if (!secret) {
    throw new Error('APP_ENCRYPTION_KEY is required for encrypted settings')
  }

  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptSecret(value: string) {
  const [ivHex, authTagHex, encryptedHex] = value.split(':')
  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted secret format')
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(ivHex, 'hex')
  )
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

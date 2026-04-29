const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const MULTISPACE = /[ \t]{2,}/g

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function normalizePlainText(value: string) {
  return value.replace(CONTROL_CHARS, '').replace(MULTISPACE, ' ').trim()
}

export function normalizeMultilineText(value: string) {
  return value
    .replace(CONTROL_CHARS, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function normalizeSlug(value: string) {
  return normalizePlainText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function normalizeOptionalHttpUrl(value?: string | null) {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const parsed = new URL(trimmed)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed')
  }

  return parsed.toString()
}

export function isLikelyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

export function safeMarkdownUrl(value: string) {
  if (!value) {
    return ''
  }

  if (value.startsWith('/') || value.startsWith('#')) {
    return value
  }

  try {
    const parsed = new URL(value)
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return parsed.toString()
    }
  } catch {
    return ''
  }

  return ''
}

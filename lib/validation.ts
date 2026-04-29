import { z } from 'zod'

import {
  normalizeEmail,
  normalizeMultilineText,
  normalizeOptionalHttpUrl,
  normalizePlainText,
  normalizeSlug,
} from '@/lib/content'

const plainText = (min: number, max: number) =>
  z.string().transform(normalizePlainText).pipe(z.string().min(min).max(max))

const optionalPlainText = (max: number) =>
  z
    .string()
    .transform(normalizePlainText)
    .pipe(z.string().max(max))
    .optional()
    .nullable()

const multilineText = (min: number, max: number) =>
  z.string().transform(normalizeMultilineText).pipe(z.string().min(min).max(max))

const emailAddress = z
  .string()
  .transform(normalizeEmail)
  .pipe(z.string().email().max(254))

const booleanInput = z
  .union([z.boolean(), z.string()])
  .transform((value) => (typeof value === 'boolean' ? value : value === 'true'))

const smtpHost = z
  .string()
  .transform(normalizePlainText)
  .pipe(z.string().min(1).max(255).regex(/^[a-zA-Z0-9.-]+$/))

export const adminLoginSchema = z.object({
  email: emailAddress,
  password: z.string().min(8).max(128),
})

export const contactMessageSchema = z.object({
  name: plainText(2, 100),
  email: emailAddress,
  subject: plainText(3, 150),
  message: multilineText(10, 5000),
})

export const projectInquirySchema = z.object({
  name: plainText(2, 100),
  email: emailAddress,
  company: optionalPlainText(120),
  phone: optionalPlainText(40),
  projectDescription: multilineText(20, 10000),
  budget: optionalPlainText(100),
  timeline: optionalPlainText(100),
})

export const blogPostSchema = z.object({
  title: plainText(3, 160),
  slug: z
    .string()
    .transform(normalizeSlug)
    .pipe(z.string().min(3).max(160)),
  excerpt: multilineText(10, 320),
  content: multilineText(20, 50_000),
  status: z.enum(['draft', 'published']),
  featuredImage: z
    .string()
    .optional()
    .nullable()
    .transform((value) => normalizeOptionalHttpUrl(value)),
})

export const contactMessageStatusSchema = z.object({
  status: z.enum(['new', 'read', 'archived']),
})

export const projectInquiryStatusSchema = z.object({
  status: z.enum(['new', 'reviewing', 'quoted', 'completed']),
})

export const companyStatSchema = z.object({
  value: z.number().int().min(0).max(1_000_000),
})

export const emailSettingsSchema = z
  .object({
    provider: z.enum(['resend', 'smtp']),
    fromEmail: emailAddress,
    adminNotificationEmail: emailAddress,
    smtpHost: z.string().optional().default(''),
    smtpPort: z.coerce.number().int().min(1).max(65535).default(587),
    smtpSecure: booleanInput.default(false),
    smtpUser: z.string().optional().default(''),
    smtpPassword: z.string().max(512).optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.provider !== 'smtp') {
      return
    }

    const normalizedHost = normalizePlainText(value.smtpHost)
    const normalizedUser = normalizePlainText(value.smtpUser)
    const normalizedPassword = value.smtpPassword.trim()

    if (!smtpHost.safeParse(normalizedHost).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['smtpHost'],
        message: 'Enter a valid SMTP host.',
      })
    }

    if (!normalizedUser) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['smtpUser'],
        message: 'SMTP username is required.',
      })
    }

    if (!normalizedPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['smtpPassword'],
        message: 'SMTP password is required.',
      })
    }
  })
  .transform((value) => ({
    provider: value.provider,
    fromEmail: value.fromEmail,
    adminNotificationEmail: value.adminNotificationEmail,
    smtpHost: normalizePlainText(value.smtpHost),
    smtpPort: value.smtpPort,
    smtpSecure: value.smtpSecure,
    smtpUser: normalizePlainText(value.smtpUser),
    smtpPassword: value.smtpPassword.trim(),
  }))

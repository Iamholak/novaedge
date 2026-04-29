# NovaEdge Solutions Setup

## Overview
This project uses Next.js with a direct PostgreSQL connection for:
- admin authentication and dashboard access
- contact and project inquiry intake
- blog publishing and public blog pages
- company statistics and app settings management
- Resend or custom SMTP email delivery

## Environment

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/nova_edge
POSTGRES_SSL=disable
SESSION_COOKIE_SECURE=false
APP_ENCRYPTION_KEY=replace-with-a-long-random-secret

EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@novaedge.com
ADMIN_NOTIFICATION_EMAIL=hello@novaedge.com

RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@novaedge.com

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
```

## Database Setup

### 1. Provision PostgreSQL
- create a PostgreSQL database
- set `DATABASE_URL`
- set `POSTGRES_SSL=require` for hosted production databases unless your provider specifies otherwise

### 2. Run the canonical schema
Use `scripts/init-database.sql`. This is the canonical setup script.

Provider SQL editor:
1. Open your PostgreSQL provider's SQL editor
2. Paste `scripts/init-database.sql`
3. Run it

CLI:

```bash
psql postgresql://[user]:[password]@[host]/[database] < scripts/init-database.sql
```

### 3. Create an admin user
The schema does not seed a default admin account. Create one explicitly:

```sql
INSERT INTO admin_users (email, password_hash, full_name, is_active)
VALUES (
  'admin@novaedge.com',
  '$2b$12$...',
  'Admin Name',
  true
);
```

Generate a new bcrypt hash when rotating credentials, then update that admin user's `password_hash` directly.

## Email Setup

Configure email delivery in `/admin/email-settings`:
- `Resend` uses `RESEND_API_KEY`
- `Custom SMTP` stores encrypted SMTP settings in `app_settings`

Saving SMTP settings now validates the payload and verifies connectivity before persistence.

## Security Baseline

- passwords are hashed with bcrypt using 12 rounds
- admin sessions use HTTP-only cookies with production-safe `Secure` handling
- state-changing requests enforce same-origin checks
- admin login, contact, and inquiry endpoints use PostgreSQL-backed rate limiting
- privileged admin mutations write to `admin_audit_logs`
- blog content and admin/public inputs are validated server-side
- baseline CSP and browser security headers are set in `next.config.mjs`

## Main Tables

- `admin_users`
- `admin_sessions`
- `contact_messages`
- `project_inquiries`
- `blog_posts`
- `blog_categories`
- `blog_post_categories`
- `company_stats`
- `app_settings`
- `rate_limit_buckets`
- `admin_audit_logs`

## Common Tasks

### Start development

```bash
npm run dev
```

### Production verification

```bash
npx tsc --noEmit
npm run build
```

### Configure email provider
1. Log in at `/admin/login`
2. Open `/admin/email-settings`
3. Save either Resend or SMTP settings

### Publish a blog post
1. Open `/admin/blog`
2. Create or edit a post
3. Set status to `published`

## Troubleshooting

**Login fails**
- confirm the admin user exists in `admin_users`
- confirm the stored password hash is valid bcrypt
- confirm cookies are enabled

**Email settings fail to save**
- confirm the selected provider credentials are correct
- for SMTP, confirm host, port, user, and password are valid and reachable
- for Resend, confirm `RESEND_API_KEY` is configured server-side

**Migration issues**
- confirm `DATABASE_URL`
- rerun `scripts/init-database.sql`
- if you previously used an older script, rerun the canonical script so `app_settings`, `rate_limit_buckets`, and `admin_audit_logs` exist

# NovaEdge Website

Production-focused Next.js website for NovaEdge Solutions with public marketing pages, blog publishing, contact intake, project inquiries, and a secured admin dashboard.

## Stack

- Next.js 16 App Router
- React 19
- PostgreSQL via `pg`
- Tailwind CSS
- Zod validation
- Resend or custom SMTP email delivery
- Monaco editor for admin blog editing

## Features

- Public pages: home, services, about, careers, blog, press, FAQ, privacy, terms, contact, and get-started flow
- Admin dashboard: blog posts, contact messages, project inquiries, company stats, and email provider settings
- Blog rendering with Markdown support and sanitized HTML handling
- PostgreSQL-backed sessions, rate limiting, app settings, and audit logs
- Baseline CSP and browser security headers
- No default admin credentials are seeded by the schema

## Setup

Install dependencies:

```bash
npm install
```

Create local environment:

```bash
cp .env.example .env.local
```

Configure at minimum:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/nova_edge
POSTGRES_SSL=disable
SESSION_COOKIE_SECURE=false
APP_ENCRYPTION_KEY=replace-with-a-long-random-secret

EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@novaedge.com
ADMIN_NOTIFICATION_EMAIL=hello@novaedge.com
RESEND_API_KEY=
```

For production, set `POSTGRES_SSL=require` unless your database provider documents another value, set a strong `APP_ENCRYPTION_KEY`, and set `SESSION_COOKIE_SECURE=true`.

## Database

There is one canonical SQL setup file:

```text
scripts/init-database.sql
```

Run it against PostgreSQL:

```bash
psql "$DATABASE_URL" < scripts/init-database.sql
```

The script creates the application tables, including:

- `admin_users`
- `admin_sessions`
- `contact_messages`
- `project_inquiries`
- `blog_posts`
- `company_stats`
- `app_settings`
- `rate_limit_buckets`
- `admin_audit_logs`

Create the first admin manually after running the schema:

```sql
INSERT INTO admin_users (email, password_hash, full_name, is_active)
VALUES (
  'admin@example.com',
  '$2b$12$replace_with_generated_bcrypt_hash',
  'Admin User',
  true
);
```

Do not commit real credentials or reusable password hashes.

## Development

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run TypeScript checks:

```bash
npx tsc --noEmit
```

## Admin

Admin login:

```text
/admin/login
```

Admin pages:

- `/admin/dashboard`
- `/admin/blog`
- `/admin/contact-messages`
- `/admin/project-inquiries`
- `/admin/stats`
- `/admin/email-settings`

Email provider settings are managed in `/admin/email-settings`. Resend uses server env vars, while SMTP settings are validated and encrypted before being stored in PostgreSQL.

## Security Notes

- Admin session cookies are HTTP-only.
- Session tokens are hashed before database storage.
- State-changing endpoints enforce same-origin checks.
- Admin login, contact, and project inquiry endpoints use database-backed rate limits.
- Admin mutations write to `admin_audit_logs`.
- Inputs are validated server-side with Zod.
- Blog content is rendered through Markdown/HTML sanitization.
- CSP and baseline security headers are configured in `next.config.mjs`.

## Documentation

- [SETUP.md](./SETUP.md)
- [ADMIN_SETUP.md](./ADMIN_SETUP.md)
- [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- [nova-edge-website-design-threat-model.md](./nova-edge-website-design-threat-model.md)

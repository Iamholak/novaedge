# Database Setup

Use one canonical SQL script:

```text
scripts/init-database.sql
```

## Setup

Run the script against PostgreSQL:

```bash
psql "$DATABASE_URL" < scripts/init-database.sql
```

Or paste the contents of `scripts/init-database.sql` into your PostgreSQL provider's SQL editor.

## What It Creates

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

## Admin User

The schema intentionally does not create a default admin. Generate a bcrypt hash and insert your first admin manually:

```sql
INSERT INTO admin_users (email, password_hash, full_name, is_active)
VALUES (
  'admin@example.com',
  '$2b$12$replace_with_generated_bcrypt_hash',
  'Admin User',
  true
);
```

Never commit real credentials or reusable password hashes.

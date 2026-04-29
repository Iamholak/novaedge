# Admin Setup

## Login

Admin login URL:

```text
/admin/login
```

## Create The First Admin

The database setup does not seed a default admin account. This avoids shipping a known password into production.

1. Generate a bcrypt hash for your chosen password.
2. Insert the admin user into PostgreSQL:

```sql
INSERT INTO admin_users (email, password_hash, full_name, is_active)
VALUES (
  'admin@example.com',
  '$2b$12$replace_with_generated_bcrypt_hash',
  'Admin User',
  true
);
```

Use bcrypt cost 12 or higher. Do not commit plaintext passwords or real password hashes into the repository.

## Admin Features

- `/admin/dashboard` - admin hub
- `/admin/contact-messages` - contact form submissions
- `/admin/project-inquiries` - project inquiry submissions
- `/admin/blog` - blog post management
- `/admin/stats` - homepage statistics
- `/admin/email-settings` - Resend or custom SMTP configuration

## Security Notes

- Admin sessions use HTTP-only cookies.
- Session tokens are hashed before storage.
- Admin mutations enforce same-origin checks.
- Admin mutations are recorded in `admin_audit_logs`.
- Admin login uses PostgreSQL-backed rate limiting.
- Email provider settings are validated before they are saved.

## Required Environment

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

## Troubleshooting

**Cannot log in**
- Confirm the admin user exists in `admin_users`.
- Confirm the password hash is a valid bcrypt hash.
- Clear browser cookies and try again.

**Email settings fail**
- For Resend, confirm `RESEND_API_KEY` exists.
- For SMTP, confirm host, port, username, password, and TLS mode are valid.

**Admin data does not load**
- Confirm `DATABASE_URL` is correct.
- Run `scripts/init-database.sql`.

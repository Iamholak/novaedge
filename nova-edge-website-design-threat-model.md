# Nova Edge Website Design Threat Model

## Scope
- Next.js public marketing site and blog
- Admin authentication and admin APIs
- PostgreSQL-backed content, inquiries, contact messages, stats, and encrypted app settings
- Email delivery through Resend or SMTP

## Assumptions
- Internet-exposed deployment
- Single-tenant admin panel for internal staff
- HTTPS enabled in production
- PostgreSQL is reachable only from the app/runtime network

## Assets
- Admin session integrity
- Admin credentials
- Contact and inquiry data
- SMTP credentials and API keys
- Blog/content integrity
- Availability of admin login and public forms

## Trust Boundaries
- Browser to Next.js app routes and API routes
- Next.js server to PostgreSQL
- Next.js server to third-party email provider
- Admin-only routes vs public routes

## Primary Entry Points
- `/api/admin/login`
- `/api/admin/*`
- `/api/contact`
- `/api/project-inquiry`
- `/api/blog/*`
- `/api/stats`

## Key Threats
1. Brute-force and spam abuse against admin login and public form endpoints.
   Impact: admin account compromise or operational abuse.
   Existing controls: input validation, cookie-based sessions, in-process rate limiting.
   Gap: rate limiting is not durable across instances or serverless cold starts.

2. Unauthorized destructive admin actions.
   Impact: deletion or tampering of blog posts, inquiries, or contact messages.
   Existing controls: server-side auth checks and same-origin checks.
   Gap: no audit log, no secondary approval, no action history.

3. Secrets exposure or misuse in email provider configuration.
   Impact: outbound mail abuse, data exfiltration, or provider compromise.
   Existing controls: encrypted SMTP password storage and server-only mail transport.
   Gap: no secret rotation workflow, no validation/test flow, no admin action audit trail.

4. Stored content abuse through blog rendering.
   Impact: stored XSS or malicious outbound links in published content.
   Existing controls: markdown rendering and HTML sanitization.
   Gap: sanitization policy exists, but no CSP or Trusted Types defense-in-depth is visible in app code.

5. Deployment drift from schema mismatch.
   Impact: missing settings table or missing stats keys can break production features after migration.
   Existing controls: primary migration script includes new tables.
   Gap: alternate migration script is stale and can produce incomplete environments.

## Priority Mitigations
- Replace in-memory rate limiting with a shared store or edge/runtime-enforced rate limiter.
- Add admin audit logging for login, email-settings changes, deletes, and publish/unpublish actions.
- Add CSP and baseline security headers at app or edge level.
- Unify migration paths so all supported database bootstrap scripts create the same schema.
- Add operational controls for provider secrets: validation, rotation guidance, and failure alerting.

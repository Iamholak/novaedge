export const SQL = {
  auth: {
    insertAdminUser: `INSERT INTO admin_users (email, password_hash, full_name, is_active)
      VALUES ($1, $2, $3, TRUE)
      RETURNING id, email, password_hash, full_name, is_active`,
    selectAdminUserByEmail: `SELECT id, email, password_hash, full_name, is_active
      FROM admin_users
      WHERE email = $1`,
    insertAdminSession: `INSERT INTO admin_sessions (user_id, token, expires_at)
      VALUES ($1, $2, $3)`,
    selectSessionUserByToken: `SELECT u.id, u.email, u.full_name, u.is_active
      FROM admin_sessions s
      INNER JOIN admin_users u ON u.id = s.user_id
      WHERE s.token = $1
        AND s.expires_at > NOW()
        AND u.is_active = TRUE`,
    deleteSessionByToken: `DELETE FROM admin_sessions WHERE token = $1`,
  },
  emailSettings: {
    selectByKey: `SELECT setting_value
      FROM app_settings
      WHERE setting_key = $1`,
    upsertByKey: `INSERT INTO app_settings (setting_key, setting_value, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
  },
  rateLimits: {
    consume: `WITH existing AS (
        SELECT count, reset_at
        FROM rate_limit_buckets
        WHERE bucket_key = $1
      ),
      upsert AS (
        INSERT INTO rate_limit_buckets AS bucket (bucket_key, count, reset_at, updated_at)
        VALUES ($1, 1, NOW() + ($3 * INTERVAL '1 millisecond'), NOW())
        ON CONFLICT (bucket_key)
        DO UPDATE SET
          count = CASE
            WHEN bucket.reset_at <= NOW() THEN 1
            WHEN bucket.count < $2 THEN bucket.count + 1
            ELSE bucket.count
          END,
          reset_at = CASE
            WHEN bucket.reset_at <= NOW() THEN NOW() + ($3 * INTERVAL '1 millisecond')
            ELSE bucket.reset_at
          END,
          updated_at = NOW()
        RETURNING count, reset_at
      )
      SELECT
        upsert.count,
        GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (upsert.reset_at - NOW())) * 1000))::bigint AS retry_after_ms,
        CASE
          WHEN NOT EXISTS (SELECT 1 FROM existing) THEN TRUE
          WHEN (SELECT reset_at FROM existing) <= NOW() THEN TRUE
          WHEN (SELECT count FROM existing) < $2 THEN TRUE
          ELSE FALSE
        END AS allowed
      FROM upsert`,
    cleanupExpired: `DELETE FROM rate_limit_buckets
      WHERE reset_at <= NOW()`,
  },
  auditLogs: {
    insert: `INSERT INTO admin_audit_logs
      (actor_user_id, actor_email, action, entity_type, entity_id, ip_address, user_agent, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
  },
} as const

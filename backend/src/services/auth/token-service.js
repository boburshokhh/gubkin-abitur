const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const {
  JWT_SECRET,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_DAYS,
  IS_PRODUCTION
} = require('../../config/auth');
const { generateToken, hashToken } = require('./email-token-service');
const { logAuthEvent } = require('./audit-service');

function getRefreshCookieOptions(expiresAt = null) {
  return {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    path: '/api/auth',
    expires: expiresAt || undefined
  };
}

function setRefreshCookie(res, refreshToken, expiresAt) {
  res.cookie('refresh_token', refreshToken, getRefreshCookieOptions(expiresAt));
}

function clearRefreshCookie(res) {
  res.clearCookie('refresh_token', getRefreshCookieOptions());
}

function createAccessToken({ user, sessionId }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
      session_id: sessionId,
      jti: crypto.randomUUID()
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL_SECONDS }
  );
}

function toSessionPayload({ accessToken, user, expiresIn = ACCESS_TOKEN_TTL_SECONDS }) {
  return {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: expiresIn,
    user
  };
}

async function createSession({ user, req }) {
  const refreshToken = generateToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const result = await db.query(
    `INSERT INTO auth_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, expires_at`,
    [
      user.id,
      refreshTokenHash,
      req?.headers?.['user-agent'] || null,
      req?.ip || null,
      expiresAt
    ]
  );

  const session = result.rows[0];
  const accessToken = createAccessToken({ user, sessionId: session.id });
  await logAuthEvent({ userId: user.id, event: 'signin_success', email: user.email, sessionId: session.id, req });

  return {
    accessToken,
    refreshToken,
    refreshExpiresAt: session.expires_at,
    sessionId: session.id
  };
}

async function rotateRefreshSession({ refreshToken, req }) {
  const refreshTokenHash = hashToken(refreshToken);
  const result = await db.query(
    `SELECT s.id AS session_id, s.user_id, s.expires_at, s.revoked_at,
            u.id, u.email, u.first_name, u.last_name, u.middle_name, u.phone, u.role_id, u.status, u.email_verified_at
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.refresh_token_hash = $1`,
    [refreshTokenHash]
  );

  const current = result.rows[0];
  if (!current) return { error: 'invalid_refresh_token' };

  if (current.revoked_at || new Date(current.expires_at) <= new Date()) {
    await db.query('UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, NOW()) WHERE user_id = $1', [current.user_id]);
    await logAuthEvent({
      userId: current.user_id,
      event: 'token_reused',
      email: current.email,
      sessionId: current.session_id,
      req
    });
    return { error: 'invalid_refresh_token' };
  }

  const user = {
    id: current.id,
    email: current.email,
    first_name: current.first_name,
    last_name: current.last_name,
    middle_name: current.middle_name,
    phone: current.phone,
    role_id: current.role_id,
    status: current.status,
    email_verified_at: current.email_verified_at
  };

  const next = await createSession({ user, req });
  await db.query(
    `UPDATE auth_sessions
     SET revoked_at = NOW(), replaced_by_session_id = $1, last_used_at = NOW()
     WHERE id = $2`,
    [next.sessionId, current.session_id]
  );
  await logAuthEvent({ userId: user.id, event: 'refresh', email: user.email, sessionId: next.sessionId, req });

  return { user, ...next };
}

async function revokeSession(sessionId) {
  if (!sessionId) return;
  await db.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL', [sessionId]);
}

async function revokeAllUserSessions(userId, exceptSessionId = null) {
  if (exceptSessionId) {
    await db.query(
      'UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND id <> $2 AND revoked_at IS NULL',
      [userId, exceptSessionId]
    );
    return;
  }

  await db.query(
    'UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
    [userId]
  );
}

async function isSessionActive(sessionId) {
  if (!sessionId) return false;
  const result = await db.query(
    `SELECT id FROM auth_sessions
     WHERE id = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
    [sessionId]
  );
  return result.rows.length > 0;
}

module.exports = {
  createAccessToken,
  toSessionPayload,
  createSession,
  rotateRefreshSession,
  revokeSession,
  revokeAllUserSessions,
  isSessionActive,
  setRefreshCookie,
  clearRefreshCookie
};

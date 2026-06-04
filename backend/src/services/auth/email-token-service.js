const crypto = require('crypto');
const db = require('../../config/db');
const {
  TOKEN_PEPPER,
  EMAIL_TOKEN_TTL_MINUTES,
  PASSWORD_RESET_TOKEN_TTL_MINUTES
} = require('../../config/auth');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function generateToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return crypto.createHmac('sha256', TOKEN_PEPPER).update(token).digest('hex');
}

function getTokenTtlMinutes(type) {
  if (type === 'password_reset') return PASSWORD_RESET_TOKEN_TTL_MINUTES;
  return EMAIL_TOKEN_TTL_MINUTES;
}

async function createAuthToken({ userId, email, type, req = null }) {
  const normalizedEmail = normalizeEmail(email);
  const token = generateToken();
  const tokenHash = hashToken(token);
  const ttlMinutes = getTokenTtlMinutes(type);

  await db.query(
    `UPDATE auth_tokens
     SET used_at = NOW()
     WHERE email = $1 AND type = $2 AND used_at IS NULL`,
    [normalizedEmail, type]
  );

  await db.query(
    `INSERT INTO auth_tokens (user_id, email, type, token_hash, expires_at, ip_address)
     VALUES ($1, $2, $3, $4, NOW() + ($5 || ' minutes')::interval, $6)`,
    [userId, normalizedEmail, type, tokenHash, ttlMinutes, req?.ip || null]
  );

  return token;
}

async function consumeAuthToken({ token, type }) {
  const tokenHash = hashToken(token);
  const result = await db.query(
    `UPDATE auth_tokens
     SET used_at = NOW()
     WHERE token_hash = $1
       AND type = $2
       AND used_at IS NULL
       AND expires_at > NOW()
     RETURNING id, user_id, email, type`,
    [tokenHash, type]
  );

  return result.rows[0] || null;
}

module.exports = {
  normalizeEmail,
  generateToken,
  hashToken,
  createAuthToken,
  consumeAuthToken
};

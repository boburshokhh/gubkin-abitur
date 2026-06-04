const db = require('../../config/db');
const { INVITATION_TOKEN_TTL_DAYS } = require('../../config/auth');
const { generateToken, hashToken, normalizeEmail } = require('./email-token-service');

async function createInvitation({ email, roleId, invitedBy, metadata = {} }) {
  const normalizedEmail = normalizeEmail(email);
  const token = generateToken();
  const tokenHash = hashToken(token);

  await db.query(
    `UPDATE invitations
     SET revoked_at = NOW()
     WHERE email = $1 AND accepted_at IS NULL AND revoked_at IS NULL`,
    [normalizedEmail]
  );

  const result = await db.query(
    `INSERT INTO invitations (email, role_id, token_hash, invited_by, expires_at, metadata)
     VALUES ($1, $2, $3, $4, NOW() + ($5 || ' days')::interval, $6)
     RETURNING id, email, role_id, invited_by, expires_at, created_at`,
    [normalizedEmail, roleId, tokenHash, invitedBy, INVITATION_TOKEN_TTL_DAYS, metadata]
  );

  return { invitation: result.rows[0], token };
}

async function validateInvitationToken(token) {
  const tokenHash = hashToken(token);
  const result = await db.query(
    `SELECT i.id, i.email, i.role_id, r.name AS role_name, i.expires_at, i.accepted_at, i.revoked_at, i.metadata
     FROM invitations i
     JOIN roles r ON r.id = i.role_id
     WHERE i.token_hash = $1`,
    [tokenHash]
  );

  const invitation = result.rows[0];
  if (!invitation) return { invitation: null, error: 'Приглашение не найдено' };
  if (invitation.revoked_at) return { invitation: null, error: 'Приглашение было отозвано' };
  if (invitation.accepted_at) return { invitation: null, error: 'Приглашение уже использовано' };
  if (new Date(invitation.expires_at) <= new Date()) return { invitation: null, error: 'Срок действия приглашения истек' };

  return { invitation, error: null };
}

async function acceptInvitation({ token, userId }) {
  const tokenHash = hashToken(token);
  const result = await db.query(
    `UPDATE invitations
     SET accepted_at = NOW(), accepted_by_user_id = $2
     WHERE token_hash = $1
       AND accepted_at IS NULL
       AND revoked_at IS NULL
       AND expires_at > NOW()
     RETURNING id, email, role_id`,
    [tokenHash, userId]
  );

  return result.rows[0] || null;
}

async function revokeInvitation({ invitationId }) {
  const result = await db.query(
    `UPDATE invitations
     SET revoked_at = NOW()
     WHERE id = $1 AND accepted_at IS NULL AND revoked_at IS NULL
     RETURNING id`,
    [invitationId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createInvitation,
  validateInvitationToken,
  acceptInvitation,
  revokeInvitation
};

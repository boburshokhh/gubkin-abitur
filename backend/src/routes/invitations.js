const express = require('express');
const db = require('../config/db');
const { sendEmail } = require('../utils/mailer');
const { invitationEmail } = require('../utils/email-templates');
const { requireAdmin } = require('../middleware/auth');
const { validatePassword, hashPassword } = require('../services/auth/password-service');
const { normalizeEmail } = require('../services/auth/email-token-service');
const {
  createInvitation,
  validateInvitationToken,
  acceptInvitation,
  revokeInvitation
} = require('../services/auth/invitation-service');
const { createSession, setRefreshCookie, toSessionPayload } = require('../services/auth/token-service');
const { logAuthEvent } = require('../services/auth/audit-service');

const router = express.Router();

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    role_id: user.role_id,
    status: user.status,
    email_confirmed_at: user.email_verified_at,
    email_verified_at: user.email_verified_at,
    user_metadata: {
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      phone: user.phone,
      role_id: user.role_id,
      status: user.status
    }
  };
}

router.get('/', requireAdmin, async (req, res) => {
  const result = await db.query(
    `SELECT i.id, i.email, i.role_id, r.name AS role_name, i.expires_at, i.accepted_at, i.revoked_at, i.created_at,
            inviter.email AS invited_by_email
     FROM invitations i
     JOIN roles r ON r.id = i.role_id
     LEFT JOIN users inviter ON inviter.id = i.invited_by
     ORDER BY i.created_at DESC
     LIMIT 100`
  );
  return res.json({ data: result.rows });
});

router.post('/', requireAdmin, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const roleId = Number(req.body.role_id || req.body.roleId);

  if (!email || !roleId) return res.status(400).json({ error: 'Email и роль обязательны' });
  if (roleId === 1) return res.status(400).json({ error: 'Для роли абитуриента используйте обычную регистрацию' });

  const roleResult = await db.query('SELECT id, name FROM roles WHERE id = $1', [roleId]);
  const role = roleResult.rows[0];
  if (!role) return res.status(400).json({ error: 'Роль не найдена' });

  const { invitation, token } = await createInvitation({
    email,
    roleId,
    invitedBy: req.user.id,
    metadata: req.body.metadata || {}
  });

  const emailPayload = invitationEmail({ token, roleName: role.name });
  const sent = await sendEmail(email, emailPayload.subject, emailPayload.text, emailPayload.html);
  if (!sent) return res.status(500).json({ error: 'Не удалось отправить приглашение' });

  await logAuthEvent({
    userId: req.user.id,
    event: 'invite_created',
    email,
    req,
    metadata: { invitation_id: invitation.id, role_id: roleId }
  });

  return res.status(201).json({ data: invitation });
});

router.get('/validate', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Токен приглашения обязателен' });

  const { invitation, error } = await validateInvitationToken(token);
  if (error) return res.status(400).json({ error });

  return res.json({
    data: {
      email: invitation.email,
      role_id: invitation.role_id,
      role_name: invitation.role_name,
      expires_at: invitation.expires_at
    }
  });
});

router.post('/accept', async (req, res) => {
  const { token, password, firstName, lastName, middleName = '', phone = '' } = req.body;
  if (!token || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Токен, пароль, имя и фамилия обязательны' });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) return res.status(400).json({ error: passwordValidation.error });

  const { invitation, error } = await validateInvitationToken(token);
  if (error) return res.status(400).json({ error });

  const passwordHash = await hashPassword(password);
  const existing = await db.query('SELECT id, email, status FROM users WHERE LOWER(email) = $1', [invitation.email]);
  let user;

  if (existing.rows[0]) {
    const updated = await db.query(
      `UPDATE users
       SET password_hash = $2,
           first_name = $3,
           last_name = $4,
           middle_name = $5,
           phone = $6,
           role_id = $7,
           status = 'active',
           email_verified_at = COALESCE(email_verified_at, NOW()),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, middle_name, phone, role_id, status, email_verified_at`,
      [existing.rows[0].id, passwordHash, firstName, lastName, middleName, phone, invitation.role_id]
    );
    user = updated.rows[0];
  } else {
    const inserted = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, middle_name, phone, role_id, status, email_verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW())
       RETURNING id, email, first_name, last_name, middle_name, phone, role_id, status, email_verified_at`,
      [invitation.email, passwordHash, firstName, lastName, middleName, phone, invitation.role_id]
    );
    user = inserted.rows[0];
  }

  const accepted = await acceptInvitation({ token, userId: user.id });
  if (!accepted) return res.status(400).json({ error: 'Приглашение уже использовано или устарело' });

  const session = await createSession({ user, req });
  setRefreshCookie(res, session.refreshToken, new Date(session.refreshExpiresAt));
  await logAuthEvent({
    userId: user.id,
    event: 'invite_accepted',
    email: user.email,
    sessionId: session.sessionId,
    req,
    metadata: { invitation_id: accepted.id, role_id: accepted.role_id }
  });

  const formattedUser = formatUser(user);
  return res.json({
    session: toSessionPayload({ accessToken: session.accessToken, user: formattedUser }),
    user: formattedUser
  });
});

router.post('/:id/revoke', requireAdmin, async (req, res) => {
  const revoked = await revokeInvitation({ invitationId: req.params.id });
  if (!revoked) return res.status(404).json({ error: 'Активное приглашение не найдено' });

  await logAuthEvent({
    userId: req.user.id,
    event: 'invite_revoked',
    req,
    metadata: { invitation_id: req.params.id }
  });

  return res.json({ success: true });
});

module.exports = router;

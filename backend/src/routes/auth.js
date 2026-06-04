const express = require('express');
const db = require('../config/db');
const { sendEmail } = require('../utils/mailer');
const { verificationEmail, passwordResetEmail } = require('../utils/email-templates');
const { requireAuth } = require('../middleware/auth');
const { normalizeEmail, createAuthToken, consumeAuthToken, hashToken } = require('../services/auth/email-token-service');
const { validatePassword, hashPassword, verifyPassword } = require('../services/auth/password-service');
const {
  createSession,
  rotateRefreshSession,
  revokeAllUserSessions,
  toSessionPayload,
  setRefreshCookie,
  clearRefreshCookie
} = require('../services/auth/token-service');
const { logAuthEvent } = require('../services/auth/audit-service');

const router = express.Router();
const GENERIC_RESET_MESSAGE = 'Если email существует, на него отправлена ссылка для сброса пароля';
const GENERIC_VERIFICATION_MESSAGE = 'Если email существует и требует подтверждения, письмо отправлено повторно';

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
      status: user.status,
      role_id: user.role_id
    }
  };
}

async function issueSession({ user, req, res }) {
  const session = await createSession({ user, req });
  setRefreshCookie(res, session.refreshToken, new Date(session.refreshExpiresAt));
  return toSessionPayload({
    accessToken: session.accessToken,
    user: formatUser(user)
  });
}

router.post('/signup', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password, options = {} } = req.body;
  const firstName = String(options?.data?.first_name || req.body.firstName || '').trim();
  const lastName = String(options?.data?.last_name || req.body.lastName || '').trim();

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Email, пароль, имя и фамилия обязательны' });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) return res.status(400).json({ error: passwordValidation.error });

  try {
    const existing = await db.query('SELECT id, email, status FROM users WHERE LOWER(email) = $1', [email]);
    if (existing.rows[0]?.status === 'active') {
      return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }

    let user = existing.rows[0];
    if (!user) {
      const passwordHash = await hashPassword(password);
      const inserted = await db.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role_id, status)
         VALUES ($1, $2, $3, $4, 1, 'pending_verification')
         RETURNING id, email, first_name, last_name, middle_name, phone, role_id, status, email_verified_at`,
        [email, passwordHash, firstName, lastName]
      );
      user = inserted.rows[0];
      await logAuthEvent({ userId: user.id, event: 'signup', email, req });
    } else {
      const refreshed = await db.query(
        `UPDATE users
         SET password_hash = $2, first_name = $3, last_name = $4, updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, first_name, last_name, middle_name, phone, role_id, status, email_verified_at`,
        [user.id, await hashPassword(password), firstName, lastName]
      );
      user = refreshed.rows[0];
    }

    const token = await createAuthToken({ userId: user.id, email, type: 'email_verification', req });
    const emailPayload = verificationEmail({ token });
    const sent = await sendEmail(email, emailPayload.subject, emailPayload.text, emailPayload.html);
    if (!sent) return res.status(500).json({ error: 'Не удалось отправить письмо подтверждения' });

    return res.status(201).json({
      user: formatUser(user),
      message: 'На email отправлена ссылка для подтверждения регистрации'
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера при регистрации' });
  }
});

router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Токен подтверждения обязателен' });

  try {
    const consumed = await consumeAuthToken({ token, type: 'email_verification' });
    if (!consumed) return res.status(400).json({ error: 'Ссылка подтверждения некорректна или устарела' });

    const result = await db.query(
      `UPDATE users
       SET status = 'active', email_verified_at = COALESCE(email_verified_at, NOW()), updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, middle_name, phone, role_id, status, email_verified_at`,
      [consumed.user_id]
    );

    const user = result.rows[0];
    await logAuthEvent({ userId: user.id, event: 'verify_email', email: user.email, req });
    const session = await issueSession({ user, req, res });
    return res.json({ session, user: formatUser(user) });
  } catch (err) {
    console.error('Ошибка подтверждения email:', err);
    return res.status(500).json({ error: 'Ошибка подтверждения email' });
  }
});

router.post('/signin', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });

  try {
    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    const user = result.rows[0];
    if (!user) {
      await logAuthEvent({ event: 'signin_failed', email, req, metadata: { reason: 'unknown_email' } });
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ error: 'Аккаунт временно заблокирован. Попробуйте позже.' });
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      const failedAttempts = Number(user.failed_login_attempts || 0) + 1;
      const shouldLock = failedAttempts >= 5;
      await db.query(
        `UPDATE users
         SET failed_login_attempts = $2,
             locked_until = CASE WHEN $3 THEN NOW() + interval '15 minutes' ELSE locked_until END
         WHERE id = $1`,
        [user.id, failedAttempts, shouldLock]
      );
      await logAuthEvent({ userId: user.id, event: 'signin_failed', email, req, metadata: { reason: 'invalid_password' } });
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    if (user.status === 'pending_verification' || !user.email_verified_at) {
      return res.status(403).json({ error: 'Email не подтвержден', code: 'email_not_verified' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Аккаунт недоступен' });
    }

    await db.query(
      `UPDATE users
       SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    const freshUser = { ...user, failed_login_attempts: 0, locked_until: null };
    const session = await issueSession({ user: freshUser, req, res });
    return res.json({ session, user: formatUser(freshUser) });
  } catch (err) {
    console.error('Ошибка входа:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера при входе' });
  }
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token отсутствует' });

  try {
    const rotated = await rotateRefreshSession({ refreshToken, req });
    if (rotated.error) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Сессия истекла. Пожалуйста, войдите заново.' });
    }

    setRefreshCookie(res, rotated.refreshToken, new Date(rotated.refreshExpiresAt));
    const session = toSessionPayload({
      accessToken: rotated.accessToken,
      user: formatUser(rotated.user)
    });
    return res.json({ session, user: formatUser(rotated.user) });
  } catch (err) {
    console.error('Ошибка обновления сессии:', err);
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Не удалось обновить сессию' });
  }
});

router.post('/signout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await db.query(
        'UPDATE auth_sessions SET revoked_at = NOW() WHERE refresh_token_hash = $1 AND revoked_at IS NULL',
        [hashToken(refreshToken)]
      );
    }

    clearRefreshCookie(res);
    return res.json({ success: true });
  } catch (err) {
    console.error('Ошибка выхода:', err);
    clearRefreshCookie(res);
    return res.json({ success: true });
  }
});

router.post('/signout-all', requireAuth, async (req, res) => {
  await revokeAllUserSessions(req.user.id);
  clearRefreshCookie(res);
  await logAuthEvent({ userId: req.user.id, event: 'logout', email: req.user.email, req });
  return res.json({ success: true });
});

router.get('/session', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, middle_name, phone, role_id, status, email_verified_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Пользователь не найден' });

    const user = formatUser(result.rows[0]);
    return res.json({
      session: {
        access_token: req.headers.authorization.split(' ')[1],
        token_type: 'bearer',
        user
      },
      user
    });
  } catch (err) {
    console.error('Ошибка получения сессии:', err);
    return res.status(500).json({ error: 'Ошибка получения сессии' });
  }
});

router.post('/password/forgot', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  try {
    const result = await db.query(
      `SELECT id, email, status FROM users
       WHERE LOWER(email) = $1 AND status = 'active' AND email_verified_at IS NOT NULL`,
      [email]
    );
    const user = result.rows[0];
    if (user) {
      const token = await createAuthToken({ userId: user.id, email, type: 'password_reset', req });
      const emailPayload = passwordResetEmail({ token });
      await sendEmail(email, emailPayload.subject, emailPayload.text, emailPayload.html);
      await logAuthEvent({ userId: user.id, event: 'reset_requested', email, req });
    }

    return res.json({ success: true, message: GENERIC_RESET_MESSAGE });
  } catch (err) {
    console.error('Ошибка запроса сброса пароля:', err);
    return res.json({ success: true, message: GENERIC_RESET_MESSAGE });
  }
});

router.post('/password/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Токен и новый пароль обязательны' });

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) return res.status(400).json({ error: passwordValidation.error });

  try {
    const consumed = await consumeAuthToken({ token, type: 'password_reset' });
    if (!consumed) return res.status(400).json({ error: 'Ссылка сброса пароля некорректна или устарела' });

    const passwordHash = await hashPassword(password);
    await db.query(
      `UPDATE users
       SET password_hash = $2, password_changed_at = NOW(), updated_at = NOW(), failed_login_attempts = 0, locked_until = NULL
       WHERE id = $1`,
      [consumed.user_id, passwordHash]
    );
    await revokeAllUserSessions(consumed.user_id);
    await logAuthEvent({ userId: consumed.user_id, event: 'reset_completed', email: consumed.email, req });
    clearRefreshCookie(res);
    return res.json({ success: true, message: 'Пароль успешно обновлен' });
  } catch (err) {
    console.error('Ошибка сброса пароля:', err);
    return res.status(500).json({ error: 'Ошибка сброса пароля' });
  }
});

router.post('/password/change', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) return res.status(400).json({ error: passwordValidation.error });

  const result = await db.query('SELECT id, email, password_hash FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  const isCurrentValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isCurrentValid) return res.status(400).json({ error: 'Текущий пароль указан неверно' });

  await db.query(
    'UPDATE users SET password_hash = $2, password_changed_at = NOW(), updated_at = NOW() WHERE id = $1',
    [user.id, await hashPassword(newPassword)]
  );
  await revokeAllUserSessions(user.id, req.user.session_id);
  await logAuthEvent({ userId: user.id, event: 'password_changed', email: user.email, sessionId: req.user.session_id, req });
  return res.json({ success: true });
});

router.post('/resend-verification', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) return res.status(400).json({ error: 'Email обязателен' });

  try {
    const result = await db.query(
      `SELECT id, email, status FROM users
       WHERE LOWER(email) = $1 AND status = 'pending_verification'`,
      [email]
    );
    const user = result.rows[0];
    if (user) {
      const token = await createAuthToken({ userId: user.id, email, type: 'email_verification', req });
      const emailPayload = verificationEmail({ token });
      await sendEmail(email, emailPayload.subject, emailPayload.text, emailPayload.html);
    }

    return res.json({ success: true, message: GENERIC_VERIFICATION_MESSAGE });
  } catch (err) {
    console.error('Ошибка повторной отправки подтверждения:', err);
    return res.json({ success: true, message: GENERIC_VERIFICATION_MESSAGE });
  }
});

router.post('/send-otp', async (req, res) => {
  req.url = '/resend-verification';
  return router.handle(req, res);
});

router.post('/reset-password', async (req, res) => {
  req.url = '/password/forgot';
  return router.handle(req, res);
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('../config/db');
const s3 = require('../config/s3');
const { GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { JWT_SECRET, requireAuth, requireAdmin, requireAdminOrReviewer } = require('../middleware/auth');
const { createNotification, createStaffNotifications } = require('../services/notification-service');
const { sendApplicationStatusChangeEmail } = require('../services/application-status-email');
const { emitApplicationUpdated } = require('../socket/feedback');
const { decodeUploadedFileName, getFileExtension, decodeApplicationFileNames, decodeFileRecord } = require('../utils/file-name');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return value ?? null;

  const trimmedValue = value.trim();
  return trimmedValue || null;
}

function normalizeApplicationData(appData = {}) {
  return {
    ...appData,
    first_name: appData.first_name ?? appData.firstName,
    last_name: appData.last_name ?? appData.lastName,
    middle_name: appData.middle_name ?? appData.middleName,
    birth_date: normalizeOptionalString(appData.birth_date ?? appData.birthDate),
    parent_phone: appData.parent_phone ?? appData.parentPhone,
    address: normalizeOptionalString(appData.address),
    gender: normalizeOptionalString(appData.gender)
  };
}

function validateRequiredApplicantData(appData) {
  if (!appData.birth_date) return 'Дата рождения обязательна для заполнения';
  if (!appData.gender) return 'Пол обязателен для заполнения';
  if (!appData.address) return 'Адрес проживания обязателен для заполнения';

  return null;
}

async function isAdmissionOpen() {
  const envFallback = process.env.ADMISSION_OPEN === 'true';

  try {
    const result = await db.query(
      `SELECT value FROM site_settings WHERE category = 'general' AND key = 'admission_open' LIMIT 1`
    );

    if (!result.rows.length) return envFallback;

    return result.rows[0].value === 'true';
  } catch (err) {
    console.error('Ошибка проверки статуса приема документов:', err);
    return envFallback;
  }
}

async function isRegistrationOpen() {
  const envFallback = process.env.REGISTRATION_OPEN
    ? process.env.REGISTRATION_OPEN === 'true'
    : process.env.ADMISSION_OPEN === 'true';

  try {
    const result = await db.query(
      `SELECT value FROM site_settings WHERE category = 'general' AND key = 'registration_open' LIMIT 1`
    );

    if (!result.rows.length) return envFallback;

    return result.rows[0].value === 'true';
  } catch (err) {
    console.error('Ошибка проверки статуса регистрации:', err);
    return envFallback;
  }
}

async function ensureAdmissionOpenForApplicant(req, res) {
  const isStaff = req.user?.role_id === 2 || req.user?.role_id === 3;
  if (isStaff) return true;

  if (await isAdmissionOpen()) return true;

  res.status(403).json({
    error: 'Прием документов сейчас закрыт. Подача и отправка заявлений временно недоступны.'
  });
  return false;
}

function isStaffUser(user) {
  return user?.role_id === 2 || user?.role_id === 3;
}

async function canAccessApplication(user, applicationId) {
  if (isStaffUser(user)) return true;

  const access = await db.query('SELECT user_id FROM applications WHERE id = $1', [applicationId]);
  return access.rows.length > 0 && access.rows[0].user_id === user.id;
}

async function ensureApplicationAccess(req, res, applicationId) {
  if (await canAccessApplication(req.user, applicationId)) return true;

  res.status(403).json({ error: 'Доступ запрещен' });
  return false;
}

function getSafeDownloadFileName(fileName, fallback = 'file') {
  return String(fileName || fallback).replace(/[\r\n"]/g, '_');
}

function getS3KeyCandidates(filePath, bucketAlias) {
  const normalizedPath = String(filePath || '').replace(/^\/+/, '');
  if (!normalizedPath) return [];

  const candidates = new Set([normalizedPath]);

  if (bucketAlias) {
    const prefix = `${bucketAlias}/`;

    if (normalizedPath.startsWith(prefix)) {
      candidates.add(normalizedPath.slice(prefix.length));
    } else {
      candidates.add(`${prefix}${normalizedPath}`);
    }
  }

  return [...candidates];
}

async function resolveS3ObjectKey({ bucket, filePath, bucketAlias }) {
  const keyCandidates = getS3KeyCandidates(filePath, bucketAlias);
  let lastError = null;

  for (const key of keyCandidates) {
    try {
      await s3.s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return key;
    } catch (error) {
      lastError = error;
      const statusCode = error.$metadata?.httpStatusCode;
      if (error.name !== 'NotFound' && statusCode !== 404) throw error;
    }
  }

  throw lastError || new Error('Файл не найден');
}

async function streamS3File(res, { bucket, keyCandidates, fileName, contentType }) {
  let lastError = null;

  for (const key of keyCandidates) {
    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const s3Response = await s3.s3Client.send(command);
      const safeFileName = getSafeDownloadFileName(fileName);

      res.setHeader('Content-Type', s3Response.ContentType || contentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`);
      if (s3Response.ContentLength) res.setHeader('Content-Length', s3Response.ContentLength);

      s3Response.Body.pipe(res);
      return true;
    } catch (error) {
      lastError = error;
    }
  }

  const error = lastError || new Error('Файл не найден');
  error.triedKeys = keyCandidates;
  throw error;
}

async function getApplicationHistory(applicationId) {
  const result = await db.query(
    `WITH ordered_history AS (
       SELECT
         h.id,
         h.application_id,
         h.status_id,
         h.comment,
         h.created_by,
         h.created_at,
         s.name AS status_name,
         s.color AS status_color,
         LAG(s.id) OVER history_order AS old_status_id,
         LAG(s.name) OVER history_order AS old_status_name,
         LAG(s.color) OVER history_order AS old_status_color
       FROM application_history h
       JOIN application_statuses s ON s.id = h.status_id
       WHERE h.application_id = $1
       WINDOW history_order AS (ORDER BY h.created_at ASC, h.id ASC)
     )
     SELECT
       oh.id,
       oh.application_id,
       oh.status_id,
       oh.comment,
       oh.created_by,
       oh.created_at,
       oh.status_name,
       oh.status_color,
       jsonb_build_object(
         'id', oh.status_id,
         'name', oh.status_name,
         'color', oh.status_color
       ) AS status,
       CASE
         WHEN oh.old_status_id IS NULL THEN NULL
         ELSE jsonb_build_object(
           'id', oh.old_status_id,
           'name', oh.old_status_name,
           'color', oh.old_status_color
         )
       END AS old_status,
       jsonb_build_object(
         'id', oh.status_id,
         'name', oh.status_name,
         'color', oh.status_color
       ) AS new_status,
       CASE
         WHEN u.id IS NULL THEN NULL
         ELSE jsonb_build_object(
           'id', u.id,
           'first_name', u.first_name,
           'last_name', u.last_name,
           'middle_name', u.middle_name,
           'email', u.email
         )
       END AS created_by_user
     FROM ordered_history oh
     LEFT JOIN users u ON u.id = oh.created_by
     ORDER BY oh.created_at DESC, oh.id DESC`,
    [applicationId]
  );

  return result.rows;
}

async function getApplicationStaffComments(applicationId) {
  const result = await db.query(
    `SELECT
       c.id,
       c.application_id,
       c.comment,
       c.created_by,
       c.created_at,
       c.updated_at,
       CASE
         WHEN u.id IS NULL THEN NULL
         ELSE jsonb_build_object(
           'id', u.id,
           'first_name', u.first_name,
           'last_name', u.last_name,
           'middle_name', u.middle_name,
           'email', u.email
         )
       END AS created_by_user
     FROM application_staff_comments c
     LEFT JOIN users u ON u.id = c.created_by
     WHERE c.application_id = $1
     ORDER BY c.created_at DESC, c.id DESC`,
    [applicationId]
  );

  return result.rows;
}

async function getApplicationTimeline(applicationId) {
  const statusHistory = await getApplicationHistory(applicationId);
  const staffComments = await getApplicationStaffComments(applicationId);
  const documentEvents = await db.query(
    `SELECT
       id,
       application_id,
       'document_uploaded' AS event_type,
       file_name AS title,
       file_category AS subtitle,
       created_at
     FROM application_files
     WHERE application_id = $1
     UNION ALL
     SELECT
       id,
       application_id,
       'education_document_uploaded' AS event_type,
       file_name AS title,
       status AS subtitle,
       created_at
     FROM documents
     WHERE application_id = $1`,
    [applicationId]
  );

  return [
    ...statusHistory.map(item => ({ ...item, event_type: 'status_changed' })),
    ...staffComments.map(item => ({ ...item, event_type: 'staff_comment' })),
    ...documentEvents.rows.map(row => ({
      ...row,
      title: decodeUploadedFileName(row.title)
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ==========================================
// 1. АУТЕНТИФИКАЦИЯ (Auth)
// ==========================================

// Регистрация
router.post('/auth/signup', async (req, res) => {
  const { email, password, options } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    if (!(await isRegistrationOpen())) {
      return res.status(403).json({ error: 'Регистрация новых пользователей сейчас закрыта' });
    }

    // Проверяем, существует ли пользователь
    const checkUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const firstName = options?.data?.first_name || '';
    const lastName = options?.data?.last_name || '';

    // Вставляем пользователя
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role_id) 
       VALUES ($1, $2, $3, $4, 1) 
       RETURNING id, email, first_name, last_name, role_id, created_at`,
      [email, passwordHash, firstName, lastName]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role_id: user.role_id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      session: { access_token: token, expires_in: 604800 },
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { first_name: user.first_name, last_name: user.last_name },
        email_confirmed_at: new Date().toISOString() // Имитируем подтвержденный email
      }
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера при регистрации' });
  }
});

// Вход
router.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role_id: user.role_id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      session: { access_token: token, expires_in: 604800 },
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { first_name: user.first_name, last_name: user.last_name, middle_name: user.middle_name, phone: user.phone },
        email_confirmed_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера при входе' });
  }
});

// Выход
router.post('/auth/signout', (req, res) => {
  res.json({ success: true });
});

// Получить сессию по токену
router.get('/auth/session', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, first_name, last_name, middle_name, phone, role_id FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    res.json({
      session: { access_token: req.headers.authorization.split(' ')[1] },
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { first_name: user.first_name, last_name: user.last_name, middle_name: user.middle_name, phone: user.phone },
        email_confirmed_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Ошибка получения сессии:', err);
    res.status(500).json({ error: 'Ошибка получения сессии' });
  }
});

const { sendEmail } = require('../utils/mailer');
const { UNIVERSITY_NAME, ADMISSION_CAMPAIGN_NAME } = require('../config/organization');

// Хранилище OTP в памяти (для простоты)
// В production лучше использовать Redis или таблицу в БД
const otpStorage = new Map();

// Реальная отправка OTP
router.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email обязателен' });
  }

  // Генерируем 6-значный код
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Сохраняем код на 10 минут
  otpStorage.set(email, {
    code: otpCode,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  const subject = `Код подтверждения - ${ADMISSION_CAMPAIGN_NAME}`;
  const text = `Ваш код подтверждения: ${otpCode}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h2 style="color: #003366; text-align: center; font-size: 18px; line-height: 1.4;">${UNIVERSITY_NAME}</h2>
      <p style="font-size: 16px; color: #333;">Здравствуйте!</p>
      <p style="font-size: 16px; color: #333;">Ваш код подтверждения для доступа к порталу абитуриента:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; background-color: #f4f4f4; color: #003366; border-radius: 5px; letter-spacing: 5px;">${otpCode}</span>
      </div>
      <p style="font-size: 14px; color: #666;">Код действителен в течение 10 минут.</p>
      <p style="font-size: 14px; color: #666;">Если вы не запрашивали этот код, просто проигнорируйте данное письмо.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
    </div>
  `;

  const sent = await sendEmail(email, subject, text, html);

  if (sent) {
    res.json({ success: true, message: 'OTP отправлен на почту' });
  } else {
    res.status(500).json({ error: 'Ошибка при отправке email. Пожалуйста, попробуйте позже.' });
  }
});

router.post('/auth/verify-otp', async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ error: 'Email и код обязательны' });
  }

  const storedOtp = otpStorage.get(email);
  if (!storedOtp) {
    return res.status(400).json({ error: 'Код не запрашивался или срок его действия истек' });
  }

  if (Date.now() > storedOtp.expiresAt) {
    otpStorage.delete(email);
    return res.status(400).json({ error: 'Срок действия кода истек' });
  }

  if (storedOtp.code !== token) {
    return res.status(400).json({ error: 'Неверный код подтверждения' });
  }

  // Код верный, очищаем его и обновляем статус пользователя в БД
  otpStorage.delete(email);
  
  try {
    await db.query('UPDATE users SET updated_at = NOW() WHERE email = $1', [email]);
    res.json({ success: true, message: 'OTP успешно подтвержден' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при подтверждении' });
  }
});

router.post('/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email обязателен' });
  }
  
  // Генерируем новый пароль
  const newPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  try {
    const result = await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id', [passwordHash, email]);
    
    if (result.rows.length === 0) {
      // Для безопасности не сообщаем, что email не найден, просто возвращаем success
      return res.json({ success: true, message: 'Если email существует, на него отправлен новый пароль' });
    }
    
    const subject = `Сброс пароля - ${ADMISSION_CAMPAIGN_NAME}`;
    const text = `Ваш новый пароль: ${newPassword}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #003366; text-align: center; font-size: 18px; line-height: 1.4;">${UNIVERSITY_NAME}</h2>
        <p style="font-size: 16px; color: #333;">Здравствуйте!</p>
        <p style="font-size: 16px; color: #333;">Ваш пароль был успешно сброшен.</p>
        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Ваш новый пароль:</p>
          <span style="display: inline-block; padding: 15px 25px; font-size: 20px; font-weight: bold; background-color: #f4f4f4; color: #003366; border-radius: 5px;">${newPassword}</span>
        </div>
        <p style="font-size: 14px; color: #666;">Рекомендуем изменить его после входа в личный кабинет.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
      </div>
    `;

    await sendEmail(email, subject, text, html);
    res.json({ success: true, message: 'Новый пароль отправлен на почту' });
  } catch (err) {
    console.error('Ошибка сброса пароля:', err);
    res.status(500).json({ error: 'Ошибка сброса пароля' });
  }
});


// ==========================================
// 2. ПОЛЬЗОВАТЕЛИ (Users)
// ==========================================

// Получить свой профиль
router.get('/users/profile', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, first_name, last_name, middle_name, phone, birth_date, gender, role_id, region_id FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Ошибка получения профиля:', err);
    res.status(500).json({ error: 'Ошибка получения профиля' });
  }
});

// Обновить свой профиль
router.put('/users/profile', requireAuth, async (req, res) => {
  const { first_name, last_name, middle_name, phone, birth_date, gender, region_id } = req.body;
  try {
    // Сначала проверяем существование
    const check = await db.query('SELECT id FROM users WHERE id = $1', [req.user.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const result = await db.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name), 
           last_name = COALESCE($2, last_name), 
           middle_name = COALESCE($3, middle_name), 
           phone = COALESCE($4, phone), 
           birth_date = COALESCE($5, birth_date), 
           gender = COALESCE($6, gender),
           region_id = COALESCE($7, region_id),
           updated_at = NOW()
       WHERE id = $8 
       RETURNING id, email, first_name, last_name, middle_name, phone, birth_date, gender, role_id, region_id`,
      [first_name, last_name, middle_name, phone, birth_date || null, gender, region_id || null, req.user.id]
    );

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Ошибка обновления профиля:', err);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

// Получить роль пользователя
router.get('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT role_id FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ data: result.rows[0].role_id });
  } catch (err) {
    console.error('Ошибка получения роли:', err);
    res.status(500).json({ error: 'Ошибка получения роли' });
  }
});

// Обновить роль пользователя (Админ)
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  const { role_id } = req.body;
  try {
    const result = await db.query('UPDATE users SET role_id = $1, updated_at = NOW() WHERE id = $2 RETURNING id, role_id', [role_id, req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('Ошибка обновления роли:', err);
    res.status(500).json({ error: 'Ошибка обновления роли' });
  }
});

// Получить список пользователей (Админ)
router.get('/users', requireAdmin, async (req, res) => {
  const roleId = req.query.roleId ? parseInt(req.query.roleId) : null;
  const search = req.query.search || '';
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 20;
  const offset = (page - 1) * pageSize;

  try {
    let queryText = 'SELECT id, email, first_name, last_name, middle_name, phone, role_id, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (roleId) {
      params.push(roleId);
      queryText += ` AND role_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    // Получаем общее количество
    const countResult = await db.query(`SELECT COUNT(*) FROM (${queryText}) t`, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Добавляем пагинацию и сортировку
    params.push(pageSize, offset);
    queryText += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const dataResult = await db.query(queryText, params);

    res.json({
      data: {
        users: dataResult.rows,
        total_count: totalCount
      }
    });
  } catch (err) {
    console.error('Ошибка получения пользователей:', err);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});


// ==========================================
// 3. СПРАВОЧНИКИ ОБРАЗОВАНИЯ (Education)
// ==========================================

function normalizeBoolean(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (value === 'false') return false;
  if (value === 'true') return true;
  return fallback;
}

function normalizeInteger(value, fallback = null) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

// Уровни образования
router.get('/education/levels', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM education_levels ORDER BY id');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Предметы вступительных экзаменов
router.get('/education/subjects', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name FROM subjects ORDER BY name');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Направления подготовки
router.get('/education/directions', async (req, res) => {
  const { levelId } = req.query;
  try {
    let result;
    if (levelId) {
      result = await db.query('SELECT * FROM directions WHERE level_id = $1 ORDER BY sort_order NULLS LAST, code, name', [levelId]);
    } else {
      result = await db.query(
        `SELECT d.*, el.name as level_name 
         FROM directions d 
         JOIN education_levels el ON el.id = d.level_id 
         ORDER BY d.sort_order NULLS LAST, d.code, d.name`
      );
    }
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать направление (Админ)
router.post('/education/directions', requireAdmin, async (req, res) => {
  const { level_id, code, name } = req.body;
  const sortOrder = normalizeInteger(req.body.sort_order);
  const isPublished = normalizeBoolean(req.body.is_published);
  try {
    const result = await db.query(
      `INSERT INTO directions (level_id, code, name, sort_order, is_published)
       VALUES ($1, $2, $3, COALESCE($4, (SELECT COALESCE(MAX(sort_order), 0) + 10 FROM directions)), $5)
       RETURNING *`,
      [level_id, code, name, sortOrder, isPublished]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить направление (Админ)
router.put('/education/directions/:id', requireAdmin, async (req, res) => {
  const { level_id, code, name } = req.body;
  const sortOrder = normalizeInteger(req.body.sort_order);
  const isPublished = normalizeBoolean(req.body.is_published);
  try {
    const result = await db.query(
      `UPDATE directions
       SET level_id = $1,
           code = $2,
           name = $3,
           sort_order = $4,
           is_published = $5
       WHERE id = $6
       RETURNING *`,
      [level_id, code, name, sortOrder, isPublished, req.params.id]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить направление (Админ)
router.delete('/education/directions/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM directions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Все профили с деталями
router.get('/education/profiles/details', async (req, res) => {
  try {
    const queryText = `
      SELECT p.*, 
             jsonb_build_object(
               'name', d.name,
               'code', d.code,
               'sort_order', d.sort_order,
               'is_published', d.is_published,
               'level', jsonb_build_object('id', el.id, 'name', el.name)
             ) as direction,
             COALESCE(
               (
                 SELECT jsonb_agg(
                   jsonb_build_object(
                     'subject_id', pe.subject_id,
                     'priority', pe.priority,
                     'subject', jsonb_build_object('id', s.id, 'name', s.name)
                   ) ORDER BY pe.priority
                 )
                 FROM profile_exams pe
                 JOIN subjects s ON s.id = pe.subject_id
                 WHERE pe.profile_id = p.id
               ), '[]'::jsonb
             ) as profile_exams
      FROM profiles p
      JOIN directions d ON d.id = p.direction_id
      JOIN education_levels el ON el.id = d.level_id
      ORDER BY d.sort_order NULLS LAST, d.code, p.sort_order NULLS LAST, p.name`;
    const result = await db.query(queryText);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function saveProfileExams(client, profileId, exams = []) {
  await client.query('DELETE FROM profile_exams WHERE profile_id = $1', [profileId]);

  const validExams = exams.filter(exam => exam.subject_id);
  for (const [index, exam] of validExams.entries()) {
    await client.query(
      `INSERT INTO profile_exams (profile_id, subject_id, priority)
       VALUES ($1, $2, $3)
       ON CONFLICT (profile_id, subject_id)
       DO UPDATE SET priority = EXCLUDED.priority`,
      [profileId, exam.subject_id, exam.priority || index + 1]
    );
  }
}

// Создать профиль (Админ)
router.post('/education/profiles', requireAdmin, async (req, res) => {
  const { exams = [], ...profileData } = req.body;
  const client = await db.pool.connect();
  const places = normalizeInteger(profileData.places, 30);
  const sortOrder = normalizeInteger(profileData.sort_order);
  const isPublished = normalizeBoolean(profileData.is_published);

  try {
    await client.query('BEGIN');

    const result = profileData.id
      ? await client.query(
        `UPDATE profiles
         SET direction_id = $1,
             name = $2,
             description = $3,
             places = $4,
             sort_order = $5,
             is_published = $6,
             duration_years = $7,
             tuition_fee = $8,
             career_info = $9,
             internship_info = $10
         WHERE id = $11
         RETURNING *`,
        [
          profileData.direction_id,
          profileData.name,
          profileData.description || null,
          places,
          sortOrder,
          isPublished,
          profileData.duration_years || null,
          profileData.tuition_fee || null,
          profileData.career_info || null,
          profileData.internship_info || null,
          profileData.id
        ]
      )
      : await client.query(
        `INSERT INTO profiles (
           direction_id,
           name,
           description,
           places,
           sort_order,
           is_published,
           duration_years,
           tuition_fee,
           career_info,
           internship_info
         )
         VALUES ($1, $2, $3, $4, COALESCE($5, (SELECT COALESCE(MAX(sort_order), 0) + 10 FROM profiles WHERE direction_id = $1)), $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          profileData.direction_id,
          profileData.name,
          profileData.description || null,
          places,
          sortOrder,
          isPublished,
          profileData.duration_years || null,
          profileData.tuition_fee || null,
          profileData.career_info || null,
          profileData.internship_info || null
        ]
      );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    await saveProfileExams(client, result.rows[0].id, exams);

    await client.query('COMMIT');
    res.json({ data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Обновить профиль (Админ)
router.put('/education/profiles/:id', requireAdmin, async (req, res) => {
  const { exams = [], ...profileData } = req.body;
  const client = await db.pool.connect();
  const places = normalizeInteger(profileData.places, 30);
  const sortOrder = normalizeInteger(profileData.sort_order);
  const isPublished = normalizeBoolean(profileData.is_published);

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE profiles
       SET direction_id = $1,
           name = $2,
           description = $3,
           places = $4,
           sort_order = $5,
           is_published = $6,
           duration_years = $7,
           tuition_fee = $8,
           career_info = $9,
           internship_info = $10
       WHERE id = $11
       RETURNING *`,
      [
        profileData.direction_id,
        profileData.name,
        profileData.description || null,
        places,
        sortOrder,
        isPublished,
        profileData.duration_years || null,
        profileData.tuition_fee || null,
        profileData.career_info || null,
        profileData.internship_info || null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    await saveProfileExams(client, req.params.id, exams);

    await client.query('COMMIT');
    res.json({ data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Удалить профиль (Админ)
router.delete('/education/profiles/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM profiles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить профили с тем же набором вступительных экзаменов
router.get('/education/profiles/:id/same-exams', async (req, res) => {
  const profileId = parseInt(req.params.id);

  if (!profileId) {
    return res.status(400).json({ error: 'Некорректный ID профиля' });
  }

  try {
    const result = await db.query(
      `WITH selected_subjects AS (
         SELECT ARRAY_AGG(subject_id ORDER BY subject_id) AS subjects
         FROM profile_exams
         WHERE profile_id = $1
       ),
       profile_subjects AS (
         SELECT p.id AS profile_id,
                ARRAY_AGG(pe.subject_id ORDER BY pe.subject_id) AS subjects
         FROM profiles p
         JOIN profile_exams pe ON pe.profile_id = p.id
         GROUP BY p.id
       )
       SELECT ps.profile_id
       FROM profile_subjects ps
       CROSS JOIN selected_subjects ss
       WHERE ps.subjects = ss.subjects
       ORDER BY ps.profile_id`,
      [profileId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error('Ошибка получения совместимых профилей по экзаменам:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить экзамены профиля
router.get('/education/profiles/:id/exams', async (req, res) => {
  const profileId = parseInt(req.params.id);

  if (!profileId) {
    return res.status(400).json({ error: 'Некорректный ID профиля' });
  }

  try {
    const result = await db.query(
      `SELECT pe.subject_id,
              pe.priority,
              s.name AS subject_name
       FROM profile_exams pe
       JOIN subjects s ON s.id = pe.subject_id
       WHERE pe.profile_id = $1
       ORDER BY pe.priority`,
      [profileId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error('Ошибка получения экзаменов профиля:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить профиль по ID
router.get('/education/profiles/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT get_profile_by_id($1) as profile', [req.params.id]);
    res.json({ data: result.rows[0]?.profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить профили по направлению
router.get('/education/profiles', async (req, res) => {
  const { directionId } = req.query;
  try {
    let result;
    if (directionId) {
      result = await db.query('SELECT * FROM profiles WHERE direction_id = $1 ORDER BY sort_order NULLS LAST, name', [directionId]);
      return res.json({ data: result.rows });
    } else {
      // Использовать функцию get_profiles
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const search = req.query.search || null;
      const levelId = req.query.levelId ? parseInt(req.query.levelId) : null;
      
      const rpcResult = await db.query('SELECT * FROM get_profiles($1, $2, $3, $4, $5)', [levelId, null, search, limit, offset]);
      return res.json({ 
        data: rpcResult.rows[0]?.profiles || [], 
        count: rpcResult.rows[0]?.total_count || 0 
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 4. ЗАЯВЛЕНИЯ (Applications)
// ==========================================

// Получить регионы
router.get('/regions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM regions ORDER BY name');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Справочник статусов
router.get('/applications/statuses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM application_statuses ORDER BY id');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить заявления (модератор видит все, абитуриент - только свои)
router.get('/applications', requireAuth, async (req, res) => {
  const isMod = req.user.role_id === 2 || req.user.role_id === 3;
  
  if (!isMod) {
    // Получаем заявления текущего пользователя
    try {
      // Для абитуриента получаем список его заявлений
      const result = await db.query(
        `SELECT a.id 
         FROM applications a 
         WHERE a.user_id = $1 
         ORDER BY a.created_at DESC`,
        [req.user.id]
      );
      
      const applicationsList = [];
      for (const row of result.rows) {
        const details = await db.query('SELECT get_application_details($1) as details', [row.id]);
        if (details.rows[0]?.details) {
          applicationsList.push(details.rows[0].details);
        }
      }
      
      return res.json({ data: applicationsList, count: applicationsList.length });
    } catch (err) {
      console.error('Ошибка получения заявлений абитуриента:', err);
      return res.status(500).json({ error: 'Ошибка получения заявлений' });
    }
  }

  // Для администраторов и ревьюеров - фильтрованный список
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
  const filters = req.query.filters ? JSON.parse(req.query.filters) : {};

  try {
    const result = await db.query(
      'SELECT * FROM get_filtered_applications($1, $2, $3, $4, $5, $6, $7)',
      [
        filters.statusId || null,
        filters.levelId || null,
        filters.directionId || null,
        filters.profileId || null,
        filters.searchQuery || null,
        page,
        pageSize
      ]
    );

    const count = result.rows.length > 0 ? Number(result.rows[0].total_count) : 0;
    const applicationIds = result.rows.map(row => row.id);

    if (applicationIds.length === 0) {
      return res.json({ data: [], count });
    }

    const documentsSummaryResult = await db.query(
      `WITH application_ids AS (
         SELECT unnest($1::uuid[]) AS id
       ),
       file_summary AS (
         SELECT
           application_id,
           ARRAY_AGG(DISTINCT file_category) FILTER (WHERE file_category IS NOT NULL) AS file_categories,
           COUNT(*)::INTEGER AS application_files_count
         FROM application_files
         WHERE application_id = ANY($1::uuid[])
         GROUP BY application_id
       ),
       document_summary AS (
         SELECT application_id, COUNT(*)::INTEGER AS documents_count
         FROM documents
         WHERE application_id = ANY($1::uuid[])
         GROUP BY application_id
       )
       SELECT
         application_ids.id AS application_id,
         COALESCE(file_summary.file_categories, ARRAY[]::TEXT[]) AS file_categories,
         COALESCE(file_summary.application_files_count, 0) AS application_files_count,
         COALESCE(document_summary.documents_count, 0) AS documents_count
       FROM application_ids
       LEFT JOIN file_summary ON file_summary.application_id = application_ids.id
       LEFT JOIN document_summary ON document_summary.application_id = application_ids.id`,
      [applicationIds]
    );

    const requiredDocuments = [
      { key: 'passport_scan', label: 'паспорт', aliases: ['passport_scan', 'passportScan'] },
      { key: 'passport_translation', label: 'перевод паспорта', aliases: ['passport_translation', 'passportTranslation'] },
      { key: 'photo', label: 'фото', aliases: ['photo', 'photoFile'] },
      { key: 'education_scan', label: 'образование', aliases: ['education_scan', 'educationScan'] },
    ];
    const documentsSummaryByApplicationId = new Map(
      documentsSummaryResult.rows.map(summary => {
        const categories = summary.file_categories || [];
        const uploadedRequired = requiredDocuments.filter(item => (
          item.aliases.some(alias => categories.includes(alias))
        ));
        const missingRequired = requiredDocuments.filter(item => (
          !item.aliases.some(alias => categories.includes(alias))
        ));

        return [
          summary.application_id,
          {
            required_total: requiredDocuments.length,
            required_uploaded: uploadedRequired.length,
            missing_required: missingRequired.map(item => item.label),
            application_files_count: summary.application_files_count,
            documents_count: summary.documents_count,
            total_files_count: summary.application_files_count + summary.documents_count
          }
        ];
      })
    );

    const enrichedRows = result.rows.map(row => ({
      ...row,
      document_summary: documentsSummaryByApplicationId.get(row.id) || {
        required_total: requiredDocuments.length,
        required_uploaded: 0,
        missing_required: requiredDocuments.map(item => item.label),
        application_files_count: 0,
        documents_count: 0,
        total_files_count: 0
      }
    }));

    res.json({ data: enrichedRows, count });
  } catch (err) {
    console.error('Ошибка вызова get_filtered_applications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить одно заявление по ID
router.get('/applications/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT get_application_details($1) as details', [req.params.id]);
    const rawDetails = result.rows[0]?.details;
    if (!rawDetails) {
      return res.status(404).json({ error: 'Заявление не найдено' });
    }

    const details = decodeApplicationFileNames(rawDetails);

    // Безопасность: обычный абитуриент может смотреть только свои заявления
    if (!isStaffUser(req.user) && details.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    details.application_history = await getApplicationHistory(req.params.id);

    if (isStaffUser(req.user)) {
      details.staff_comments = await getApplicationStaffComments(req.params.id);
      details.activity_timeline = await getApplicationTimeline(req.params.id);
    }

    res.json({ data: details });
  } catch (err) {
    console.error('Ошибка получения деталей заявления:', err);
    res.status(500).json({ error: err.message });
  }
});

// Создать заявление
router.post('/applications', requireAuth, async (req, res) => {
  if (!(await ensureAdmissionOpenForApplicant(req, res))) return;

  const { app_data } = req.body;
  if (!app_data) {
    return res.status(400).json({ error: 'Не переданы данные заявления' });
  }

  const appData = normalizeApplicationData(app_data);
  const validationError = validateRequiredApplicantData(appData);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Повторная подача разрешена, если прошлые заявления за год были отклонены.
    const currentYear = new Date().getFullYear();
    const checkApp = await client.query(
      `SELECT id, status_id
       FROM applications
       WHERE user_id = $1
         AND academic_year = $2
         AND status_id <> 4
       LIMIT 1`,
      [req.user.id, currentYear]
    );

    if (checkApp.rows.length > 0) {
      const activeApplicationError = new Error('У вас уже есть активная заявка. Вы не можете подать новую заявку, пока текущая заявка находится на рассмотрении.');
      activeApplicationError.code = 'ACTIVE_APPLICATION_EXISTS';
      activeApplicationError.status = 409;
      activeApplicationError.applicationId = checkApp.rows[0].id;
      throw activeApplicationError;
    }

    // Сохраняем персональные данные анкеты в профиле пользователя,
    // чтобы админ-панель получала актуальные ФИО, телефон и дату рождения.
    await client.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           middle_name = COALESCE($3, middle_name),
           phone = COALESCE($4, phone),
           birth_date = COALESCE($5, birth_date),
           gender = COALESCE($6, gender),
           region_id = COALESCE($7, region_id),
           updated_at = NOW()
       WHERE id = $8`,
      [
        appData.first_name,
        appData.last_name,
        appData.middle_name,
        appData.phone,
        appData.birth_date,
        appData.gender,
        appData.region_id,
        req.user.id
      ]
    );

    // Создаем заявление
    const insertAppResult = await client.query(
      `INSERT INTO applications (
        user_id, status_id, passport_series, passport_issue_date, passport_issued_by,
        education_level, education_institution, education_graduation_year,
        document_number, document_date, study_form, funding_form,
        accommodation_needed, olympiad_participant, parent_phone, academic_year,
        education_document_number, education_document_date, region_id, address
      ) VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id`,
      [
        req.user.id,
        appData.passport_series,
        appData.passport_issue_date,
        appData.passport_issued_by,
        appData.education_level,
        appData.education_institution,
        appData.education_graduation_year,
        appData.document_number,
        appData.document_date,
        appData.study_form || 'full-time',
        appData.funding_form,
        appData.accommodation_needed || false,
        appData.olympiad_participant || false,
        appData.parent_phone,
        currentYear,
        appData.education_document_number,
        appData.education_document_date,
        appData.region_id,
        appData.address
      ]
    );

    const applicationId = insertAppResult.rows[0].id;

    // Вставляем выбранные профили (choices)
    if (appData.choices && Array.isArray(appData.choices)) {
      for (const choice of appData.choices) {
        await client.query(
          'INSERT INTO application_choices (application_id, profile_id, priority) VALUES ($1, $2, $3)',
          [applicationId, choice.profile_id, choice.priority]
        );
      }
    }

    // Добавляем запись в историю
    await client.query(
      "INSERT INTO application_history (application_id, status_id, comment, created_by) VALUES ($1, 1, 'Черновик создан', $2)",
      [applicationId, req.user.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ data: { application_id: applicationId, success: true } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Ошибка транзакции создания заявления:', err);
    if (err.code === 'ACTIVE_APPLICATION_EXISTS') {
      return res.status(err.status).json({
        error: err.message,
        code: err.code,
        application_id: err.applicationId
      });
    }

    res.status(400).json({ error: err.message || 'Ошибка создания заявления' });
  } finally {
    client.release();
  }
});

// Обновить заявление
router.put('/applications/:id', requireAuth, async (req, res) => {
  const { choices, ...rawAppData } = req.body;
  const appData = normalizeApplicationData(rawAppData);
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Проверяем доступ к заявлению
    const checkAccess = await client.query('SELECT user_id, status_id FROM applications WHERE id = $1', [req.params.id]);
    if (checkAccess.rows.length === 0) {
      throw new Error('Заявление не найдено');
    }

    const isMod = req.user.role_id === 2 || req.user.role_id === 3;
    if (!isMod && checkAccess.rows[0].user_id !== req.user.id) {
      throw new Error('Доступ запрещен');
    }

    if (!isMod && !(await isAdmissionOpen())) {
      throw new Error('Прием документов сейчас закрыт. Редактирование заявления временно недоступно.');
    }

    await client.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           middle_name = COALESCE($3, middle_name),
           phone = COALESCE($4, phone),
           birth_date = COALESCE($5, birth_date),
           gender = COALESCE($6, gender),
           region_id = COALESCE($7, region_id),
           updated_at = NOW()
       WHERE id = $8`,
      [
        appData.first_name,
        appData.last_name,
        appData.middle_name,
        appData.phone,
        appData.birth_date,
        appData.gender,
        appData.region_id,
        checkAccess.rows[0].user_id
      ]
    );

    // Обновляем поля заявления
    await client.query(
      `UPDATE applications 
       SET passport_series = COALESCE($1, passport_series),
           passport_issue_date = COALESCE($2, passport_issue_date),
           passport_issued_by = COALESCE($3, passport_issued_by),
           education_level = COALESCE($4, education_level),
           education_institution = COALESCE($5, education_institution),
           education_graduation_year = COALESCE($6, education_graduation_year),
           document_number = COALESCE($7, document_number),
           document_date = COALESCE($8, document_date),
           study_form = COALESCE($9, study_form),
           funding_form = COALESCE($10, funding_form),
           accommodation_needed = COALESCE($11, accommodation_needed),
           olympiad_participant = COALESCE($12, olympiad_participant),
           parent_phone = COALESCE($13, parent_phone),
           education_document_number = COALESCE($14, education_document_number),
           education_document_date = COALESCE($15, education_document_date),
           region_id = COALESCE($16, region_id),
           address = COALESCE($17, address),
           updated_at = NOW()
       WHERE id = $18`,
      [
        appData.passport_series,
        appData.passport_issue_date,
        appData.passport_issued_by,
        appData.education_level,
        appData.education_institution,
        appData.education_graduation_year,
        appData.document_number,
        appData.document_date,
        appData.study_form,
        appData.funding_form,
        appData.accommodation_needed,
        appData.olympiad_participant,
        appData.parent_phone,
        appData.education_document_number,
        appData.education_document_date,
        appData.region_id,
        appData.address,
        req.params.id
      ]
    );

    // Обновляем choices
    if (choices && Array.isArray(choices)) {
      // Удаляем старые
      await client.query('DELETE FROM application_choices WHERE application_id = $1', [req.params.id]);
      // Добавляем новые
      for (const choice of choices) {
        await client.query(
          'INSERT INTO application_choices (application_id, profile_id, priority) VALUES ($1, $2, $3)',
          [req.params.id, choice.profile_id, choice.priority]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Ошибка обновления заявления:', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Отправить заявление на рассмотрение (черновик -> подан)
router.post('/applications/:id/submit', requireAuth, async (req, res) => {
  if (!(await ensureAdmissionOpenForApplicant(req, res))) return;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Проверяем наличие всех обязательных файлов перед сменой статуса
    const filesCheck = await client.query(
      `SELECT ARRAY_AGG(DISTINCT file_category) AS categories FROM application_files
       WHERE application_id = $1`,
      [req.params.id]
    );
    const uploadedCategories = filesCheck.rows[0]?.categories || [];

    const requiredCategories = [
      { key: 'passport_scan', label: 'скан паспорта' },
      { key: 'passport_translation', label: 'перевод паспорта' },
      { key: 'photo', label: 'фотография 3×4' },
      { key: 'education_scan', label: 'документ об образовании' },
    ];
    const missing = requiredCategories
      .filter(r => !uploadedCategories.includes(r.key))
      .map(r => r.label);

    if (missing.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Не загружены обязательные документы: ${missing.join(', ')}. Загрузите все документы и попробуйте снова.`,
        code: 'MISSING_REQUIRED_FILES',
        missing,
      });
    }

    const result = await client.query(
      `UPDATE applications
       SET status_id = 2, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status_id = 1
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new Error('Заявление не найдено, уже отправлено или принадлежит другому пользователю');
    }

    // Запись в историю
    await client.query(
      'INSERT INTO application_history (application_id, status_id, comment, created_by) VALUES ($1, 2, $2, $3)',
      [req.params.id, 'Заявление отправлено на рассмотрение', req.user.id]
    );

    await client.query('COMMIT');
    emitApplicationUpdated({
      applicationId: result.rows[0].id,
      userId: result.rows[0].user_id,
      action: 'submitted',
      status: { id: 2, name: 'Подано' }
    });
    res.json({ data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Ошибка отправки заявления:', err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Получить историю заявления
router.get('/applications/:id/history', requireAuth, async (req, res) => {
  try {
    const access = await db.query(
      'SELECT user_id FROM applications WHERE id = $1',
      [req.params.id]
    );

    if (!access.rows.length) {
      return res.status(404).json({ error: 'Заявление не найдено' });
    }

    if (!isStaffUser(req.user) && access.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const history = await getApplicationHistory(req.params.id);
    res.json({ data: history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить внутренний комментарий сотрудника
router.post('/applications/:id/comments', requireAdminOrReviewer, async (req, res) => {
  const { comment } = req.body;
  const trimmedComment = typeof comment === 'string' ? comment.trim() : '';

  if (!trimmedComment) {
    return res.status(400).json({ error: 'Комментарий не может быть пустым' });
  }

  try {
    const access = await db.query(
      `SELECT a.id,
              a.user_id,
              u.first_name,
              u.last_name
       FROM applications a
       JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (!access.rows.length) {
      return res.status(404).json({ error: 'Заявление не найдено' });
    }

    const result = await db.query(
      `INSERT INTO application_staff_comments (application_id, comment, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, application_id, comment, created_by, created_at, updated_at`,
      [req.params.id, trimmedComment, req.user.id]
    );

    const applicant = access.rows[0];
    await createStaffNotifications({
      type: 'application_internal_comment',
      message: `Внутренний комментарий по заявлению ${applicant.first_name} ${applicant.last_name}`,
      applicationId: req.params.id,
      meta: {
        comment: trimmedComment,
        createdBy: req.user.id,
        applicantName: `${applicant.first_name || ''} ${applicant.last_name || ''}`.trim()
      }
    });

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Изменить статус заявления (Модератор/Админ)
router.put('/applications/:id/status', requireAdminOrReviewer, async (req, res) => {
  const { statusId, comment } = req.body;
  try {
    const applicationResult = await db.query(
      `SELECT a.id, a.user_id, s.name AS current_status_name,
              u.email, u.first_name, u.last_name, u.middle_name
       FROM applications a
       LEFT JOIN application_statuses s ON s.id = a.status_id
       JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (!applicationResult.rows.length) {
      return res.status(404).json({ error: 'Заявление не найдено' });
    }

    const rpcResult = await db.query('SELECT add_application_comment($1, $2, $3, $4) as success', [
      req.params.id,
      statusId,
      comment || '',
      req.user.id
    ]);

    if (rpcResult.rows[0]?.success) {
      const statusResult = await db.query(
        'SELECT id, name, color FROM application_statuses WHERE id = $1',
        [statusId]
      );
      const status = statusResult.rows[0];
      const trimmedComment = typeof comment === 'string' ? comment.trim() : '';

      await createNotification({
        userId: applicationResult.rows[0].user_id,
        type: 'application_status_changed',
        message: `Статус заявления изменен: ${status?.name || 'обновлен'}`,
        applicationId: req.params.id,
        meta: {
          oldStatus: applicationResult.rows[0].current_status_name,
          newStatus: status?.name || null,
          statusColor: status?.color || null,
          comment: trimmedComment || null,
          changedBy: req.user.id
        }
      });

      emitApplicationUpdated({
        applicationId: req.params.id,
        userId: applicationResult.rows[0].user_id,
        action: 'status_changed',
        status: status
          ? { id: status.id, name: status.name, color: status.color }
          : { id: statusId, name: null, color: null }
      });

      const application = applicationResult.rows[0];
      sendApplicationStatusChangeEmail({
        applicationId: req.params.id,
        statusId,
        statusName: status?.name || null,
        comment: trimmedComment,
        studentEmail: application.email,
        studentFirstName: application.first_name,
        studentLastName: application.last_name,
        studentMiddleName: application.middle_name
      }).catch((emailError) => {
        console.error('Ошибка отправки email об изменении статуса заявления:', emailError);
      });

      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Не удалось обновить статус' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Совместимые профили
router.get('/applications/:id/compatibles', requireAuth, async (req, res) => {
  try {
    if (!(await ensureApplicationAccess(req, res, req.params.id))) return;

    const rpcResult = await db.query('SELECT * FROM get_compatible_profiles($1, $2, $3, $4)', [
      req.params.id,
      req.query.search || null,
      req.query.limit ? parseInt(req.query.limit) : 100,
      req.query.offset ? parseInt(req.query.offset) : 0
    ]);
    res.json({ 
      data: rpcResult.rows[0]?.profiles || [], 
      count: rpcResult.rows[0]?.total_count || 0 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Проверить, что выбранные профили заявления имеют одинаковый набор экзаменов
router.get('/applications/:id/choices/validate', requireAuth, async (req, res) => {
  try {
    const access = await db.query(
      'SELECT user_id FROM applications WHERE id = $1',
      [req.params.id]
    );

    if (!access.rows.length) {
      return res.status(404).json({ error: 'Заявление не найдено' });
    }

    const isStaff = req.user.role_id === 2 || req.user.role_id === 3;
    if (!isStaff && access.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const result = await db.query(
      `WITH choice_subjects AS (
         SELECT ac.profile_id,
                ARRAY_AGG(pe.subject_id ORDER BY pe.subject_id) AS subjects
         FROM application_choices ac
         JOIN profile_exams pe ON pe.profile_id = ac.profile_id
         WHERE ac.application_id = $1
         GROUP BY ac.profile_id
       )
       SELECT COUNT(DISTINCT subjects)::int <= 1 AS is_valid
       FROM choice_subjects`,
      [req.params.id]
    );

    res.json({ data: result.rows[0]?.is_valid ?? true });
  } catch (err) {
    console.error('Ошибка проверки совместимости выбранных профилей:', err);
    res.status(500).json({ error: err.message });
  }
});

// Экспорт всех данных абитуриентов (Админ)
router.get('/applications/excel/export', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM get_all_applicants_data()');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 5. ДОКУМЕНТЫ И ФАЙЛЫ (Files)
// ==========================================

// Типы документов
router.get('/files/document-types', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM document_types ORDER BY id');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить документы по ID заявления
router.get('/files/documents/:appId', requireAuth, async (req, res) => {
  try {
    if (!(await ensureApplicationAccess(req, res, req.params.appId))) return;

    const result = await db.query('SELECT get_application_documents($1) as documents', [req.params.appId]);
    res.json({ data: result.rows[0]?.documents || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Загрузить документ (аттестат/диплом)
router.post('/files/documents/:appId', requireAuth, upload.single('file'), async (req, res) => {
  const { documentTypeId } = req.body;
  const file = req.file;
  const appId = req.params.appId;

  if (!file || !documentTypeId) {
    return res.status(400).json({ error: 'Файл и documentTypeId обязательны' });
  }

  try {
    if (!(await ensureApplicationAccess(req, res, appId))) return;

    const originalFileName = decodeUploadedFileName(file.originalname);
    const fileExt = getFileExtension(originalFileName);
    const fileId = crypto.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID();
    const s3Key = `${appId}/${fileId}.${fileExt}`;

    // Загружаем в MinIO
    await s3.uploadToS3(s3.BUCKET_DOCUMENTS, s3Key, file.buffer, file.mimetype);

    // Записываем в БД через хранимую функцию
    const rpcResult = await db.query('SELECT upload_document($1, $2, $3, $4, $5, $6) as doc_id', [
      appId,
      parseInt(documentTypeId),
      originalFileName,
      s3Key,
      file.size,
      file.mimetype
    ]);

    res.json({ data: { id: rpcResult.rows[0]?.doc_id } });
  } catch (err) {
    console.error('Ошибка загрузки документа:', err);
    res.status(500).json({ error: err.message });
  }
});

// Подписанный URL документа
router.get('/files/signed-url/document/:docId', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT application_id, file_path FROM documents WHERE id = $1', [req.params.docId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    if (!(await ensureApplicationAccess(req, res, result.rows[0].application_id))) return;

    const signedUrl = await s3.getPresignedDownloadUrl(
      s3.BUCKET_DOCUMENTS,
      await resolveS3ObjectKey({
        bucket: s3.BUCKET_DOCUMENTS,
        filePath: result.rows[0].file_path,
        bucketAlias: 'application_documents'
      })
    );
    res.json({ data: { signedUrl } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Просмотр документа через backend с проверкой доступа
router.get('/files/view/document/:docId', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT application_id, file_path, file_name, file_type FROM documents WHERE id = $1',
      [req.params.docId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    if (!(await ensureApplicationAccess(req, res, result.rows[0].application_id))) return;

    await streamS3File(res, {
      bucket: s3.BUCKET_DOCUMENTS,
      keyCandidates: getS3KeyCandidates(result.rows[0].file_path, 'application_documents'),
      fileName: result.rows[0].file_name,
      contentType: result.rows[0].file_type
    });
  } catch (err) {
    console.error('Ошибка просмотра документа:', err.message, err.triedKeys || []);
    res.status(404).json({ error: 'Файл не найден' });
  }
});

// Обновить документ
router.put('/files/documents/:docId', requireAuth, async (req, res) => {
  const { document_type_id } = req.body;
  try {
    const access = await db.query('SELECT application_id FROM documents WHERE id = $1', [req.params.docId]);
    if (access.rows.length === 0) {
      return res.status(404).json({ error: 'Документ не найден' });
    }
    if (!(await ensureApplicationAccess(req, res, access.rows[0].application_id))) return;

    const result = await db.query(
      'UPDATE documents SET document_type_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [document_type_id, req.params.docId]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Загрузить файл заявления (фотография)
router.post('/files/application-files/:appId', requireAuth, upload.single('file'), async (req, res) => {
  const { fileCategory, isImage } = req.body;
  const file = req.file;
  const appId = req.params.appId;

  if (!file) {
    return res.status(400).json({ error: 'Файл обязателен' });
  }

  try {
    if (!(await ensureApplicationAccess(req, res, appId))) return;

    const originalFileName = decodeUploadedFileName(file.originalname);
    const fileExt = getFileExtension(originalFileName);
    const category = fileCategory || 'general';
    const s3Key = `${appId}/${category}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

    await s3.uploadToS3(s3.BUCKET_FILES, s3Key, file.buffer, file.mimetype);

    const rpcResult = await db.query('SELECT upload_application_file($1, $2, $3, $4, $5, $6, $7) as file_id', [
      appId,
      s3Key,
      originalFileName,
      file.mimetype,
      file.size,
      isImage === 'true' || file.mimetype.startsWith('image/'),
      category
    ]);

    res.json({ data: { id: rpcResult.rows[0]?.file_id } });
  } catch (err) {
    console.error('Ошибка загрузки файла заявления:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить файлы заявления
router.get('/files/application-files/:appId', requireAuth, async (req, res) => {
  try {
    if (!(await ensureApplicationAccess(req, res, req.params.appId))) return;

    const result = await db.query('SELECT * FROM application_files WHERE application_id = $1 ORDER BY created_at DESC', [req.params.appId]);
    res.json({ data: result.rows.map(decodeFileRecord) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Подписанный URL файла заявления
router.get('/files/signed-url/file/:fileId', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT application_id, file_path FROM application_files WHERE id = $1', [req.params.fileId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    if (!(await ensureApplicationAccess(req, res, result.rows[0].application_id))) return;

    const signedUrl = await s3.getPresignedDownloadUrl(
      s3.BUCKET_FILES,
      await resolveS3ObjectKey({
        bucket: s3.BUCKET_FILES,
        filePath: result.rows[0].file_path,
        bucketAlias: 'application_files'
      })
    );
    res.json({ data: { signedUrl } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Просмотр файла заявления через backend с проверкой доступа
router.get('/files/view/file/:fileId', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT application_id, file_path, file_name, file_type FROM application_files WHERE id = $1',
      [req.params.fileId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    if (!(await ensureApplicationAccess(req, res, result.rows[0].application_id))) return;

    await streamS3File(res, {
      bucket: s3.BUCKET_FILES,
      keyCandidates: getS3KeyCandidates(result.rows[0].file_path, 'application_files'),
      fileName: result.rows[0].file_name,
      contentType: result.rows[0].file_type
    });
  } catch (err) {
    console.error('Ошибка просмотра файла заявления:', err.message, err.triedKeys || []);
    res.status(404).json({ error: 'Файл не найден' });
  }
});

// Загрузить сертификат олимпиады
router.post('/files/olympiad-certificates/:appId', requireAuth, upload.single('file'), async (req, res) => {
  const file = req.file;
  const appId = req.params.appId;

  if (!file) {
    return res.status(400).json({ error: 'Файл обязателен' });
  }

  try {
    if (!(await ensureApplicationAccess(req, res, appId))) return;

    const originalFileName = decodeUploadedFileName(file.originalname);
    const fileExt = getFileExtension(originalFileName);
    const s3Key = `${appId}/olympiad_${Date.now()}.${fileExt}`;

    await s3.uploadToS3(s3.BUCKET_FILES, s3Key, file.buffer, file.mimetype);

    const rpcResult = await db.query('SELECT upload_olympiad_certificate($1, $2, $3, $4, $5, 2025) as cert_id', [
      appId,
      originalFileName,
      s3Key,
      file.size,
      file.mimetype
    ]);

    res.json({ data: { id: rpcResult.rows[0]?.cert_id } });
  } catch (err) {
    console.error('Ошибка загрузки сертификата олимпиады:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить сертификаты олимпиады
router.get('/files/olympiad-certificates/:appId', requireAuth, async (req, res) => {
  try {
    if (!(await ensureApplicationAccess(req, res, req.params.appId))) return;

    const result = await db.query('SELECT * FROM olympiad_certificates WHERE application_id = $1 ORDER BY created_at DESC', [req.params.appId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Подписанный URL сертификата олимпиады
router.get('/files/signed-url/certificate/:certId', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT application_id, file_path FROM olympiad_certificates WHERE id = $1', [req.params.certId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Сертификат не найден' });
    }
    if (!(await ensureApplicationAccess(req, res, result.rows[0].application_id))) return;

    const signedUrl = await s3.getPresignedDownloadUrl(
      s3.BUCKET_FILES,
      await resolveS3ObjectKey({
        bucket: s3.BUCKET_FILES,
        filePath: result.rows[0].file_path,
        bucketAlias: 'application_files'
      })
    );
    res.json({ data: { signedUrl } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Просмотр сертификата олимпиады через backend с проверкой доступа
router.get('/files/view/certificate/:certId', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT application_id, file_path, name AS file_name, file_type FROM olympiad_certificates WHERE id = $1',
      [req.params.certId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Сертификат не найден' });
    }
    if (!(await ensureApplicationAccess(req, res, result.rows[0].application_id))) return;

    await streamS3File(res, {
      bucket: s3.BUCKET_FILES,
      keyCandidates: getS3KeyCandidates(result.rows[0].file_path, 'application_files'),
      fileName: result.rows[0].file_name,
      contentType: result.rows[0].file_type
    });
  } catch (err) {
    console.error('Ошибка просмотра сертификата олимпиады:', err.message, err.triedKeys || []);
    res.status(404).json({ error: 'Файл не найден' });
  }
});

// ЭНДПОИНТ СКАЧИВАНИЯ/СТРИМИНГА ФАЙЛА НАПРЯМУЮ
router.get('/files/download/:bucket/*', async (req, res) => {
  const bucketName = req.params.bucket;
  const filePath = req.params[0] || req.params.filePath;

  try {
    const bucket = bucketName === 'application_documents' ? s3.BUCKET_DOCUMENTS : s3.BUCKET_FILES;
    const bucketAlias = bucketName === 'application_documents' ? 'application_documents' : 'application_files';

    await streamS3File(res, {
      bucket,
      keyCandidates: getS3KeyCandidates(filePath, bucketAlias),
      fileName: String(filePath || '').split('/').pop() || 'file',
      contentType: undefined
    });
  } catch (err) {
    console.error(`Ошибка скачивания файла ${bucketName}/${filePath}:`, err.message, err.triedKeys || []);
    res.status(404).json({ error: 'Файл не найден' });
  }
});


// ==========================================
// 6. ПУБЛИЧНАЯ АНАЛИТИКА (Public Stats)
// ==========================================

router.get('/public/stats/general', async (req, res) => {
  try {
    const result = await db.query('SELECT get_public_general_stats() as stats');
    res.json({ data: result.rows[0]?.stats || {} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/public/stats/daily', async (req, res) => {
  const limit = req.query.daysLimit || req.query.p_days_limit
    ? parseInt(req.query.daysLimit || req.query.p_days_limit)
    : 30;
  try {
    const result = await db.query('SELECT get_public_daily_stats($1) as stats', [limit]);
    res.json({ data: result.rows[0]?.stats || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/public/stats/regional', async (req, res) => {
  try {
    const result = await db.query('SELECT get_public_regional_stats() as stats');
    res.json({ data: result.rows[0]?.stats || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/public/stats/programs', async (req, res) => {
  try {
    const result = await db.query('SELECT get_public_program_stats() as stats');
    res.json({ data: result.rows[0]?.stats || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/public/stats/statuses', async (req, res) => {
  try {
    const result = await db.query('SELECT get_public_status_stats() as stats');
    res.json({ data: result.rows[0]?.stats || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CMS — Content Management System
// ==========================================

const { BUCKET_SITE_ASSETS } = s3;
const uploadSiteAsset = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    cb(null, allowed.includes(file.mimetype));
  }
});

const defaultCmsPages = {
  faq: {
    title: 'Часто задаваемые вопросы',
    status: 'published'
  }
};

async function getOrCreateDefaultCmsPage(slug) {
  const pageResult = await db.query('SELECT id FROM cms_pages WHERE slug = $1', [slug]);
  if (pageResult.rows.length) return pageResult.rows[0];

  const defaultPage = defaultCmsPages[slug];
  if (!defaultPage) return null;

  const createdPage = await db.query(
    `INSERT INTO cms_pages (slug, title, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
     RETURNING id`,
    [slug, defaultPage.title, defaultPage.status]
  );

  return createdPage.rows[0];
}

// -- Public CMS endpoints --

router.get('/cms/pages/:slug', async (req, res) => {
  try {
    const pageResult = await db.query(
      `SELECT id, slug, title, status FROM cms_pages WHERE slug = $1 AND status = 'published'`,
      [req.params.slug]
    );
    if (!pageResult.rows.length) return res.status(404).json({ error: 'Страница не найдена' });
    const page = pageResult.rows[0];
    const sectionsResult = await db.query(
      `SELECT id, type, anchor, title, content, sort_order, is_published
       FROM cms_sections
       WHERE page_id = $1 AND is_published = true
       ORDER BY sort_order ASC`,
      [page.id]
    );
    res.json({ data: { ...page, sections: sectionsResult.rows } });
  } catch (err) {
    console.error('CMS page error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/cms/news', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await db.query(
      `SELECT id, slug, title, summary, cover_asset_id, published_at, created_at
       FROM news_posts WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST, created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await db.query(`SELECT COUNT(*) FROM news_posts WHERE status = 'published'`);
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cms/news/:slug', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, a.url AS cover_url
       FROM news_posts n
       LEFT JOIN cms_assets a ON a.id = n.cover_asset_id
       WHERE n.slug = $1 AND n.status = 'published'`,
      [req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Новость не найдена' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cms/contacts', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT category, key, value, label, sort_order
       FROM site_settings ORDER BY category, sort_order`
    );
    const grouped = result.rows.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = {};
      acc[row.category][row.key] = row.value;
      return acc;
    }, {});
    res.json({ data: grouped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cms/admission-status', async (_req, res) => {
  try {
    res.json({ data: { is_open: await isAdmissionOpen() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cms/registration-status', async (_req, res) => {
  try {
    res.json({ data: { is_open: await isRegistrationOpen() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- Admin CMS endpoints --

router.get('/admin/cms/pages', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.slug, p.title, p.status, p.updated_at,
              COUNT(s.id) AS section_count
       FROM cms_pages p LEFT JOIN cms_sections s ON s.page_id = p.id
       GROUP BY p.id ORDER BY p.id`
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/cms/pages/:slug/sections', requireAdmin, async (req, res) => {
  try {
    const page = await getOrCreateDefaultCmsPage(req.params.slug);
    if (!page) return res.status(404).json({ error: 'Страница не найдена' });
    const sections = await db.query(
      `SELECT id, type, anchor, title, content, sort_order, is_published, updated_at
       FROM cms_sections WHERE page_id = $1 ORDER BY sort_order ASC`,
      [page.id]
    );
    res.json({ data: sections.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/cms/pages/:slug/sections', requireAdmin, async (req, res) => {
  const { type, anchor, title, content, sort_order } = req.body;
  if (!type || !content) return res.status(400).json({ error: 'type и content обязательны' });
  try {
    const page = await getOrCreateDefaultCmsPage(req.params.slug);
    if (!page) return res.status(404).json({ error: 'Страница не найдена' });
    const result = await db.query(
      `INSERT INTO cms_sections (page_id, type, anchor, title, content, sort_order)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       RETURNING *`,
      [page.id, type, anchor || null, title || null, JSON.stringify(content), sort_order || 0]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/cms/sections/:id', requireAdmin, async (req, res) => {
  const { title, content, sort_order, is_published, anchor } = req.body;
  try {
    const result = await db.query(
      `UPDATE cms_sections
       SET title = COALESCE($2, title),
           content = COALESCE($3::jsonb, content),
           sort_order = COALESCE($4, sort_order),
           is_published = COALESCE($5, is_published),
           anchor = COALESCE($6, anchor),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, title || null, content ? JSON.stringify(content) : null, sort_order ?? null, is_published ?? null, anchor || null]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Секция не найдена' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/cms/sections/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM cms_sections WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/cms/sections/reorder', requireAdmin, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items должен быть массивом' });
  try {
    for (const item of items) {
      await db.query('UPDATE cms_sections SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin news
router.get('/admin/cms/news', requireAdminOrReviewer, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await db.query(
      `SELECT n.id, n.slug, n.title, n.summary, n.status, n.published_at, n.created_at, n.updated_at,
              a.url AS cover_url
       FROM news_posts n LEFT JOIN cms_assets a ON a.id = n.cover_asset_id
       ORDER BY n.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await db.query('SELECT COUNT(*) FROM news_posts');
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/cms/news', requireAdmin, async (req, res) => {
  const { slug, title, summary, body, status, published_at, cover_asset_id } = req.body;
  if (!slug || !title) return res.status(400).json({ error: 'slug и title обязательны' });
  try {
    const result = await db.query(
      `INSERT INTO news_posts (slug, title, summary, body, status, published_at, cover_asset_id, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
       RETURNING *`,
      [slug, title, summary || null, body || null, status || 'draft', published_at || null, cover_asset_id || null, req.user.id]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Новость с таким slug уже существует' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/cms/news/:id', requireAdminOrReviewer, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.*, a.url AS cover_url FROM news_posts n
       LEFT JOIN cms_assets a ON a.id = n.cover_asset_id WHERE n.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Новость не найдена' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/cms/news/:id', requireAdmin, async (req, res) => {
  const { title, summary, body, status, published_at, cover_asset_id } = req.body;
  try {
    const result = await db.query(
      `UPDATE news_posts
       SET title = COALESCE($2, title),
           summary = $3,
           body = $4,
           status = COALESCE($5, status),
           published_at = $6,
           cover_asset_id = $7,
           updated_by = $8,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, title || null, summary ?? null, body ?? null, status || null, published_at ?? null, cover_asset_id ?? null, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Новость не найдена' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/cms/news/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM news_posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin site settings
router.get('/admin/cms/settings', requireAdminOrReviewer, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM site_settings ORDER BY category, sort_order'
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/cms/settings', requireAdmin, async (req, res) => {
  const { category, key, value, label } = req.body;
  if (!category || !key) return res.status(400).json({ error: 'category и key обязательны' });
  try {
    const result = await db.query(
      `INSERT INTO site_settings (category, key, value, label, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (category, key) DO UPDATE SET value = $3, label = COALESCE($4, site_settings.label), updated_at = NOW()
       RETURNING *`,
      [category, key, value ?? null, label || null]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin assets
router.get('/admin/cms/assets', requireAdminOrReviewer, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await db.query(
      `SELECT id, bucket, object_key, url, mime_type, original_name, file_size_bytes, alt_text, created_at
       FROM cms_assets ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await db.query('SELECT COUNT(*) FROM cms_assets');
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/cms/assets', requireAdmin, uploadSiteAsset.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не передан или неподдерживаемый формат' });
  const originalFileName = decodeUploadedFileName(req.file.originalname);
  const ext = getFileExtension(originalFileName).toLowerCase();
  const objectKey = `cms/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  try {
    await s3.uploadToS3(BUCKET_SITE_ASSETS, objectKey, req.file.buffer, req.file.mimetype);
    const s3Endpoint = process.env.S3_ENDPOINT || 'http://minio:9000';
    const publicBase = process.env.S3_PUBLIC_URL || s3Endpoint;
    const url = `${publicBase}/${BUCKET_SITE_ASSETS}/${objectKey}`;
    const result = await db.query(
      `INSERT INTO cms_assets (bucket, object_key, url, mime_type, original_name, file_size_bytes, alt_text, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [BUCKET_SITE_ASSETS, objectKey, url, req.file.mimetype, originalFileName, req.file.size, req.body.alt_text || '', req.user.id]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('Asset upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/cms/assets/:id', requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM cms_assets WHERE id = $1 RETURNING object_key, bucket', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Файл не найден' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

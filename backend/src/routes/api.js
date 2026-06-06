const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('../config/db');
const s3 = require('../config/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { JWT_SECRET, requireAuth, requireAdmin, requireAdminOrReviewer } = require('../middleware/auth');

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

  const subject = 'Код подтверждения - Приемная кампания Губкинского университета';
  const text = `Ваш код подтверждения: ${otpCode}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h2 style="color: #003366; text-align: center;">Губкинский университет</h2>
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
    
    const subject = 'Сброс пароля - Приемная кампания Губкинского университета';
    const text = `Ваш новый пароль: ${newPassword}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #003366; text-align: center;">Губкинский университет</h2>
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
      result = await db.query('SELECT * FROM directions WHERE level_id = $1 ORDER BY name', [levelId]);
    } else {
      result = await db.query(
        `SELECT d.*, el.name as level_name 
         FROM directions d 
         JOIN education_levels el ON el.id = d.level_id 
         ORDER BY d.name`
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
  try {
    const result = await db.query(
      'INSERT INTO directions (level_id, code, name) VALUES ($1, $2, $3) RETURNING *',
      [level_id, code, name]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить направление (Админ)
router.put('/education/directions/:id', requireAdmin, async (req, res) => {
  const { level_id, code, name } = req.body;
  try {
    const result = await db.query(
      'UPDATE directions SET level_id = $1, code = $2, name = $3 WHERE id = $4 RETURNING *',
      [level_id, code, name, req.params.id]
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
               'level', jsonb_build_object('name', el.name)
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
      ORDER BY p.name`;
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

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO profiles (direction_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [profileData.direction_id, profileData.name, profileData.description || null]
    );

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

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE profiles
       SET direction_id = $1,
           name = $2,
           description = $3
       WHERE id = $4
       RETURNING *`,
      [profileData.direction_id, profileData.name, profileData.description || null, req.params.id]
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
      result = await db.query('SELECT * FROM profiles WHERE direction_id = $1 ORDER BY name', [directionId]);
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

    const count = result.rows.length > 0 ? result.rows[0].total_count : 0;
    res.json({ data: result.rows, count });
  } catch (err) {
    console.error('Ошибка вызова get_filtered_applications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить одно заявление по ID
router.get('/applications/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT get_application_details($1) as details', [req.params.id]);
    const details = result.rows[0]?.details;
    if (!details) {
      return res.status(404).json({ error: 'Заявление не найдено' });
    }

    // Безопасность: обычный абитуриент может смотреть только свои заявления
    const isMod = req.user.role_id === 2 || req.user.role_id === 3;
    if (!isMod && details.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    res.json({ data: details });
  } catch (err) {
    console.error('Ошибка получения деталей заявления:', err);
    res.status(500).json({ error: err.message });
  }
});

// Создать заявление
router.post('/applications', requireAuth, async (req, res) => {
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

    // Проверяем, нет ли уже созданного заявления у пользователя в этом учебном году
    const currentYear = new Date().getFullYear();
    const checkApp = await client.query(
      'SELECT id FROM applications WHERE user_id = $1 AND academic_year = $2',
      [req.user.id, currentYear]
    );

    if (checkApp.rows.length > 0) {
      throw new Error('Вы уже создали заявление на этот учебный год');
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
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

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
    const result = await db.query(
      `SELECT h.*, s.name as status_name, s.color as status_color 
       FROM application_history h
       JOIN application_statuses s ON s.id = h.status_id
       WHERE h.application_id = $1 
       ORDER BY h.created_at DESC`,
      [req.params.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Изменить статус заявления (Модератор/Админ)
router.put('/applications/:id/status', requireAdminOrReviewer, async (req, res) => {
  const { statusId, comment } = req.body;
  try {
    const rpcResult = await db.query('SELECT add_application_comment($1, $2, $3, $4) as success', [
      req.params.id,
      statusId,
      comment || '',
      req.user.id
    ]);

    if (rpcResult.rows[0]?.success) {
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
    const fileExt = file.originalname.split('.').pop();
    const fileId = crypto.randomUUID ? crypto.randomUUID() : require('crypto').randomUUID();
    const s3Key = `${appId}/${fileId}.${fileExt}`;

    // Загружаем в MinIO
    await s3.uploadToS3(s3.BUCKET_DOCUMENTS, s3Key, file.buffer, file.mimetype);

    // Записываем в БД через хранимую функцию
    const rpcResult = await db.query('SELECT upload_document($1, $2, $3, $4, $5, $6) as doc_id', [
      appId,
      parseInt(documentTypeId),
      file.originalname,
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
    const result = await db.query('SELECT file_path FROM documents WHERE id = $1', [req.params.docId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Документ не найден' });
    }

    const signedUrl = await s3.getPresignedDownloadUrl(s3.BUCKET_DOCUMENTS, result.rows[0].file_path);
    res.json({ data: { signedUrl } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить документ
router.put('/files/documents/:docId', requireAuth, async (req, res) => {
  const { document_type_id } = req.body;
  try {
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
    const fileExt = file.originalname.split('.').pop();
    const category = fileCategory || 'general';
    const s3Key = `${appId}/${category}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

    await s3.uploadToS3(s3.BUCKET_FILES, s3Key, file.buffer, file.mimetype);

    const rpcResult = await db.query('SELECT upload_application_file($1, $2, $3, $4, $5, $6, $7) as file_id', [
      appId,
      s3Key,
      file.originalname,
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
    const result = await db.query('SELECT * FROM application_files WHERE application_id = $1 ORDER BY created_at DESC', [req.params.appId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Подписанный URL файла заявления
router.get('/files/signed-url/file/:fileId', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT file_path FROM application_files WHERE id = $1', [req.params.fileId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Файл не найден' });
    }

    const signedUrl = await s3.getPresignedDownloadUrl(s3.BUCKET_FILES, result.rows[0].file_path);
    res.json({ data: { signedUrl } });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const fileExt = file.originalname.split('.').pop();
    const s3Key = `${appId}/olympiad_${Date.now()}.${fileExt}`;

    await s3.uploadToS3(s3.BUCKET_FILES, s3Key, file.buffer, file.mimetype);

    const rpcResult = await db.query('SELECT upload_olympiad_certificate($1, $2, $3, $4, $5, 2025) as cert_id', [
      appId,
      file.originalname,
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
    const result = await db.query('SELECT * FROM olympiad_certificates WHERE application_id = $1 ORDER BY created_at DESC', [req.params.appId]);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Подписанный URL сертификата олимпиады
router.get('/files/signed-url/certificate/:certId', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT file_path FROM olympiad_certificates WHERE id = $1', [req.params.certId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Сертификат не найден' });
    }

    const signedUrl = await s3.getPresignedDownloadUrl(s3.BUCKET_FILES, result.rows[0].file_path);
    res.json({ data: { signedUrl } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ЭНДПОИНТ СКАЧИВАНИЯ/СТРИМИНГА ФАЙЛА НАПРЯМУЮ
router.get('/files/download/:bucket/*', async (req, res) => {
  const bucketName = req.params.bucket;
  const filePath = req.params[0] || req.params.filePath;

  try {
    const bucket = bucketName === 'application_documents' ? s3.BUCKET_DOCUMENTS : s3.BUCKET_FILES;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: filePath,
    });

    const s3Response = await s3.s3Client.send(command);
    
    if (s3Response.ContentType) {
      res.setHeader('Content-Type', s3Response.ContentType);
    }
    if (s3Response.ContentLength) {
      res.setHeader('Content-Length', s3Response.ContentLength);
    }
    
    s3Response.Body.pipe(res);
  } catch (err) {
    console.error(`Ошибка скачивания файла ${bucketName}/${filePath}:`, err.message);
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
  const limit = req.query.daysLimit ? parseInt(req.query.daysLimit) : 30;
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

module.exports = router;

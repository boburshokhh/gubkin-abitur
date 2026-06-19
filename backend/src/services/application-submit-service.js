const db = require('../config/db');
const s3 = require('../config/s3');
const { decodeUploadedFileName, getFileExtension } = require('../utils/file-name');
const { MAX_APPLICATION_FILE_BYTES, MAX_APPLICATION_FILE_MB } = require('../config/upload-limits');

const SUBMIT_FILE_FIELDS = [
  { key: 'passport_scan', isImage: false, label: 'скан паспорта' },
  { key: 'passport_translation', isImage: false, label: 'перевод паспорта' },
  { key: 'photo', isImage: true, label: 'фотография 3×4' },
  { key: 'education_scan', isImage: false, label: 'документ об образовании' },
  { key: 'olympiad_certificate', isImage: false, label: 'сертификат олимпиады', optional: true }
];

function validateApplicationMetadata(appData) {
  const errors = [];

  if (!appData.last_name) errors.push('Фамилия обязательна для заполнения');
  if (!appData.first_name) errors.push('Имя обязательно для заполнения');
  if (!appData.birth_date) errors.push('Дата рождения обязательна для заполнения');
  if (!appData.gender) errors.push('Пол обязателен для заполнения');
  if (!appData.address) errors.push('Адрес проживания обязателен для заполнения');
  if (!appData.phone) errors.push('Номер телефона обязателен для заполнения');
  if (!appData.email) errors.push('Email обязателен для заполнения');
  if (!appData.is_foreign_residence && !appData.region_id) {
    errors.push('Регион проживания обязателен для заполнения');
  }
  if (!appData.passport_series) errors.push('Серия/номер паспорта обязательны для заполнения');
  if (!appData.passport_issue_date) errors.push('Дата выдачи паспорта обязательна для заполнения');
  if (!appData.passport_issued_by) errors.push('Орган, выдавший паспорт, обязателен для заполнения');
  if (!appData.education_level) errors.push('Уровень образования обязателен для заполнения');
  if (!appData.education_institution) errors.push('Название учебного заведения обязательно для заполнения');
  if (!appData.education_graduation_year) errors.push('Год окончания обязателен для заполнения');
  if (!appData.education_document_number) errors.push('Номер документа об образовании обязателен для заполнения');
  if (!appData.education_document_date) errors.push('Дата выдачи документа об образовании обязательна для заполнения');
  if (!appData.funding_form) errors.push('Форма финансирования обязательна для заполнения');
  if (!appData.choices?.length) {
    errors.push('Необходимо выбрать хотя бы одну образовательную программу');
  } else if (appData.choices.some((c) => !c.profile_id)) {
    errors.push('Некорректно заполнены выбранные образовательные программы');
  }

  return errors.length > 0 ? errors.join('; ') : null;
}

function getRequiredFileKeys(appData) {
  const keys = SUBMIT_FILE_FIELDS.filter((f) => !f.optional).map((f) => f.key);
  if (appData.olympiad_participant) keys.push('olympiad_certificate');
  return keys;
}

async function assertNoActiveApplication(client, userId, academicYear) {
  const checkApp = await client.query(
    `SELECT id, status_id FROM applications
     WHERE user_id = $1 AND academic_year = $2 AND status_id IN (2, 3, 5)
     LIMIT 1`,
    [userId, academicYear]
  );
  if (checkApp.rows.length > 0) {
    const err = new Error('У вас уже есть активная заявка. Вы не можете подать новую заявку, пока текущая заявка находится на рассмотрении.');
    err.code = 'ACTIVE_APPLICATION_EXISTS';
    err.status = 409;
    err.applicationId = checkApp.rows[0].id;
    throw err;
  }
}

async function updateUserProfile(client, userId, appData) {
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
      appData.first_name, appData.last_name, appData.middle_name,
      appData.phone, appData.birth_date, appData.gender,
      appData.region_id, userId
    ]
  );
}

async function insertApplication(client, { userId, appData, statusId, academicYear }) {
  const insertResult = await client.query(
    `INSERT INTO applications (
      user_id, status_id, passport_series, passport_issue_date, passport_issued_by,
      education_level, education_institution, education_graduation_year,
      document_number, document_date, study_form, funding_form,
      accommodation_needed, olympiad_participant, parent_phone, academic_year,
      education_document_number, education_document_date, region_id, address,
      is_foreign_residence
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    RETURNING id`,
    [
      userId,
      statusId,
      appData.passport_series, appData.passport_issue_date, appData.passport_issued_by,
      appData.education_level, appData.education_institution, appData.education_graduation_year,
      appData.document_number || appData.education_document_number,
      appData.document_date || appData.education_document_date,
      appData.study_form || 'full-time', appData.funding_form,
      appData.accommodation_needed || false, appData.olympiad_participant || false,
      appData.parent_phone, academicYear,
      appData.education_document_number, appData.education_document_date,
      appData.region_id, appData.address,
      appData.is_foreign_residence || false
    ]
  );

  const applicationId = insertResult.rows[0].id;

  for (const choice of appData.choices) {
    await client.query(
      'INSERT INTO application_choices (application_id, profile_id, priority) VALUES ($1, $2, $3)',
      [applicationId, choice.profile_id, choice.priority]
    );
  }

  return applicationId;
}

async function createDraftApplication({ userId, appData }) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const academicYear = new Date().getFullYear();
    await assertNoActiveApplication(client, userId, academicYear);

    await client.query(
      'DELETE FROM applications WHERE user_id = $1 AND academic_year = $2 AND status_id = 1',
      [userId, academicYear]
    );

    await updateUserProfile(client, userId, appData);
    const applicationId = await insertApplication({
      client,
      userId,
      appData,
      statusId: 1,
      academicYear
    });

    await client.query('COMMIT');
    return { applicationId, academicYear };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getOwnedDraftApplication(applicationId, userId) {
  const result = await db.query(
    `SELECT id, user_id, status_id, olympiad_participant, academic_year
     FROM applications WHERE id = $1`,
    [applicationId]
  );
  const app = result.rows[0];
  if (!app) {
    const err = new Error('Заявление не найдено');
    err.status = 404;
    throw err;
  }
  if (app.user_id !== userId) {
    const err = new Error('Доступ запрещен');
    err.status = 403;
    throw err;
  }
  if (app.status_id !== 1) {
    const err = new Error('Заявление уже отправлено или недоступно для загрузки файлов');
    err.status = 409;
    err.code = 'NOT_DRAFT';
    throw err;
  }
  return app;
}

async function removeExistingFileForCategory(applicationId, fieldKey) {
  const existing = await db.query(
    `SELECT id, file_path FROM application_files
     WHERE application_id = $1 AND file_category = $2`,
    [applicationId, fieldKey]
  );

  for (const row of existing.rows) {
    await s3.deleteFromS3(s3.BUCKET_FILES, row.file_path).catch(() => {});
    await db.query('DELETE FROM application_files WHERE id = $1', [row.id]);
  }
}

async function uploadDraftFile({ applicationId, userId, fieldKey, file }) {
  const fieldConfig = SUBMIT_FILE_FIELDS.find((f) => f.key === fieldKey);
  if (!fieldConfig) {
    const err = new Error(`Неизвестный тип файла: ${fieldKey}`);
    err.status = 400;
    throw err;
  }

  if (!file?.buffer?.length) {
    const err = new Error('Файл пустой или не был получен сервером');
    err.status = 400;
    throw err;
  }

  if (file.size > MAX_APPLICATION_FILE_BYTES) {
    const err = new Error(`Файл превышает лимит ${MAX_APPLICATION_FILE_MB} МБ`);
    err.status = 413;
    err.code = 'PAYLOAD_TOO_LARGE';
    throw err;
  }

  const app = await getOwnedDraftApplication(applicationId, userId);

  if (fieldKey === 'olympiad_certificate') {
    if (!app.olympiad_participant) {
      const err = new Error('Сертификат олимпиады не требуется для этой заявки');
      err.status = 400;
      throw err;
    }

    const oldCerts = await db.query(
      'SELECT id, file_path FROM olympiad_certificates WHERE application_id = $1',
      [applicationId]
    );
    for (const row of oldCerts.rows) {
      await s3.deleteFromS3(s3.BUCKET_FILES, row.file_path).catch(() => {});
      await db.query('DELETE FROM olympiad_certificates WHERE id = $1', [row.id]);
    }

    const originalFileName = decodeUploadedFileName(file.originalname);
    const fileExt = getFileExtension(originalFileName);
    const s3Key = `${applicationId}/olympiad_${Date.now()}.${fileExt}`;

    await s3.uploadToS3(s3.BUCKET_FILES, s3Key, file.buffer, file.mimetype);
    await db.query('SELECT upload_olympiad_certificate($1, $2, $3, $4, $5, $6)', [
      applicationId,
      originalFileName,
      s3Key,
      file.size,
      file.mimetype,
      app.academic_year
    ]);

    return { field: fieldKey, size: file.size };
  }

  await removeExistingFileForCategory(applicationId, fieldKey);

  const originalFileName = decodeUploadedFileName(file.originalname);
  const fileExt = getFileExtension(originalFileName);
  const s3Key = `${applicationId}/${fieldKey}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

  await s3.uploadToS3(s3.BUCKET_FILES, s3Key, file.buffer, file.mimetype);
  await db.query(
    'SELECT upload_application_file($1, $2, $3, $4, $5, $6, $7)',
    [applicationId, s3Key, originalFileName, file.mimetype, file.size, fieldConfig.isImage, fieldKey]
  );

  return { field: fieldKey, size: file.size };
}

async function finalizeDraftApplication({ applicationId, userId }) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const appResult = await client.query(
      `SELECT id, user_id, status_id, olympiad_participant, first_name, last_name
       FROM applications WHERE id = $1 FOR UPDATE`,
      [applicationId]
    );
    const app = appResult.rows[0];
    if (!app || app.user_id !== userId) {
      const err = new Error('Заявление не найдено');
      err.status = 404;
      throw err;
    }
    if (app.status_id !== 1) {
      const err = new Error('Заявление уже отправлено');
      err.status = 409;
      err.code = 'ALREADY_SUBMITTED';
      throw err;
    }

    const filesResult = await client.query(
      `SELECT file_category FROM application_files WHERE application_id = $1`,
      [applicationId]
    );
    const uploaded = new Set(filesResult.rows.map((r) => r.file_category));

    const requiredKeys = SUBMIT_FILE_FIELDS.filter((f) => !f.optional).map((f) => f.key);
    if (app.olympiad_participant) requiredKeys.push('olympiad_certificate');

    const missing = [];
    for (const key of requiredKeys) {
      if (key === 'olympiad_certificate') {
        const cert = await client.query(
          'SELECT id FROM olympiad_certificates WHERE application_id = $1 LIMIT 1',
          [applicationId]
        );
        if (cert.rows.length === 0) missing.push(key);
      } else if (!uploaded.has(key)) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      const labels = missing.map((key) => SUBMIT_FILE_FIELDS.find((f) => f.key === key)?.label || key);
      const err = new Error(`Не загружены обязательные файлы: ${labels.join(', ')}`);
      err.status = 400;
      err.code = 'MISSING_FILES';
      throw err;
    }

    await client.query(
      `UPDATE applications SET status_id = 2, updated_at = NOW() WHERE id = $1`,
      [applicationId]
    );
    await client.query(
      `INSERT INTO application_history (application_id, status_id, comment, created_by)
       VALUES ($1, 2, 'Заявление подано', $2)`,
      [applicationId, userId]
    );

    await client.query('COMMIT');
    return { applicationId, applicantName: `${app.last_name || ''} ${app.first_name || ''}`.trim() };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  SUBMIT_FILE_FIELDS,
  validateApplicationMetadata,
  getRequiredFileKeys,
  createDraftApplication,
  uploadDraftFile,
  finalizeDraftApplication
};

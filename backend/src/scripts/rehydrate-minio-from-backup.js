require('dotenv').config();

const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const s3 = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

/**
 * Восстановление объектов в MinIO из локальной папки-бэкапа.
 *
 * Структура бэкапа (любой из вариантов):
 *   backup/application-files/{uuid}/{category}/{file}.pdf
 *   backup/{uuid}/{category}/{file}.pdf
 *
 * Запуск:
 *   node src/scripts/rehydrate-minio-from-backup.js /path/to/backup
 */
async function main() {
  const backupRoot = process.argv[2];
  if (!backupRoot) {
    console.error('Укажите путь к папке бэкапа:');
    console.error('  node src/scripts/rehydrate-minio-from-backup.js /path/to/backup');
    process.exit(1);
  }

  if (!fs.existsSync(backupRoot)) {
    console.error('Папка не найдена:', backupRoot);
    process.exit(1);
  }

  await s3.ensureBucketsReady();

  const [filesRes, certsRes, docsRes] = await Promise.all([
    db.query(`SELECT id, file_path FROM application_files WHERE file_path IS NOT NULL`),
    db.query(`SELECT id, file_path FROM olympiad_certificates WHERE file_path IS NOT NULL`),
    db.query(`SELECT id, file_path FROM documents WHERE file_path IS NOT NULL`)
  ]);

  const dbPaths = new Map();
  for (const row of [...filesRes.rows, ...certsRes.rows, ...docsRes.rows]) {
    dbPaths.set(row.file_path, row.id);
  }

  console.log(`Записей в БД с file_path: ${dbPaths.size}`);

  const backupFiles = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else backupFiles.push(full);
    }
  }

  walk(backupRoot);
  console.log(`Файлов в бэkaпе: ${backupFiles.length}`);

  let restored = 0;
  let skipped = 0;
  let notInDb = 0;

  for (const absPath of backupFiles) {
    const rel = path.relative(backupRoot, absPath).replace(/\\/g, '/');

    // Пробуем сопоставить с ключом в БД
    const candidates = [
      rel,
      rel.replace(/^application-files\//, ''),
      rel.replace(/^application_files\//, ''),
      rel.replace(/^application-documents\//, ''),
      rel.replace(/^application_documents\//, '')
    ];

    let s3Key = null;
    let bucket = s3.BUCKET_FILES;

    for (const candidate of candidates) {
      if (dbPaths.has(candidate)) {
        s3Key = candidate;
        break;
      }
    }

    if (!s3Key) {
      // Файл в бэкаpe, но нет в БД — всё равно загружаем в files bucket
      s3Key = candidates.find((c) => !c.includes('application-documents')) || rel;
      notInDb++;
    }

    if (rel.includes('application-documents') || rel.includes('application_documents')) {
      bucket = s3.BUCKET_DOCUMENTS;
    }

    const exists = await s3.objectExists({
      bucket,
      filePath: s3Key,
      bucketAlias: bucket === s3.BUCKET_DOCUMENTS ? 'application_documents' : 'application_files'
    });

    if (exists) {
      skipped++;
      continue;
    }

    const body = fs.readFileSync(absPath);
    const ext = path.extname(absPath).slice(1).toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp'
    };

    await s3.s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: body,
      ContentType: mimeTypes[ext] || 'application/octet-stream',
      ContentLength: body.length
    }));

    restored++;
    console.log(`+ ${bucket}/${s3Key} (${body.length} bytes)`);
  }

  console.log('\n=== Итог ===');
  console.log(`Восстановлено в MinIO: ${restored}`);
  console.log(`Уже были в MinIO: ${skipped}`);
  console.log(`Из бэкапа без записи в БД: ${notInDb}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

require('dotenv').config();

const db = require('../config/db');
const s3 = require('../config/s3');

async function auditTable({ table, idColumn, bucket, bucketAlias, label }) {
  const result = await db.query(
    `SELECT ${idColumn} AS id, application_id, file_path, file_name
     FROM ${table}
     WHERE file_path IS NOT NULL AND file_path <> ''
     ORDER BY application_id, ${idColumn}`
  );

  const missing = [];
  const present = [];

  for (const row of result.rows) {
    const exists = await s3.objectExists({
      bucket,
      filePath: row.file_path,
      bucketAlias
    });

    const item = {
      id: row.id,
      applicationId: row.application_id,
      filePath: row.file_path,
      fileName: row.file_name,
      type: label
    };

    if (exists) present.push(item);
    else missing.push(item);
  }

  return { total: result.rows.length, present, missing };
}

async function main() {
  console.log('Проверка файлов в хранилище...');
  console.log(`S3 endpoint: ${process.env.S3_ENDPOINT || 'http://minio:9000'}`);
  console.log(`Bucket files: ${s3.BUCKET_FILES}`);

  try {
    await s3.ensureBucketsReady();
  } catch (err) {
    console.error('MinIO/S3 недоступен:', err.message);
    process.exit(1);
  }

  const applicationFiles = await auditTable({
    table: 'application_files',
    idColumn: 'id',
    bucket: s3.BUCKET_FILES,
    bucketAlias: 'application_files',
    label: 'application_file'
  });

  const certificates = await auditTable({
    table: 'olympiad_certificates',
    idColumn: 'id',
    bucket: s3.BUCKET_FILES,
    bucketAlias: 'application_files',
    label: 'olympiad_certificate'
  });

  const documents = await auditTable({
    table: 'documents',
    idColumn: 'id',
    bucket: s3.BUCKET_DOCUMENTS,
    bucketAlias: 'application_documents',
    label: 'document'
  });

  const allMissing = [
    ...applicationFiles.missing,
    ...certificates.missing,
    ...documents.missing
  ];

  const affectedApplications = [...new Set(allMissing.map((item) => item.applicationId))];

  console.log('\n=== Итог ===');
  console.log(`application_files: ${applicationFiles.present.length} OK, ${applicationFiles.missing.length} отсутствуют`);
  console.log(`olympiad_certificates: ${certificates.present.length} OK, ${certificates.missing.length} отсутствуют`);
  console.log(`documents: ${documents.present.length} OK, ${documents.missing.length} отсутствуют`);
  console.log(`Заявок с пропавшими файлами: ${affectedApplications.length}`);

  if (allMissing.length === 0) {
    console.log('\nВсе файлы из БД найдены в хранилище.');
    process.exit(0);
  }

  console.log('\n=== Пропавшие файлы (нужна повторная загрузка) ===');
  for (const item of allMissing) {
    console.log(`- [${item.type}] app=${item.applicationId} id=${item.id} path=${item.filePath}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Ошибка аудита:', err);
  process.exit(1);
});

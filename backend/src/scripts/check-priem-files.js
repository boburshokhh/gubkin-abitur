#!/usr/bin/env node
/**
 * Проверка файлов на priem.gubkin.uz: MinIO + API.
 * Запуск: cd backend && node src/scripts/check-priem-files.js
 */
const {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command
} = require('@aws-sdk/client-s3');

const HOST = process.env.PRIEM_HOST || 'priem.gubkin.uz';
const MINIO_PORT = process.env.MINIO_PORT || '9005';
const API_BASE = process.env.API_BASE || `https://${HOST}/api`;

const S3_ENDPOINT = process.env.S3_ENDPOINT || `http://${HOST}:${MINIO_PORT}`;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'abitur-backend';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'change-this-minio-backend-secret';
const BUCKET = process.env.S3_BUCKET_FILES || 'application-files';

const SAMPLE_APP = '51b3eb72-e41e-484d-a09c-236494146a4b';
const FILES = [
  { kind: 'photo', key: `${SAMPLE_APP}/photo/1781872125633-585.png`, fileId: '2f3e878a-4ae9-4d76-98a5-3b2b455747a1' },
  { kind: 'pdf', key: `${SAMPLE_APP}/passport_scan/1781872124794-5.pdf`, fileId: 'ac0a60df-deda-4c64-aac6-8103d7c88189' },
  { kind: 'pdf', key: `${SAMPLE_APP}/education_scan/1781872126094-554.pdf`, fileId: 'b5070a87-20fa-41ce-bfd0-265445d21c39' },
  { kind: 'pdf-uppercase', key: '9efed3c0-fbbf-4352-8981-c4d4a4125b0c/passport_translation/1781872509638-412.PDF', fileId: null }
];

const client = new S3Client({
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  region: 'us-east-1',
  credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED'
});

async function readMagic(bucket, key) {
  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: 'bytes=0-7' }));
  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  return Buffer.concat(chunks).toString('latin1');
}

async function checkMinioFile({ kind, key }) {
  const row = { kind, key, minio: {} };
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    row.minio.exists = true;
    row.minio.size = head.ContentLength;
    row.minio.contentType = head.ContentType || '(none)';
    row.minio.magic = await readMagic(BUCKET, key);
    row.minio.valid = kind.includes('pdf')
      ? row.minio.magic.startsWith('%PDF')
      : row.minio.magic.startsWith('\x89PNG') || row.minio.magic.startsWith('\xFF\xD8');
  } catch (err) {
    row.minio.exists = false;
    row.minio.error = `${err.name}: ${err.message}`;
  }
  return row;
}

async function checkApiPath(apiPath, label) {
  const url = `${API_BASE}${apiPath}`;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const ct = res.headers.get('content-type') || '';
    const buf = await res.arrayBuffer();
    const magic = Buffer.from(buf.slice(0, 8)).toString('latin1');
    return {
      label,
      url,
      status: res.status,
      contentType: ct,
      bytes: buf.byteLength,
      magic: magic.slice(0, 8),
      isPdf: magic.startsWith('%PDF'),
      isPng: magic.startsWith('\x89PNG'),
      isJsonError: ct.includes('json') || magic.startsWith('{')
    };
  } catch (err) {
    return { label, url, error: err.message };
  }
}

async function main() {
  console.log('=== Проверка priem.gubkin.uz ===');
  console.log('MinIO:', S3_ENDPOINT);
  console.log('API:', API_BASE);
  console.log('Bucket:', BUCKET);
  console.log('');

  console.log('--- 1. MinIO: наличие и Content-Type ---');
  for (const file of FILES) {
    const r = await checkMinioFile(file);
    console.log(JSON.stringify(r, null, 2));
    console.log('');
  }

  console.log('--- 2. MinIO: список файлов заявки', SAMPLE_APP, '---');
  const listed = await client.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: `${SAMPLE_APP}/`
  }));
  for (const obj of listed.Contents || []) {
    console.log(`  ${obj.Key}  ${obj.Size} bytes`);
  }
  console.log('');

  console.log('--- 3. API (без авторизации — ожидаем 401, не 404) ---');
  const photo = FILES[0];
  const pdf = FILES[1];
  const apiChecks = [
    await checkApiPath(`/files/download/application_files/${photo.key}`, 'download photo path'),
    await checkApiPath(`/files/download/application_files/${pdf.key}`, 'download pdf path'),
    await checkApiPath(`/files/view/file/${photo.fileId}`, 'view photo by id'),
    await checkApiPath(`/files/view/file/${pdf.fileId}`, 'view pdf by id')
  ];
  for (const r of apiChecks) console.log(JSON.stringify(r, null, 2));

  console.log('');
  console.log('--- 4. Health ---');
  const health = await fetch(`https://${HOST}/health?storage=1`).then((r) => r.json()).catch((e) => ({ error: e.message }));
  console.log(JSON.stringify(health, null, 2));

  console.log('');
  console.log('=== Вывод ===');
  const pdfs = await Promise.all(FILES.filter((f) => f.kind.includes('pdf')).map(checkMinioFile));
  const photos = await checkMinioFile(FILES[0]);
  const pdfOk = pdfs.every((p) => p.minio.exists && p.minio.valid);
  const photoOk = photos.minio.exists && photos.minio.valid;

  if (pdfOk && photoOk) {
    console.log('MinIO: PDF и фото на месте, байты корректные (%PDF / PNG).');
    const pdfCt = pdfs.map((p) => p.minio.contentType);
    if (pdfCt.some((ct) => !String(ct).includes('pdf'))) {
      console.log('ПРИЧИНА: PDF в MinIO без Content-Type application/pdf ->', pdfCt.join(', '));
      console.log('Браузер не открывает blob без типа application/pdf. Нужен фикс backend+frontend.');
    } else {
      console.log('Content-Type PDF в MinIO корректный. Если не открывается — фикс blob type на фронте.');
    }
  } else {
    console.log('MinIO: есть проблемы — см. детали выше.');
  }

  const viewPdf = apiChecks.find((c) => c.label === 'view pdf by id');
  const viewPhoto = apiChecks.find((c) => c.label === 'view photo by id');
  if (viewPdf?.status === 404 && viewPhoto?.status === 401) {
    console.log('API: PDF id -> 404, фото -> 401. Проблема в БД/backend для PDF.');
  } else if (viewPdf?.status === 401 && viewPhoto?.status === 401) {
    console.log('API: оба требуют авторизацию (OK).');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { Pool } = require('pg');

const ENDPOINT = process.env.S3_ENDPOINT || 'http://priem.gubkin.uz:9005';
const DATABASE_URL = process.env.DATABASE_URL;
const BUCKET = process.env.S3_BUCKET_FILES || 'application-files';

const client = new S3Client({
  endpoint: ENDPOINT,
  forcePathStyle: true,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'abitur-backend',
    secretAccessKey: process.env.S3_SECRET_KEY || 'change-this-minio-backend-secret'
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED'
});

async function existsInS3(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!DATABASE_URL) {
    console.error('Set DATABASE_URL to production postgres connection string');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });
  const { rows } = await pool.query(`
    SELECT af.id, af.application_id, af.file_category, af.file_path, af.created_at
    FROM application_files af
    ORDER BY af.created_at DESC
    LIMIT 50
  `);

  let missing = 0;
  let present = 0;

  for (const row of rows) {
    const ok = await existsInS3(row.file_path);
    if (ok) present += 1;
    else {
      missing += 1;
      console.log('MISSING', row.application_id, row.file_category, row.file_path, row.created_at);
    }
  }

  console.log(`\nChecked ${rows.length} recent files: present=${present}, missing=${missing}`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });

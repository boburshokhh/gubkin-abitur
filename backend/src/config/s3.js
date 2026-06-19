const {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  forcePathStyle: true,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  // Совместимость со старыми S3-совместимыми хранилищами (MinIO до 2025)
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const BUCKET_DOCUMENTS = process.env.S3_BUCKET_DOCUMENTS || 'application-documents';
const BUCKET_FILES = process.env.S3_BUCKET_FILES || 'application-files';
const BUCKET_SITE_ASSETS = process.env.S3_BUCKET_SITE_ASSETS || 'site-assets';

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

async function initBuckets() {
  const buckets = [BUCKET_DOCUMENTS, BUCKET_FILES, BUCKET_SITE_ASSETS];
  for (const bucket of buckets) {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      console.log(`Bucket "${bucket}" уже существует.`);
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        try {
          await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
          console.log(`Bucket "${bucket}" успешно создан.`);
        } catch (createErr) {
          console.error(`Ошибка при создании бакета "${bucket}":`, createErr.message);
          // Не валим процесс — API должен подняться даже если MinIO временно недоступен
        }
      } else {
        console.error(`Ошибка проверки бакета "${bucket}":`, error.message);
      }
    }
  }
}

const bucketsReady = initBuckets();

async function ensureBucketsReady() {
  await bucketsReady;
}

async function verifyObjectExists(bucket, key) {
  await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
}

async function resolveObjectKey({ bucket, filePath, bucketAlias }) {
  const keyCandidates = getS3KeyCandidates(filePath, bucketAlias);
  let lastError = null;

  for (const key of keyCandidates) {
    try {
      await verifyObjectExists(bucket, key);
      return key;
    } catch (error) {
      lastError = error;
      const statusCode = error.$metadata?.httpStatusCode;
      if (error.name !== 'NotFound' && statusCode !== 404) throw error;
    }
  }

  throw lastError || new Error('Файл не найден');
}

async function objectExists({ bucket, filePath, bucketAlias }) {
  try {
    await resolveObjectKey({ bucket, filePath, bucketAlias });
    return true;
  } catch {
    return false;
  }
}

async function uploadToS3(bucket, key, buffer, mimeType) {
  if (!buffer?.length) {
    throw new Error('Пустой файл нельзя загрузить в хранилище');
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ContentLength: buffer.length,
  });

  await s3Client.send(command);
  await verifyObjectExists(bucket, key);

  return key;
}

async function deleteObjectWithCandidates(bucket, filePath, bucketAlias) {
  for (const key of getS3KeyCandidates(filePath, bucketAlias)) {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      return key;
    } catch (error) {
      const statusCode = error.$metadata?.httpStatusCode;
      if (error.name !== 'NotFound' && statusCode !== 404) throw error;
    }
  }

  return null;
}

async function getPresignedDownloadUrl(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

module.exports = {
  s3Client,
  BUCKET_DOCUMENTS,
  BUCKET_FILES,
  BUCKET_SITE_ASSETS,
  getS3KeyCandidates,
  ensureBucketsReady,
  resolveObjectKey,
  objectExists,
  uploadToS3,
  deleteObjectWithCandidates,
  getPresignedDownloadUrl,
};

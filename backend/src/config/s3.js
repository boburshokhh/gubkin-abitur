const {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  PutBucketVersioningCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

function normalizeBucketName(name, fallback) {
  const value = String(name || fallback || '').trim();
  if (!value) return fallback;
  if (value === 'application_files') return 'application-files';
  if (value === 'application_documents') return 'application-documents';
  return value;
}

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://minio:9000';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minioadmin';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'minioadmin';

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
  // Совместимость со старыми S3-совместимыми хранилищами (MinIO до 2025)
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const BUCKET_DOCUMENTS = normalizeBucketName(process.env.S3_BUCKET_DOCUMENTS, 'application-documents');
const BUCKET_FILES = normalizeBucketName(process.env.S3_BUCKET_FILES, 'application-files');
const BUCKET_SITE_ASSETS = process.env.S3_BUCKET_SITE_ASSETS || 'site-assets';

if (process.env.S3_BUCKET_FILES && process.env.S3_BUCKET_FILES !== BUCKET_FILES) {
  console.warn(`S3_BUCKET_FILES="${process.env.S3_BUCKET_FILES}" недопустим для MinIO, используем "${BUCKET_FILES}"`);
}

console.log(`S3 config: endpoint=${S3_ENDPOINT}, filesBucket=${BUCKET_FILES}, accessKey=${S3_ACCESS_KEY}`);

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

function uniqueBuckets(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function getFileBucketCandidates(primaryBucket = BUCKET_FILES) {
  return uniqueBuckets([
    primaryBucket,
    BUCKET_FILES,
    'application-files'
  ]);
}

function getDocumentBucketCandidates(primaryBucket = BUCKET_DOCUMENTS) {
  return uniqueBuckets([
    primaryBucket,
    BUCKET_DOCUMENTS,
    'application-documents'
  ]);
}

function isRetryableStorageError(error) {
  const statusCode = error?.$metadata?.httpStatusCode;
  return error?.name === 'NotFound'
    || statusCode === 404
    || error?.name === 'NoSuchKey'
    || error?.name === 'InvalidBucketName'
    || error?.name === 'UnknownError';
}

async function findObjectLocation({ buckets, filePath, bucketAlias }) {
  const keyCandidates = getS3KeyCandidates(filePath, bucketAlias);
  const tried = [];
  let lastError = null;

  for (const bucket of buckets) {
    for (const key of keyCandidates) {
      tried.push(`${bucket}/${key}`);
      try {
        await verifyObjectExists(bucket, key);
        return { bucket, key, tried };
      } catch (error) {
        lastError = error;
        if (!isRetryableStorageError(error)) throw error;
      }
    }
  }

  const error = lastError || new Error('Файл не найден');
  error.tried = tried;
  throw error;
}

async function enableBucketVersioning(bucket) {
  try {
    await s3Client.send(new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: { Status: 'Enabled' },
    }));
    console.log(`Versioning включён для бакета "${bucket}".`);
  } catch (error) {
    console.warn(`Не удалось включить versioning для "${bucket}":`, error.message);
  }
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
          throw createErr;
        }
      } else {
        console.error(`Ошибка проверки бакета "${bucket}":`, error.message);
        throw error;
      }
    }

    await enableBucketVersioning(bucket);
  }
}

const bucketsReady = initBuckets();

async function ensureBucketsReady() {
  await bucketsReady;
}

async function verifyObjectExists(bucket, key) {
  await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
}

async function resolveObjectKey({ bucket, filePath, bucketAlias, buckets }) {
  const location = await findObjectLocation({
    buckets: buckets || [bucket],
    filePath,
    bucketAlias
  });
  return location.key;
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

async function getPresignedDownloadUrl(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

async function deleteFromS3(bucket, key) {
  if (!bucket || !key) return;

  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    console.warn(`Не удалось удалить объект S3 ${bucket}/${key}:`, error.message);
  }
}

async function deleteManyFromS3(objects = []) {
  await Promise.all(objects.map(({ bucket, key }) => deleteFromS3(bucket, key)));
}

async function checkStorageHealth() {
  const result = {
    endpoint: S3_ENDPOINT,
    accessKey: S3_ACCESS_KEY,
    filesBucket: BUCKET_FILES,
    documentsBucket: BUCKET_DOCUMENTS,
    ok: false,
    buckets: [],
    sampleObject: null,
    error: null
  };

  try {
    const { ListBucketsCommand } = require('@aws-sdk/client-s3');
    const listed = await s3Client.send(new ListBucketsCommand({}));
    result.buckets = (listed.Buckets || []).map((b) => b.Name);

    const sampleKey = '51b3eb72-e41e-484d-a09c-236494146a4b/passport_scan/1781872124794-5.pdf';
    const location = await findObjectLocation({
      buckets: getFileBucketCandidates(),
      filePath: sampleKey,
      bucketAlias: 'application_files'
    });
    result.sampleObject = { key: location.key, bucket: location.bucket };
    result.ok = true;
  } catch (error) {
    result.error = error.message;
    result.errorCode = error.name;
    result.tried = error.tried;
  }

  return result;
}

module.exports = {
  s3Client,
  BUCKET_DOCUMENTS,
  BUCKET_FILES,
  BUCKET_SITE_ASSETS,
  S3_ENDPOINT,
  getS3KeyCandidates,
  getFileBucketCandidates,
  getDocumentBucketCandidates,
  findObjectLocation,
  checkStorageHealth,
  ensureBucketsReady,
  resolveObjectKey,
  uploadToS3,
  getPresignedDownloadUrl,
  deleteFromS3,
  deleteManyFromS3,
};

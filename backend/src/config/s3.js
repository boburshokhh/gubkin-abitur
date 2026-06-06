const { S3Client, CreateBucketCommand, HeadBucketCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
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
});

const BUCKET_DOCUMENTS = process.env.S3_BUCKET_DOCUMENTS || 'application-documents';
const BUCKET_FILES = process.env.S3_BUCKET_FILES || 'application-files';
const BUCKET_SITE_ASSETS = process.env.S3_BUCKET_SITE_ASSETS || 'site-assets';

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
        }
      } else {
        console.error(`Ошибка проверки бакета "${bucket}":`, error.message);
      }
    }
  }
}

// Запуск инициализации при загрузке
initBuckets().catch(err => console.error('Ошибка инициализации бакетов MinIO:', err));

async function uploadToS3(bucket, key, buffer, mimeType) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });
  await s3Client.send(command);
  return key;
}

async function getPresignedDownloadUrl(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  // Срок действия ссылки 1 час (3600 секунд)
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

module.exports = {
  s3Client,
  BUCKET_DOCUMENTS,
  BUCKET_FILES,
  BUCKET_SITE_ASSETS,
  uploadToS3,
  getPresignedDownloadUrl
};

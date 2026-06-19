#!/usr/bin/env node
const {
  S3Client,
  ListBucketsCommand,
  HeadObjectCommand,
  ListObjectsV2Command
} = require('@aws-sdk/client-s3');

const ENDPOINT = process.env.S3_ENDPOINT || 'http://priem.gubkin.uz:9005';
const TEST_PATHS = [
  '51b3eb72-e41e-484d-a09c-236494146a4b/passport_scan/1781872124794-5.pdf',
  '9efed3c0-fbbf-4352-8981-c4d4a4125b0c/passport_scan/1781872509490-430.pdf',
  'application_files/51b3eb72-e41e-484d-a09c-236494146a4b/passport_scan/1781872124794-5.pdf'
];
const BUCKETS = ['application-files', 'application_files', 'application-documents', 'application_documents'];

const CREDENTIAL_SETS = [
  {
    name: 'abitur-backend (example default)',
    accessKeyId: process.env.S3_ACCESS_KEY || 'abitur-backend',
    secretAccessKey: process.env.S3_SECRET_KEY || 'change-this-minio-backend-secret'
  },
  {
    name: 'minioadmin (example default)',
    accessKeyId: process.env.MINIO_ROOT_USER || 'minioadmin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'minioadminpassword'
  }
];

function makeClient(creds) {
  return new S3Client({
    endpoint: ENDPOINT,
    forcePathStyle: true,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: creds,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
  });
}

async function probeCredentials({ name, accessKeyId, secretAccessKey }) {
  const client = makeClient({ accessKeyId, secretAccessKey });
  console.log(`\n=== Credentials: ${name} (${accessKeyId}) ===`);

  try {
    const buckets = await client.send(new ListBucketsCommand({}));
    console.log('Buckets:', buckets.Buckets?.map((b) => b.Name).join(', ') || '(none)');
  } catch (err) {
    console.log('ListBuckets FAILED:', err.name, err.message);
    return false;
  }

  for (const bucket of BUCKETS) {
    try {
      const listed = await client.send(new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 5
      }));
      console.log(`Bucket "${bucket}": ${listed.KeyCount ?? listed.Contents?.length ?? 0} objects (sample)`);
      for (const obj of listed.Contents || []) {
        console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
      }
    } catch (err) {
      console.log(`Bucket "${bucket}":`, err.name, err.message);
    }
  }

  for (const bucket of ['application-files', 'application_files']) {
    for (const key of TEST_PATHS) {
      try {
        const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        console.log(`FOUND ${bucket}/${key} size=${head.ContentLength}`);
      } catch (err) {
        console.log(`MISSING ${bucket}/${key}: ${err.name}`);
      }
    }
  }

  return true;
}

async function main() {
  console.log('MinIO endpoint:', ENDPOINT);

  for (const creds of CREDENTIAL_SETS) {
    await probeCredentials(creds);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

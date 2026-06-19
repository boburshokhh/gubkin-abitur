const db = require('../config/db');
const s3 = require('../config/s3');

async function checkStoredFile({ filePath, buckets, bucketAlias }) {
  try {
    const location = await s3.findObjectLocation({ buckets, filePath, bucketAlias });
    return { exists: true, bucket: location.bucket, key: location.key };
  } catch (err) {
    return { exists: false, error: err.message, tried: err.tried || [] };
  }
}

async function verifyApplicationStorage(applicationId) {
  const [filesResult, documentsResult, certificatesResult] = await Promise.all([
    db.query(
      `SELECT id, file_category, file_name, file_path, file_size
       FROM application_files WHERE application_id = $1 ORDER BY created_at`,
      [applicationId]
    ),
    db.query(
      `SELECT id, file_name, file_path, file_size
       FROM documents WHERE application_id = $1 ORDER BY created_at`,
      [applicationId]
    ),
    db.query(
      `SELECT id, name AS file_name, file_path, file_size
       FROM olympiad_certificates WHERE application_id = $1 ORDER BY created_at`,
      [applicationId]
    )
  ]);

  const fileBuckets = s3.getFileBucketCandidates();
  const documentBuckets = s3.getDocumentBucketCandidates();

  const applicationFiles = [];
  for (const row of filesResult.rows) {
    const check = await checkStoredFile({
      filePath: row.file_path,
      buckets: fileBuckets,
      bucketAlias: 'application_files'
    });
    applicationFiles.push({
      id: row.id,
      category: row.file_category,
      file_name: row.file_name,
      file_path: row.file_path,
      file_size: row.file_size,
      ...check
    });
  }

  const documents = [];
  for (const row of documentsResult.rows) {
    const check = await checkStoredFile({
      filePath: row.file_path,
      buckets: documentBuckets,
      bucketAlias: 'application_documents'
    });
    documents.push({
      id: row.id,
      file_name: row.file_name,
      file_path: row.file_path,
      file_size: row.file_size,
      ...check
    });
  }

  const olympiadCertificates = [];
  for (const row of certificatesResult.rows) {
    const check = await checkStoredFile({
      filePath: row.file_path,
      buckets: fileBuckets,
      bucketAlias: 'application_files'
    });
    olympiadCertificates.push({
      id: row.id,
      file_name: row.file_name,
      file_path: row.file_path,
      file_size: row.file_size,
      ...check
    });
  }

  const allItems = [...applicationFiles, ...documents, ...olympiadCertificates];
  const missing = allItems.filter((item) => !item.exists);

  return {
    application_id: applicationId,
    total: allItems.length,
    present: allItems.length - missing.length,
    missing: missing.length,
    buckets_checked: {
      files: fileBuckets,
      documents: documentBuckets
    },
    application_files: applicationFiles,
    documents,
    olympiad_certificates: olympiadCertificates
  };
}

module.exports = {
  verifyApplicationStorage
};

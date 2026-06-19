#!/bin/sh
set -eu

MINIO_ROOT_USER="${MINIO_ROOT_USER:-minioadmin}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-minioadminpassword}"
S3_BUCKET_DOCUMENTS="${S3_BUCKET_DOCUMENTS:-application-documents}"
S3_BUCKET_FILES="${S3_BUCKET_FILES:-application-files}"
S3_BUCKET_SITE_ASSETS="${S3_BUCKET_SITE_ASSETS:-site-assets}"
S3_BACKEND_ACCESS_KEY="${S3_BACKEND_ACCESS_KEY:-abitur-backend}"
S3_BACKEND_SECRET_KEY="${S3_BACKEND_SECRET_KEY:-change-this-minio-backend-secret}"

echo "Waiting for MinIO..."
until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1; do
  sleep 2
done

echo "Configuring buckets and versioning..."
for bucket in "$S3_BUCKET_DOCUMENTS" "$S3_BUCKET_FILES" "$S3_BUCKET_SITE_ASSETS"; do
  mc mb "local/$bucket" --ignore-existing
  mc version enable "local/$bucket"
done

POLICY_FILE="/tmp/backend-no-delete-policy.json"
cat > "$POLICY_FILE" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$S3_BUCKET_DOCUMENTS",
        "arn:aws:s3:::$S3_BUCKET_FILES",
        "arn:aws:s3:::$S3_BUCKET_SITE_ASSETS"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": [
        "arn:aws:s3:::$S3_BUCKET_DOCUMENTS/*",
        "arn:aws:s3:::$S3_BUCKET_FILES/*",
        "arn:aws:s3:::$S3_BUCKET_SITE_ASSETS/*"
      ]
    }
  ]
}
EOF

echo "Creating backend policy without delete permissions..."
mc admin policy create local backend-no-delete "$POLICY_FILE" 2>/dev/null \
  || mc admin policy update local backend-no-delete "$POLICY_FILE"

echo "Creating backend service account..."
mc admin user add local "$S3_BACKEND_ACCESS_KEY" "$S3_BACKEND_SECRET_KEY" 2>/dev/null \
  || mc admin user enable local "$S3_BACKEND_ACCESS_KEY"

mc admin policy attach local backend-no-delete --user "$S3_BACKEND_ACCESS_KEY"

echo "MinIO init complete."
echo "Set S3_ACCESS_KEY=$S3_BACKEND_ACCESS_KEY and matching S3_SECRET_KEY for the backend."

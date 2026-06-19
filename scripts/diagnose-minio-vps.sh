#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/gubkin-abitur}"
cd "$PROJECT_DIR"

echo "=== Backend S3 env ==="
docker compose exec -T backend printenv | grep -E '^S3_|^MINIO_' | sort

echo
echo "=== Backend storage health (from inside container) ==="
docker compose exec -T backend wget -qO- 'http://127.0.0.1:3000/health?storage=1' || true

echo
echo "=== MinIO buckets (from minio container) ==="
docker compose exec -T minio sh -c 'mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null && mc ls local'

echo
echo "=== Sample application files in MinIO ==="
docker compose exec -T minio sh -c 'mc alias set local http://127.0.0.1:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null && mc ls local/application-files/51b3eb72-e41e-484d-a09c-236494146a4b/ || true'

echo
echo "=== Recent backend file access logs ==="
docker compose logs --tail=40 backend | grep -E 'files/view|Ошибка просмотра|Файл заявления сохранён|S3 config' || true

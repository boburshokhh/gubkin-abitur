#!/usr/bin/env bash
# Поиск и восстановление файлов MinIO на сервере.
# Запуск: bash scripts/recover-minio.sh
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/gubkin-abitur}"
VOLUME_NAME="${VOLUME_NAME:-gubkin-abitur_minio_data}"
BACKUP_TAR="${1:-}"

cd "$PROJECT_DIR"

echo "=========================================="
echo "  ВОССТАНОВЛЕНИЕ ФАЙЛОВ MinIO — диагностика"
echo "=========================================="
echo ""

echo "=== 1. Docker volumes (ищем старые/осиротевшие) ==="
docker volume ls | grep -iE 'minio|abitur' || true
echo ""

echo "=== 2. Файлы НА ДИСКЕ volume (обход API MinIO) ==="
echo "Если здесь есть файлы — данные НЕ потеряны, проблема в credentials/бакетах."
docker run --rm -v "${VOLUME_NAME}:/data:ro" alpine sh -c '
  echo "Размер volume:"
  du -sh /data 2>/dev/null || echo "volume не найден"
  echo ""
  echo "Структура /data:"
  ls -la /data 2>/dev/null || true
  echo ""
  echo "Файлы (первые 50):"
  find /data -type f 2>/dev/null | head -50
  echo ""
  echo "Всего файлов:"
  find /data -type f 2>/dev/null | wc -l
'
echo ""

echo "=== 3. Содержимое бакетов через MinIO API ==="
docker compose exec -T minio mc ls local/ 2>/dev/null || echo "mc ls local/ — ошибка (проверьте credentials)"
docker compose exec -T minio mc ls local/application-files --recursive 2>/dev/null | head -20 || true
echo ""

echo "=== 4. Credentials в .env ==="
grep -E '^(MINIO_ROOT_USER|MINIO_ROOT_PASSWORD|S3_ACCESS_KEY|S3_SECRET_KEY|S3_BUCKET)=' .env 2>/dev/null || echo ".env не найден"
echo ""

echo "=== 5. Остановленные контейнеры MinIO (старые данные?) ==="
docker ps -a --filter name=minio --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
echo ""

echo "=== 6. Снапшоты/бэкапы на хосте ==="
for path in \
  "/var/backups" \
  "/backup" \
  "/opt/backups" \
  "/root/backups" \
  "/var/lib/docker/volumes/${VOLUME_NAME}/_data"
do
  if [ -d "$path" ]; then
    echo "--- $path ---"
    ls -lah "$path" 2>/dev/null | head -10
  fi
done
echo ""

echo "=== 7. Proxmox / snapshot hints ==="
echo "Если VPS на Proxmox — проверьте снапшот VM ДО 19.06.2026 в панели хостинга."
echo ""

if [ -n "$BACKUP_TAR" ] && [ -f "$BACKUP_TAR" ]; then
  echo "=== 8. ВОССТАНОВЛЕНИЕ из архива: $BACKUP_TAR ==="
  read -r -p "ОСТОРОЖНО: это перезапишет текущий volume. Продолжить? [yes/NO] " confirm
  if [ "$confirm" = "yes" ]; then
    docker compose stop minio backend frontend
    docker run --rm \
      -v "${VOLUME_NAME}:/data" \
      -v "$(dirname "$BACKUP_TAR"):/backup:ro" \
      alpine sh -c "rm -rf /data/* /data/.[!.]* 2>/dev/null; tar -xzf /backup/$(basename "$BACKUP_TAR") -C /data"
    docker compose up -d
    echo "Volume восстановлен из архива. Проверьте: docker compose exec minio mc ls local/application-files --recursive | head"
  else
    echo "Отменено."
  fi
else
  echo "=== 8. Восстановление из архива ==="
  echo "Если найдёте бэкап minio_data (.tar.gz), запустите:"
  echo "  bash scripts/recover-minio.sh /path/to/minio_data_backup.tar.gz"
fi

echo ""
echo "=== 9. Аудит БД vs MinIO ==="
docker compose exec -T backend npm run audit:files 2>/dev/null || echo "Запустите после: docker compose up -d --build backend"
echo ""
echo "Готово."

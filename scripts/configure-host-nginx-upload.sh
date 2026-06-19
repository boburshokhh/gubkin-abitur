#!/usr/bin/env bash
# Настраивает ВНЕШНИЙ nginx на VPS (SSL перед Docker).
# Docker-nginx внутри frontend-контейнера — отдельно, пересобирается через docker compose build frontend.
#
# Использование на сервере:
#   sudo bash scripts/configure-host-nginx-upload.sh
#   sudo NGINX_DOMAIN=priem.gubkin.uz NGINX_BODY_SIZE=420M bash scripts/configure-host-nginx-upload.sh

set -Eeuo pipefail

DOMAIN="${NGINX_DOMAIN:-priem.gubkin.uz}"
BODY_SIZE="${NGINX_BODY_SIZE:-420M}"
SNIPPET_NAME="abitur-large-upload.conf"
SNIPPET_PATH="/etc/nginx/snippets/${SNIPPET_NAME}"

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: запустите с sudo"
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "ERROR: nginx не установлен на хосте"
  exit 1
fi

mkdir -p /etc/nginx/snippets

cat > "$SNIPPET_PATH" <<EOF
# Сгенерировано gubkin-abitur — лимиты для подачи заявлений с файлами
client_max_body_size ${BODY_SIZE};
client_body_timeout 900s;
proxy_read_timeout 900s;
proxy_send_timeout 900s;
EOF

echo "==> Snippet: ${SNIPPET_PATH}"

found=0
for config in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
  [ -f "$config" ] || continue
  grep -qE "server_name\s+.*${DOMAIN}" "$config" || continue

  found=1
  echo "==> Патчим: ${config}"

  if grep -q 'client_max_body_size' "$config"; then
    sed -i -E "s/client_max_body_size[[:space:]]+[^;]+;/client_max_body_size ${BODY_SIZE};/g" "$config"
  elif ! grep -q "${SNIPPET_NAME}" "$config"; then
    sed -i -E "/server_name[[:space:]]+.*${DOMAIN}/a\\    include snippets/${SNIPPET_NAME};" "$config"
  fi

  if ! grep -q "${SNIPPET_NAME}" "$config"; then
    echo "WARN: include snippets/${SNIPPET_NAME} не найден в ${config}"
  fi
done

if [ "$found" -eq 0 ]; then
  echo "ERROR: не найден server block с server_name ${DOMAIN}"
  echo "Добавьте вручную в server { ... }:"
  echo "    include snippets/${SNIPPET_NAME};"
  echo "Или скопируйте scripts/nginx-vps-reverse-proxy.example.conf"
  exit 1
fi

echo "==> Проверка конфигурации nginx"
nginx -t

echo "==> Перезагрузка nginx"
systemctl reload nginx

echo "OK: внешний nginx — client_max_body_size=${BODY_SIZE} для ${DOMAIN}"
echo "Проверка: curl -sI https://${DOMAIN}/ | head -5"

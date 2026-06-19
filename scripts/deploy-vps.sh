#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/gubkin-abitur}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICES="${SERVICES:-backend frontend}"

cd "$PROJECT_DIR"

echo "==> Fetching latest code"
git fetch --all --prune
git pull --ff-only

export GIT_SHA
GIT_SHA="$(git rev-parse --short=12 HEAD)"

export APP_VERSION
APP_VERSION="${APP_VERSION:-$GIT_SHA}"

export BUILD_DATE
BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "==> Deploying version=$APP_VERSION gitSha=$GIT_SHA buildDate=$BUILD_DATE"

echo "==> Applying database migrations"
if [ -f init-db/06-is-foreign-residence.sql ]; then
  docker compose -f "$COMPOSE_FILE" exec -T db \
    psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-abitur}" -v ON_ERROR_STOP=1 \
    < init-db/06-is-foreign-residence.sql
fi

echo "==> Building images"
docker compose -f "$COMPOSE_FILE" build --pull $SERVICES

echo "==> Recreating containers"
docker compose -f "$COMPOSE_FILE" up -d --force-recreate --remove-orphans $SERVICES

echo "==> Waiting for backend health"
for attempt in $(seq 1 30); do
  if docker compose -f "$COMPOSE_FILE" exec -T backend wget -qO- http://localhost:3000/health >/tmp/abitur-backend-health.json 2>/dev/null; then
    echo "Backend health:"
    cat /tmp/abitur-backend-health.json
    echo
    break
  fi

  if [ "$attempt" -eq 30 ]; then
    echo "Backend did not become healthy"
    docker compose -f "$COMPOSE_FILE" ps
    docker compose -f "$COMPOSE_FILE" logs --tail=200 backend
    exit 1
  fi

  sleep 2
done

echo "==> Current containers"
docker compose -f "$COMPOSE_FILE" ps

echo "==> Recent backend logs"
docker compose -f "$COMPOSE_FILE" logs --tail=80 backend

echo "==> Done"

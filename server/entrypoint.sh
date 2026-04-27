#!/bin/sh
set -e

# Replicate the muchobien/pocketbase entrypoint behavior:
# 1. Auto-create superuser if credentials are provided
# 2. Run pocketbase serve with all standard dirs + migrations dir

if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  echo "Ensuring superuser exists..."
  pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" \
    --dir=/pb_data 2>/dev/null || true
fi

exec pocketbase serve \
  --http=0.0.0.0:8090 \
  --dir=/pb_data \
  --publicDir=/pb_public \
  --hooksDir=/pb_hooks \
  --migrationsDir=/pb_migrations \
  "$@"

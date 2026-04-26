#!/bin/bash
set -euo pipefail

# Bible Notes App - Backup Script
# Usage: ./scripts/backup.sh
# Add to cron: 0 3 * * * /path/to/bible-notes/scripts/backup.sh

BACKUP_DIR="./backups"
PB_DIR="./server"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/bible-notes-${TIMESTAMP}.zip"

echo "💾 Bible Notes App - Backup"
echo "=========================="

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if PocketBase is running
if ! curl -s http://localhost:8090/api/health > /dev/null 2>&1; then
  echo "⚠️  PocketBase is not running. Starting it temporarily..."
  (cd "$PB_DIR" && ./pocketbase serve --http=0.0.0.0:8090 &)
  PB_PID=$!
  sleep 3
  STARTED_PB=true
else
  STARTED_PB=false
fi

# Create backup using PocketBase CLI
echo "📦 Creating backup..."
if [ -f "$PB_DIR/pocketbase" ]; then
  (cd "$PB_DIR" && ./pocketbase backup --dest "$BACKUP_FILE" 2>/dev/null) || {
    # Fallback: manually copy the data directory
    echo "  CLI backup failed, falling back to file copy..."
    TEMP_DIR=$(mktemp -d)
    cp -r "$PB_DIR/pb_data" "$TEMP_DIR/"
    (cd "$TEMP_DIR" && zip -r "$BACKUP_FILE" pb_data/)
    rm -rf "$TEMP_DIR"
  }
else
  # Docker environment: use the API
  echo "  Using PocketBase API for backup..."
  PB_URL="${POCKETBASE_URL:-http://localhost:8090}"
  PB_ADMIN_EMAIL="${POCKETBASE_ADMIN_EMAIL:-admin@example.com}"
  PB_ADMIN_PASSWORD="${POCKETBASE_ADMIN_PASSWORD:-changeme}"

  # Authenticate
  TOKEN=$(curl -s -X POST "$PB_URL/api/admins/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"$PB_ADMIN_EMAIL\",\"password\":\"$PB_ADMIN_PASSWORD\"}" | jq -r '.token')

  if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Failed to authenticate with PocketBase"
    exit 1
  fi

  # Trigger backup via API
  curl -s -X POST "$PB_URL/api/backups" \
    -H "Authorization: Bearer $TOKEN" \
    -o "$BACKUP_FILE"
fi

echo "✅ Backup created: $BACKUP_FILE"
echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Rotation: keep daily for 7 days, weekly for 8 weeks, monthly for 12 months
echo ""
echo "🗑️  Rotating old backups..."

# Delete backups older than 7 days (except weekly/monthly)
find "$BACKUP_DIR" -name "bible-notes-*.zip" -mtime +7 -not -name "*_01_*" -not -name "*_01_0*" | xargs -r rm -v 2>/dev/null || true

# Delete weekly backups older than 8 weeks (except monthly)
find "$BACKUP_DIR" -name "bible-notes-*_01_*.zip" -mtime +56 -not -name "*_01_01_*" | xargs -r rm -v 2>/dev/null || true

# Delete monthly backups older than 12 months
find "$BACKUP_DIR" -name "bible-notes-*_01_01_*.zip" -mtime +365 | xargs -r rm -v 2>/dev/null || true

echo "✅ Rotation complete"

# Stop PocketBase if we started it
if [ "$STARTED_PB" = true ]; then
  echo "🛑 Stopping temporarily started PocketBase..."
  kill "$PB_PID" 2>/dev/null || true
fi

echo ""
echo "📊 Backup summary:"
echo "   File: $BACKUP_FILE"
echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "   Total backups: $(ls -1 "$BACKUP_DIR"/bible-notes-*.zip 2>/dev/null | wc -l)"
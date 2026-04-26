#!/bin/bash
set -euo pipefail

# Bible Notes App - Restore Script
# Usage: ./scripts/restore.sh <backup-file>
# Example: ./scripts/restore.sh backups/bible-notes-20260425_030000.zip

BACKUP_DIR="./backups"
PB_DIR="./server"

echo "♻️  Bible Notes App - Restore"
echo "============================="

if [ -z "${1:-}" ]; then
  echo "❌ Please specify a backup file"
  echo "   Usage: ./scripts/restore.sh <backup-file>"
  echo ""
  echo "Available backups:"
  ls -1t "$BACKUP_DIR"/bible-notes-*.zip 2>/dev/null || echo "   No backups found"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will replace all current data with the backup data!"
echo "   Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

# Step 1: Stop PocketBase
echo ""
echo "🛑 Stopping PocketBase..."
if [ -f "$PB_DIR/pocketbase.pid" ]; then
  PB_PID=$(cat "$PB_DIR/pocketbase.pid")
  kill "$PB_PID" 2>/dev/null || true
  rm -f "$PB_DIR/pocketbase.pid"
elif pgrep -f "pocketbase serve" > /dev/null; then
  pkill -f "pocketbase serve" || true
fi
sleep 2

# Step 2: Backup current data (just in case)
CURRENT_BACKUP="${BACKUP_DIR}/pre-restore-$(date +%Y%m%d_%H%M%S).zip"
echo "📦 Creating safety backup of current data..."
if [ -d "$PB_DIR/pb_data" ]; then
  TEMP_DIR=$(mktemp -d)
  cp -r "$PB_DIR/pb_data" "$TEMP_DIR/"
  (cd "$TEMP_DIR" && zip -r "$CURRENT_BACKUP" pb_data/)
  rm -rf "$TEMP_DIR"
  echo "   Safety backup: $CURRENT_BACKUP"
fi

# Step 3: Restore from backup
echo "📂 Restoring from backup..."
if [ -d "$PB_DIR/pb_data" ]; then
  rm -rf "$PB_DIR/pb_data"
fi

TEMP_DIR=$(mktemp -d)
unzip -o "$BACKUP_FILE" -d "$TEMP_DIR"

if [ -d "$TEMP_DIR/pb_data" ]; then
  cp -r "$TEMP_DIR/pb_data" "$PB_DIR/"
else
  echo "❌ Backup file does not contain pb_data directory"
  echo "   Restoring from safety backup..."
  if [ -f "$CURRENT_BACKUP" ]; then
    unzip -o "$CURRENT_BACKUP" -d "$TEMP_DIR"
    cp -r "$TEMP_DIR/pb_data" "$PB_DIR/"
  fi
  rm -rf "$TEMP_DIR"
  exit 1
fi

rm -rf "$TEMP_DIR"

# Step 4: Start PocketBase
echo "🚀 Starting PocketBase..."
(cd "$PB_DIR" && ./pocketbase serve --http=0.0.0.0:8090 &)
PB_PID=$!
echo "$PB_PID" > "$PB_DIR/pocketbase.pid"
sleep 3

# Step 5: Verify
echo ""
echo "🔍 Verifying restore..."
if curl -s http://localhost:8090/api/health > /dev/null; then
  echo "✅ PocketBase is running and healthy"
else
  echo "❌ PocketBase failed to start. Check logs for errors."
  exit 1
fi

echo ""
echo "✅ Restore complete!"
echo "   Restored from: $BACKUP_FILE"
echo "   Safety backup: $CURRENT_BACKUP"
echo "   PocketBase PID: $PB_PID"
echo ""
echo "Open http://localhost:8090/_/ to verify the data."
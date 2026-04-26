#!/bin/bash
set -uo pipefail

# Bible Notes App - Development Setup Script
# Run this once after cloning the repository

echo "🛠️  Bible Notes App - Development Setup"
echo "========================================"

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install v24+ from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required. Install with: npm install -g pnpm"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
  echo "⚠️  Node.js v24+ is recommended (current: $(node -v))"
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🏗️  Building shared packages..."
pnpm --filter @bible-notes/shared build
pnpm --filter @bible-notes/pocketbase-client build

echo ""
echo "🗄️  Setting up PocketBase..."
PB_DIR="server"
PB_VERSION="0.37.2"

# Download PocketBase if not present
if [ ! -f "$PB_DIR/pocketbase" ]; then
  echo "  Downloading PocketBase v$PB_VERSION..."
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)
  if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
  elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    ARCH="arm64"
  fi

  DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
  TMP_ZIP=$(mktemp)
  curl -sL "$DOWNLOAD_URL" -o "$TMP_ZIP"
  unzip -o "$TMP_ZIP" -d "$PB_DIR"
  rm "$TMP_ZIP"
  chmod +x "$PB_DIR/pocketbase"
  echo "  ✅ PocketBase downloaded"
else
  echo "  ✅ PocketBase already exists"
fi

echo ""
echo "🚀 Starting PocketBase..."
# Stop any existing PocketBase process
pkill -f "pocketbase serve" 2>/dev/null || true
sleep 1

cd "$PB_DIR" && ./pocketbase serve --http=0.0.0.0:8090 >/dev/null 2>&1 &
PB_PID=$!
cd -
sleep 2

# Verify PocketBase started
if kill -0 "$PB_PID" 2>/dev/null; then
  echo "  ✅ PocketBase running on http://localhost:8090 (PID: $PB_PID)"
  echo "  📋 Admin UI: http://localhost:8090/_/"
else
  echo "  ❌ PocketBase failed to start. Check the logs."
  exit 1
fi

echo ""
echo "⏳ Waiting for PocketBase to be ready..."
for i in $(seq 1 10); do
  if curl -s http://localhost:8090/api/health >/dev/null 2>&1; then
    echo "  ✅ PocketBase is ready"
    break
  fi
  sleep 1
done

echo ""
echo "📝 Creating .env file if it doesn't exist..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ✅ .env created from .env.example"
  echo "  ⚠️  Update .env with your PocketBase admin credentials"
else
  echo "  ✅ .env already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:8090/_/ to create your PocketBase admin account"
echo "  2. The migration will auto-run when PocketBase starts"
echo "  3. Start the web app: pnpm --filter @bible-notes/web dev"
echo "  4. Open http://localhost:3000"
echo ""
echo "To stop PocketBase: kill $PB_PID"
#!/usr/bin/env bash

# Verify that Docker base image cache will be saved for future runs
# This script checks if the cached tar file exists and provides diagnostics
# to ensure the cache system is working correctly.
#
# Usage: ./verify-cache.sh <tar-file-path> <dockerfile-hash>
#   tar-file-path: Path to the cached tar file (default: /tmp/playwright-image.tar)
#   dockerfile-hash: Hash of the Dockerfile for cache key computation
#
# Environment variables used:
#   GITHUB_SHA: For display purposes

set -euo pipefail

# Configuration
TAR_FILE="${1:-/tmp/playwright-image.tar}"
DOCKERFILE_HASH="${2:-}"

echo "=== FINAL CACHE VERIFICATION ==="
echo "Checking if tar file exists for cache save..."

if [ -f "$TAR_FILE" ]; then
  # Get file size (cross-platform compatible)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    TAR_SIZE=$(stat -f%z "$TAR_FILE")
  else
    TAR_SIZE=$(stat -c%s "$TAR_FILE")
  fi

  TAR_SIZE_MB=$((TAR_SIZE / 1024 / 1024))

  echo "✅ Tar file exists: ${TAR_SIZE_MB}MB"
  echo "📤 Cache will be saved by actions/cache@v4 (automatic post-job)"

  if [ -n "$DOCKERFILE_HASH" ]; then
    echo "   Cache key: playwright-base-image-v1.56.1-noble-${DOCKERFILE_HASH}"
  fi

  echo "   Next run should restore this cache"
  exit 0
else
  echo "❌ WARNING: Tar file missing!"
  echo "   Cache will NOT be saved"
  echo "   Next run will pull base image again (786MB download)"
  exit 1
fi

echo "================================"
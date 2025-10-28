#!/usr/bin/env bash

# Load or pull Playwright base image with cache support
# This script handles loading a cached Docker image or pulling it fresh,
# tracking timing metrics and cache status for diagnostics.
#
# Usage: ./load-playwright-image.sh <tar-file-path> <image-name>
#   tar-file-path: Path to cached tar file (default: /tmp/playwright-image.tar)
#   image-name: Docker image to pull if cache miss (default: mcr.microsoft.com/playwright:v1.56.1-noble)
#
# Environment variables set (exported to GITHUB_ENV if available):
#   CACHE_SOURCE: restored | pulled_and_saved | pulled_save_failed
#   DOCKER_LOAD_DURATION: Time taken in seconds
#   TAR_FILE_SIZE_MB: Size of tar file in MB (0 if not exists)

set -euo pipefail

# Configuration
TAR_FILE="${1:-/tmp/playwright-image.tar}"
IMAGE_NAME="${2:-mcr.microsoft.com/playwright:v1.56.1-noble}"

echo "📦 Loading or pulling Playwright base image..."
echo "   Tar file: ${TAR_FILE}"
echo "   Image: ${IMAGE_NAME}"

# Start timing
START_TIME=$(date +%s)

# Load from cache or pull fresh
if [ -f "$TAR_FILE" ]; then
	echo "📦 Loading cached Playwright base image (786MB)..."
	docker load -i "$TAR_FILE"
	echo "✅ Base image loaded from cache"
	CACHE_SOURCE="restored"
else
	echo "⬇️ Pulling Playwright base image (first time - 786MB)..."
	docker pull "$IMAGE_NAME"
	echo "💾 Saving base image to cache..."

	if docker save "$IMAGE_NAME" -o "$TAR_FILE"; then
		echo "✅ Base image pulled and saved successfully"
		CACHE_SOURCE="pulled_and_saved"
	else
		echo "❌ ERROR: Failed to save Docker image to tar"
		CACHE_SOURCE="pulled_save_failed"
		exit 1
	fi
fi

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "⏱️  Load duration: ${DURATION}s"

# Verify tar file and get size for diagnostics
if [ -f "$TAR_FILE" ]; then
	# Cross-platform stat command
	if [[ "$OSTYPE" == "darwin"* ]]; then
		TAR_SIZE=$(stat -f%z "$TAR_FILE")
	else
		TAR_SIZE=$(stat -c%s "$TAR_FILE")
	fi

	TAR_SIZE_MB=$((TAR_SIZE / 1024 / 1024))
	echo "📊 Tar file size: ${TAR_SIZE_MB}MB (expected ~786MB)"
else
	TAR_SIZE_MB=0
	echo "⚠️ WARNING: Tar file does not exist!"
fi

# Export to GitHub Actions environment if available
if [ -n "${GITHUB_ENV:-}" ]; then
	echo "CACHE_SOURCE=${CACHE_SOURCE}" >> "$GITHUB_ENV"
	echo "DOCKER_LOAD_DURATION=${DURATION}" >> "$GITHUB_ENV"
	echo "TAR_FILE_SIZE_MB=${TAR_SIZE_MB}" >> "$GITHUB_ENV"
	echo "✅ Metrics exported to GITHUB_ENV"
fi

echo "✅ Playwright base image ready"
echo "   Cache source: ${CACHE_SOURCE}"
echo "   Duration: ${DURATION}s"
echo "   Tar size: ${TAR_SIZE_MB}MB"

exit 0

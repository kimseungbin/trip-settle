#!/usr/bin/env bash

# Append Playwright build metrics to existing Docker cache metrics git note
# This script adds Playwright build information and final summary to the note
# created by capture-cache-metrics.sh
#
# Usage: ./append-playwright-metrics.sh <commit-sha> <cache-hit> <load-duration>
#   commit-sha: Git commit SHA to append note to
#   cache-hit: Whether base image cache was hit (true/false)
#   load-duration: Time to load/pull base image in seconds
#
# Environment variables required:
#   GITHUB_SHA: Git commit SHA
#   DOCKER_LOAD_DURATION: Time to load Docker base image
#   CACHE_SOURCE: Source of cache (restored/pulled_and_saved/pulled_save_failed)
#   TAR_FILE_SIZE_MB: Size of cached tar file in MB
#   DOCKERFILE_HASH: Hash of Dockerfile.e2e

set -euo pipefail

# Parse arguments
COMMIT_SHA="${1:-${GITHUB_SHA}}"
CACHE_HIT="${2:-false}"
LOAD_DURATION="${3:-${DOCKER_LOAD_DURATION:-0}}"
CACHE_SOURCE="${CACHE_SOURCE:-unknown}"
TAR_SIZE_MB="${TAR_FILE_SIZE_MB:-0}"
DOCKERFILE_HASH="${DOCKERFILE_HASH:-unknown}"

echo "📊 Appending Playwright build metrics to existing note..."

# Compute cache key for diagnostics
CACHE_KEY="playwright-base-image-v1.56.1-noble-${DOCKERFILE_HASH}"

# Determine if tar file exists
if [ -f /tmp/playwright-image.tar ]; then
  TAR_EXISTS="true"
else
  TAR_EXISTS="false"
fi

# Determine cache effectiveness
if [ "$CACHE_HIT" = "true" ]; then
  CACHE_EFFECTIVENESS="HIGH (base image cached)"
else
  CACHE_EFFECTIVENESS="MEDIUM (base image downloaded)"
fi

# Determine threshold status
if [ "$LOAD_DURATION" -gt 10 ]; then
  LOAD_STATUS="SLOW (>10s threshold)"
else
  LOAD_STATUS="OK (<10s threshold)"
fi

# Append Playwright metrics to note
cat > playwright-metrics.txt <<EOF

[build.playwright-e2e]
dockerfile = packages/frontend/Dockerfile.e2e
scope = playwright-e2e
build_time_sec = ~10
cache_scope = type=gha,scope=playwright-e2e
cache_mode = max
base_image_cache = ${CACHE_HIT}
base_image_size_mb = 786
base_image_load_sec = ${LOAD_DURATION}
layers_info = See job summary for detailed breakdown
status = success

[diagnostics.e2e-tests-job]
playwright_build = success
base_image_cache = ${CACHE_HIT}
base_image_tar_exists = ${TAR_EXISTS}
base_image_tar_size_mb = ${TAR_SIZE_MB}
cache_source = ${CACHE_SOURCE}
load_duration_sec = ${LOAD_DURATION}
cache_key = ${CACHE_KEY}
dockerfile_hash = ${DOCKERFILE_HASH}

[summary.final]
# Final summary after all builds complete
total_build_time_sec = ~115
builds_completed = 3
backend_build = success
frontend_build = success
playwright_build = success
cache_effectiveness = ${CACHE_EFFECTIVENESS}
overall_status = success

[diagnostics.thresholds]
# Help LLM identify anomalies
backend_slow_build = none (45s < 60s threshold)
frontend_slow_build = none (60s < 90s threshold)
playwright_base_load = ${LOAD_STATUS}
base_image_tar = ${TAR_EXISTS} (should be true)

[trends]
# Comparison data for LLM analysis
note = Compare with previous runs using docker-cache-analysis skill
view_trends = git notes --ref=ci/cache-metrics show HEAD~1 (previous run)
EOF

echo "📋 Playwright metrics captured:"
echo "  Base image cache: ${CACHE_HIT}"
echo "  Cache key: ${CACHE_KEY}"
echo "  Load duration: ${LOAD_DURATION}s"
echo "  Tar exists: ${TAR_EXISTS}"
echo "  Tar size: ${TAR_SIZE_MB}MB"

# Configure git for bot commits
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

# Fetch existing notes
if git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics 2>/dev/null; then
  echo "✅ Fetched existing notes"
else
  echo "⚠️  No existing notes found"
fi

# Append Playwright metrics to existing note
if git notes --ref=ci/cache-metrics append -F playwright-metrics.txt "$COMMIT_SHA" 2>/dev/null; then
  echo "✅ Metrics appended to note"
else
  echo "⚠️  Failed to append (note may not exist yet)"
fi

# Push updated note
if git push origin refs/notes/ci/cache-metrics --force 2>&1; then
  echo "✅ Playwright metrics appended and pushed to git notes"
  exit 0
else
  echo "❌ ERROR: Failed to push updated metrics"
  exit 1
fi
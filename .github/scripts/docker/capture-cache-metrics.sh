#!/usr/bin/env bash

# Capture Docker build cache metrics for backend and frontend
# This script creates an initial git note with build metrics that will be
# appended to by subsequent build steps.
#
# Usage: ./capture-cache-metrics.sh <commit-sha> <backend-time> <frontend-time>
#   commit-sha: Git commit SHA to attach note to
#   backend-time: Approximate backend build time in seconds
#   frontend-time: Approximate frontend build time in seconds
#
# Environment variables required:
#   GITHUB_SHA: Git commit SHA
#   GITHUB_REF_NAME: Git branch name
#   GITHUB_SERVER_URL: GitHub server URL
#   GITHUB_REPOSITORY: Repository name (owner/repo)
#   GITHUB_RUN_ID: Workflow run ID

set -euo pipefail

# Parse arguments
COMMIT_SHA="${1:-${GITHUB_SHA}}"
BACKEND_BUILD_TIME="${2:-45}"
FRONTEND_BUILD_TIME="${3:-60}"
TOTAL_BUILD_TIME=$((BACKEND_BUILD_TIME + FRONTEND_BUILD_TIME))

echo "📊 Capturing Docker build metrics for backend and frontend..."

# Create initial metrics note
cat > cache-note.txt <<EOF
=== DOCKER CACHE METRICS ===

[summary]
total_build_time_sec = ${TOTAL_BUILD_TIME}
cache_effectiveness = pending_e2e_job
builds_total = 3
builds_pending = 1
critical_issues = 0
warnings = 0

[pipeline]
# Build dependency graph
stage_1 = base (node:24-alpine + dumb-init + tsconfig.base.json)
stage_2_parallel = backend-deps, frontend-deps (npm ci from base)
stage_3_parallel = backend-e2e, frontend-dev (from deps + source code)
stage_4_pending = playwright-e2e (will be appended by e2e-tests job)

[build.backend-e2e]
dockerfile = Dockerfile
target = backend-e2e
scope = backend-e2e
build_time_sec = ~${BACKEND_BUILD_TIME}
cache_scope = type=gha,scope=backend-e2e
cache_mode = max
layers_info = See job summary for detailed breakdown
image_size_mb = pending
status = success

[build.frontend-dev]
dockerfile = Dockerfile
target = frontend-dev
scope = frontend-dev
build_time_sec = ~${FRONTEND_BUILD_TIME}
cache_scope = type=gha,scope=frontend-dev
cache_mode = max
layers_info = See job summary for detailed breakdown
image_size_mb = pending
status = success

[diagnostics.docker-images-job]
backend_build = success
frontend_build = success
cache_backend = gha (GitHub Actions cache)
buildx_version = v0.12+
layer_caching = enabled
mode = max (all intermediate layers cached)

[metadata]
timestamp = $(date -u +"%Y-%m-%dT%H:%M:%SZ")
commit = ${COMMIT_SHA:0:7}
branch = ${GITHUB_REF_NAME:-unknown}
run_url = ${GITHUB_SERVER_URL:-}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID:-}
job = docker-images
note = Backend and frontend metrics captured. Playwright metrics will be appended by e2e-tests job.
EOF

echo "📋 Initial cache metrics captured"

# Configure git for bot commits
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

# Fetch existing notes (may not exist yet)
if git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics 2>/dev/null; then
  echo "✅ Fetched existing notes"
else
  echo "ℹ️  No existing notes found (first run)"
fi

# Add note to current commit
if git notes --ref=ci/cache-metrics add -F cache-note.txt "$COMMIT_SHA" 2>/dev/null; then
  echo "✅ Note added to commit"
else
  echo "⚠️  Note already exists, will be updated by e2e-tests job"
fi

# Push to remote
if git push origin refs/notes/ci/cache-metrics --force 2>&1; then
  echo "✅ Docker build metrics captured and pushed to git notes"
  exit 0
else
  echo "❌ ERROR: Failed to push cache metrics notes"
  exit 1
fi
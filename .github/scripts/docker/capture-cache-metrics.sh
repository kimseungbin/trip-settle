#!/usr/bin/env bash

# Capture Docker build cache metrics for backend and frontend with layer-level analysis
# This script parses Docker BuildKit output to extract detailed cache hit/miss data
#
# Usage: ./capture-cache-metrics.sh
#
# Environment variables required:
#   GITHUB_SHA: Git commit SHA
#   GITHUB_REF_NAME: Git branch name
#   GITHUB_SERVER_URL: GitHub server URL
#   GITHUB_REPOSITORY: Repository name (owner/repo)
#   GITHUB_RUN_ID: Workflow run ID
#
# Build logs expected at:
#   /tmp/backend-build.log
#   /tmp/frontend-build.log

set -euo pipefail

COMMIT_SHA="${GITHUB_SHA}"
BACKEND_LOG="/tmp/backend-build.log"
FRONTEND_LOG="/tmp/frontend-build.log"

echo "📊 Analyzing Docker build cache metrics with layer-level detail..."

# Function to parse BuildKit output and count cached vs built layers
parse_cache_stats() {
    local log_file="$1"
    local total_layers=0
    local cached_layers=0
    local built_layers=0

    if [[ ! -f "$log_file" ]]; then
        echo "0 0 0"
        return
    fi

    # Count CACHED layers (layers reused from cache)
    cached_layers=$(grep -c "CACHED" "$log_file" 2>/dev/null || echo "0")

    # Count DONE layers that weren't cached (layers that were built)
    # Exclude CACHED lines from DONE count
    built_layers=$(grep "DONE" "$log_file" | grep -v "CACHED" | wc -l | tr -d ' ' || echo "0")

    total_layers=$((cached_layers + built_layers))

    echo "$total_layers $cached_layers $built_layers"
}

# Function to extract layer details
extract_layer_details() {
    local log_file="$1"
    local prefix="$2"

    if [[ ! -f "$log_file" ]]; then
        return
    fi

    # Extract stage and layer information
    grep -E "^\#[0-9]+ \[(stage-|internal)" "$log_file" | head -20 | while IFS= read -r line; do
        # Parse layer info: stage name, cache status, timing
        if echo "$line" | grep -q "CACHED"; then
            echo "${prefix}_cached"
        elif echo "$line" | grep -q "DONE"; then
            echo "${prefix}_built"
        fi
    done | sort | uniq -c | awk -v prefix="$prefix" '{print prefix "_" $2 " = " $1}'
}

# Parse backend build stats
read -r be_total be_cached be_built <<< "$(parse_cache_stats "$BACKEND_LOG")"
be_cache_rate=0
if [[ $be_total -gt 0 ]]; then
    be_cache_rate=$((be_cached * 100 / be_total))
fi

# Parse frontend build stats
read -r fe_total fe_cached fe_built <<< "$(parse_cache_stats "$FRONTEND_LOG")"
fe_cache_rate=0
if [[ $fe_total -gt 0 ]]; then
    fe_cache_rate=$((fe_cached * 100 / fe_total))
fi

# Calculate overall stats
overall_total=$((be_total + fe_total))
overall_cached=$((be_cached + fe_cached))
overall_built=$((be_built + fe_built))
overall_cache_rate=0
if [[ $overall_total -gt 0 ]]; then
    overall_cache_rate=$((overall_cached * 100 / overall_total))
fi

echo "📊 Cache Statistics:"
echo "  Backend: $be_cached/$be_total cached (${be_cache_rate}%)"
echo "  Frontend: $fe_cached/$fe_total cached (${fe_cache_rate}%)"
echo "  Overall: $overall_cached/$overall_total cached (${overall_cache_rate}%)"

# Create enhanced metrics note with layer-level details
cat > cache-note.txt <<EOF
=== DOCKER CACHE METRICS (Layer-Level Analysis) ===

[summary]
overall_cache_hit_rate = ${overall_cache_rate}%
total_layers = ${overall_total}
cached_layers = ${overall_cached}
built_layers = ${overall_built}
builds_analyzed = 2

[backend.cache_stats]
total_layers = ${be_total}
cached_layers = ${be_cached}
built_layers = ${be_built}
cache_hit_rate = ${be_cache_rate}%
target = backend-e2e
dockerfile = Dockerfile
cache_scope = type=gha,scope=backend-e2e
cache_mode = max

[frontend.cache_stats]
total_layers = ${fe_total}
cached_layers = ${fe_cached}
built_layers = ${fe_built}
cache_hit_rate = ${fe_cache_rate}%
target = frontend-dev
dockerfile = Dockerfile
cache_scope = type=gha,scope=frontend-dev
cache_mode = max

[pipeline]
# Build dependency graph (shared base → parallel deps → parallel targets)
stage_1 = base (node:24-alpine + dumb-init + tsconfig.base.json)
stage_2_parallel = backend-deps, frontend-deps (npm ci from base)
stage_3_parallel = backend-e2e, frontend-dev (from deps + source code)

[diagnostics]
buildx_version = v0.12+
progress_mode = plain (detailed layer output)
layer_caching = enabled
cache_backend = gha (GitHub Actions cache)
mode = max (all intermediate layers cached)

[metadata]
timestamp = $(date -u +"%Y-%m-%dT%H:%M:%SZ")
commit = ${COMMIT_SHA:0:7}
branch = ${GITHUB_REF_NAME:-unknown}
run_url = ${GITHUB_SERVER_URL:-}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID:-}
job = docker-images
note = Layer-level cache analysis from Docker BuildKit plain output
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
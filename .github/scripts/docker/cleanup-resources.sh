#!/usr/bin/env bash

# Cleanup Docker resources for E2E tests
# This script removes containers, volumes, and dangling images to free up space
# and ensure clean test environment between runs.
#
# Usage: ./cleanup-resources.sh [compose-file]
#   compose-file: Path to docker-compose file (default: docker-compose.e2e.yml)

set -euo pipefail

# Configuration
COMPOSE_FILE="${1:-docker-compose.e2e.yml}"

echo "🧹 Cleaning up Docker resources..."

# Stop and remove containers (anonymous volumes auto-cleaned with -v)
if docker compose -f "$COMPOSE_FILE" down -v --remove-orphans 2>/dev/null; then
  echo "✅ Stopped and removed containers and volumes"
else
  echo "ℹ️  No containers to remove (already clean)"
fi

# Remove any dangling images to free up space
if docker image prune -f 2>/dev/null; then
  echo "✅ Removed dangling images"
else
  echo "ℹ️  No dangling images to remove"
fi

echo "✅ Cleanup complete"
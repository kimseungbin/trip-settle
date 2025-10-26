#!/usr/bin/env bash

# Check if visual snapshot update workflow should run
# This script detects three trigger methods:
#   1. Manual workflow_dispatch
#   2. PR comment containing "/update-snapshots"
#   3. Commit message containing "[update-snapshots]"
#      NOTE: Checks ALL commits in a push, not just HEAD commit
#      This handles multi-commit pushes where [update-snapshots] might
#      be in an earlier commit.
#
# Usage: ./check-trigger.sh
#
# Outputs (to GITHUB_OUTPUT):
#   should_run: "true" or "false"
#   branch: Branch name to update snapshots on
#
# Environment variables required:
#   GITHUB_EVENT_NAME: Type of event that triggered workflow
#   GITHUB_REF_NAME: Current branch name
#   GITHUB_EVENT_PATH: Path to event payload JSON (optional)

set -euo pipefail

# Initialize outputs
SHOULD_RUN="false"
BRANCH="${GITHUB_REF_NAME:-main}"

echo "🔍 Checking snapshot update trigger condition..."
echo "Event: ${GITHUB_EVENT_NAME:-unknown}"

# Check trigger condition based on event type
case "${GITHUB_EVENT_NAME:-}" in
  workflow_dispatch)
    echo "✅ Manual workflow_dispatch trigger detected"
    SHOULD_RUN="true"

    # Check if custom branch was specified
    if [ -f "$GITHUB_EVENT_PATH" ]; then
      CUSTOM_BRANCH=$(jq -r '.inputs.branch // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || echo "")
      if [ -n "$CUSTOM_BRANCH" ]; then
        BRANCH="$CUSTOM_BRANCH"
        echo "   Using custom branch: $BRANCH"
      fi
    fi
    ;;

  issue_comment)
    echo "🔍 Checking PR comment trigger..."
    if [ -f "$GITHUB_EVENT_PATH" ]; then
      COMMENT=$(jq -r '.comment.body' "$GITHUB_EVENT_PATH" 2>/dev/null || echo "")
      IS_PR=$(jq -r '.issue.pull_request // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || echo "")

      if [[ "$COMMENT" == "/update-snapshots"* ]] && [ -n "$IS_PR" ]; then
        echo "✅ PR comment trigger detected: /update-snapshots"
        SHOULD_RUN="true"
        # Note: Getting PR branch requires additional API call, using current branch as fallback
      else
        echo "ℹ️  Comment does not match /update-snapshots pattern or not on PR"
      fi
    fi
    ;;

  push)
    echo "🔍 Checking commit message trigger..."
    if [ -f "$GITHUB_EVENT_PATH" ]; then
      # Check ALL commits in the push, not just HEAD
      # This handles multi-commit pushes where [update-snapshots] might not be in HEAD
      COMMIT_COUNT=$(jq -r '.commits | length' "$GITHUB_EVENT_PATH" 2>/dev/null || echo "0")
      echo "   Checking $COMMIT_COUNT commit(s) in push..."

      # Extract all commit messages and check if any contain [update-snapshots]
      MATCHING_COMMITS=$(jq -r '.commits[] | select(.message | contains("[update-snapshots]")) | .id[0:7] + ": " + (.message | split("\n")[0])' "$GITHUB_EVENT_PATH" 2>/dev/null || echo "")

      if [ -n "$MATCHING_COMMITS" ]; then
        echo "✅ Commit message trigger detected: [update-snapshots]"
        echo "   Matching commits:"
        echo "$MATCHING_COMMITS" | sed 's/^/     /'
        SHOULD_RUN="true"
      else
        echo "ℹ️  No commits in push contain [update-snapshots]"
      fi
    fi
    ;;

  *)
    echo "ℹ️  Unknown or unsupported event type: ${GITHUB_EVENT_NAME:-}"
    ;;
esac

# Output results
echo ""
echo "Results:"
echo "  should_run = $SHOULD_RUN"
echo "  branch = $BRANCH"

# Write to GITHUB_OUTPUT if available
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "should_run=$SHOULD_RUN" >> "$GITHUB_OUTPUT"
  echo "branch=$BRANCH" >> "$GITHUB_OUTPUT"
  echo "✅ Results written to GITHUB_OUTPUT"
else
  echo "⚠️  GITHUB_OUTPUT not set (not running in GitHub Actions)"
fi

exit 0
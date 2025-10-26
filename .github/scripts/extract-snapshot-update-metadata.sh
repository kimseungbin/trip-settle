#!/usr/bin/env bash

# Extract snapshot update workflow metadata and generate INI-format note
# for git notes storage.
#
# This tracks the update-snapshots workflow execution to help diagnose
# failures and monitor snapshot update patterns.
#
# Usage:
#   extract-snapshot-update-metadata.sh <output-note-path>
#
# Example:
#   extract-snapshot-update-metadata.sh snapshot-update-note.txt
#
# Environment variables required:
#   TRIGGER_METHOD: How workflow was triggered (workflow_dispatch, issue_comment, push)
#   WORKFLOW_STATUS: Current workflow status (running, success, failure)
#   HAS_CHANGES: Whether snapshots were updated (true/false)
#   CHANGED_FILES_COUNT: Number of snapshot files changed
#   CHECKOUT_SUCCESS, DOCKER_SUCCESS, PLAYWRIGHT_SUCCESS, COMMIT_SUCCESS, PUSH_SUCCESS
#   GITHUB_SHA, GITHUB_REF_NAME, GITHUB_RUN_ID, etc.

set -euo pipefail

# Parse arguments
OUTPUT_PATH="${1:?Usage: extract-snapshot-update-metadata.sh <output-note-path>}"

# Extract metadata from environment
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT="${GITHUB_SHA:0:7}"
BRANCH="${GITHUB_REF_NAME:-unknown}"
RUN_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

TRIGGER_METHOD="${TRIGGER_METHOD:-unknown}"
WORKFLOW_STATUS="${WORKFLOW_STATUS:-unknown}"
HAS_CHANGES="${HAS_CHANGES:-false}"
CHANGED_FILES_COUNT="${CHANGED_FILES_COUNT:-0}"
CHECKOUT_SUCCESS="${CHECKOUT_SUCCESS:-false}"
DOCKER_SUCCESS="${DOCKER_SUCCESS:-false}"
PLAYWRIGHT_SUCCESS="${PLAYWRIGHT_SUCCESS:-false}"
COMMIT_SUCCESS="${COMMIT_SUCCESS:-false}"
PUSH_SUCCESS="${PUSH_SUCCESS:-false}"

# Determine overall outcome
if [ "$WORKFLOW_STATUS" = "success" ]; then
	if [ "$HAS_CHANGES" = "true" ]; then
		OUTCOME="snapshots_updated"
	else
		OUTCOME="no_changes_needed"
	fi
elif [ "$WORKFLOW_STATUS" = "failure" ] || [ "$WORKFLOW_STATUS" = "cancelled" ]; then
	OUTCOME="failed"
else
	OUTCOME="in_progress"
fi

# Determine which step failed
ERROR_STEP="none"
ERROR_MESSAGE="none"

if [ "$OUTCOME" = "failed" ]; then
	# Identify failed step based on which steps completed successfully
	if [ "$CHECKOUT_SUCCESS" != "true" ]; then
		ERROR_STEP="checkout"
		ERROR_MESSAGE="Failed to checkout code"
	elif [ "$DOCKER_SUCCESS" != "true" ]; then
		ERROR_STEP="docker_setup"
		ERROR_MESSAGE="Failed to setup Docker Buildx"
	elif [ "$PLAYWRIGHT_SUCCESS" != "true" ]; then
		ERROR_STEP="playwright_tests"
		ERROR_MESSAGE="Playwright tests failed or timed out"
	elif [ "$HAS_CHANGES" = "true" ] && [ "$COMMIT_SUCCESS" != "true" ]; then
		ERROR_STEP="commit_step"
		ERROR_MESSAGE="Failed to commit snapshot changes"
	elif [ "$HAS_CHANGES" = "true" ] && [ "$PUSH_SUCCESS" != "true" ]; then
		ERROR_STEP="push_step"
		ERROR_MESSAGE="Failed to push snapshot changes to remote"
	else
		ERROR_STEP="unknown"
		ERROR_MESSAGE="Workflow failed but couldn't identify specific step"
	fi
fi

# Generate INI-format note
cat > "$OUTPUT_PATH" <<EOF
=== SNAPSHOT UPDATE WORKFLOW REPORT ===

[metadata]
timestamp = ${TIMESTAMP}
commit = ${COMMIT}
branch = ${BRANCH}
run_url = ${RUN_URL}
workflow = update-snapshots
triggered_by = ${TRIGGER_METHOD}

[execution]
status = ${WORKFLOW_STATUS}
outcome = ${OUTCOME}
checkout_step = ${CHECKOUT_SUCCESS}
docker_setup = ${DOCKER_SUCCESS}
playwright_tests = ${PLAYWRIGHT_SUCCESS}
commit_step = ${COMMIT_SUCCESS}
push_step = ${PUSH_SUCCESS}

[snapshot_changes]
has_changes = ${HAS_CHANGES}
files_changed = ${CHANGED_FILES_COUNT}
committed = ${COMMIT_SUCCESS}
pushed = ${PUSH_SUCCESS}

[diagnostics]
error_step = ${ERROR_STEP}
error_message = ${ERROR_MESSAGE}
test_env = ci-docker
updating_snapshots = true
docker_user = root

[trigger_details]
method = ${TRIGGER_METHOD}
# workflow_dispatch: Manual trigger from GitHub UI
# issue_comment: Triggered by /update-snapshots PR comment
# push: Triggered by [update-snapshots] in commit message
source_branch = ${BRANCH}

[recommendations]
# For LLM analysis
next_steps = $(
	if [ "$OUTCOME" = "failed" ]; then
		echo "Analyze error_step and error_message. Check artifacts in run_url."
	elif [ "$OUTCOME" = "snapshots_updated" ]; then
		echo "Review snapshot changes in git diff. Ensure visual changes are intentional."
	else
		echo "No action needed - snapshots already up to date."
	fi
)
EOF

echo "✅ Snapshot update metadata extracted successfully"
echo "   Output: ${OUTPUT_PATH}"
echo "   Trigger: ${TRIGGER_METHOD}"
echo "   Status: ${WORKFLOW_STATUS}"
echo "   Outcome: ${OUTCOME}"
echo "   Changes: $([ "$HAS_CHANGES" = "true" ] && echo "${CHANGED_FILES_COUNT} files" || echo "none")"

if [ "$OUTCOME" = "failed" ]; then
	echo "   ⚠️ Error at step: ${ERROR_STEP}"
	echo "   ⚠️ Error message: ${ERROR_MESSAGE}"
fi

# Snapshot Update Analysis Skill

Analyze visual snapshot update workflow execution from git notes stored by the GitHub Actions workflow.

## Purpose

This skill helps you understand and troubleshoot the visual snapshot update workflow by:
- Tracking workflow success rates over time
- Identifying which trigger methods are most reliable
- Pinpointing which workflow steps fail most often
- Analyzing snapshot change patterns
- Providing actionable recommendations for resolving failures

## Dependencies

This skill uses **git-notes-helper** for common git notes operations:
- Fetching notes from remote
- Parsing INI-format note data
- Historical analysis across commits
- Comparing commits

For detailed git notes operations, see `.claude/skills/git-notes-helper/helper.yaml`

## Usage

### Invoke the Skill

```
User: "Analyze snapshot update workflow"
User: "Show snapshot update success rate"
User: "Why did the snapshot update fail?"
User: "Which trigger method is most reliable?"
User: "Show snapshot update failures for the last week"
```

Claude will automatically:
1. Fetch git notes with workflow metadata
2. Parse and analyze the data
3. Present findings with breakdowns by trigger method
4. Identify recent failures with debugging info
5. Provide recommendations

### Manual Analysis (Without Skill)

If you want to manually inspect workflow metadata:

```bash
# Fetch snapshot update notes
git fetch origin refs/notes/ci/snapshot-updates:refs/notes/ci/snapshot-updates

# View metadata for current commit
git notes --ref=ci/snapshot-updates show

# View metadata for specific commit
git notes --ref=ci/snapshot-updates show abc123

# List all commits with workflow notes
git log --notes=ci/snapshot-updates --format="%h %s" -20
```

## Prerequisites

The snapshot update workflow must be configured to capture metadata. See `.github/workflows/update-snapshots.yml` for the "Capture workflow metadata" step.

## How Metadata Is Captured

Understanding the full pipeline helps with troubleshooting and maintenance.

### Workflow Integration

Workflow metadata is captured automatically in the GitHub Actions `update-snapshots` job:

```yaml
# .github/workflows/update-snapshots.yml (update-snapshots job)
- name: Capture workflow metadata in git notes
  if: always()  # Run even if previous steps failed
  run: |
    # Set final workflow status
    if [ "${{ job.status }}" = "success" ]; then
      echo "WORKFLOW_STATUS=success" >> $GITHUB_ENV
    else
      echo "WORKFLOW_STATUS=failure" >> $GITHUB_ENV
    fi

    # Extract metadata
    ./.github/scripts/extract-snapshot-update-metadata.sh snapshot-update-note.txt

    # Store in git notes
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git notes --ref=ci/snapshot-updates add -F snapshot-update-note.txt ${{ github.sha }}

    # Push to remote
    git push origin refs/notes/ci/snapshot-updates
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What happens:**
1. Workflow runs (success or failure)
2. Extraction script generates INI-format note with execution details
3. Git note attached to commit using `refs/notes/ci/snapshot-updates` namespace
4. Note pushed to remote for team access
5. **Runs even on failure** (`if: always()`) to capture error details

### Extraction Script

**File**: `.github/scripts/extract-snapshot-update-metadata.sh`

**Input**: Environment variables set throughout workflow execution

**Processing**:
- Extracts trigger method (workflow_dispatch, issue_comment, push)
- Records step-level success/failure (checkout, docker, playwright, commit, push)
- Tracks snapshot changes (whether files changed, file count)
- Captures error details (failed step, error message)
- Determines overall outcome (snapshots_updated, no_changes_needed, failed)

**Output**: INI-style note with sections for metadata, execution, snapshot changes, diagnostics, and recommendations

### Git Notes Storage

**Namespace**: `refs/notes/ci/snapshot-updates`

**Why git notes?**
- Attach workflow metadata to commits without changing commit history
- Store independently from code (separate ref)
- Team-wide visibility (pushed to remote)
- Commit-specific (each commit gets its own workflow report)
- Captured even for failed runs (enables failure analysis)

**Note**: Git notes are NOT fetched by default. You must fetch them explicitly:

```bash
git fetch origin refs/notes/ci/snapshot-updates:refs/notes/ci/snapshot-updates
```

## Metadata Captured

The skill analyzes these fields from git notes:

**Metadata Section:**
- **timestamp**: When the workflow ran
- **commit**: Git commit hash
- **branch**: Branch name
- **run_url**: Link to GitHub Actions run for detailed logs
- **triggered_by**: How workflow was triggered

**Execution Section:**
- **status**: Overall workflow status (success, failure)
- **outcome**: Specific outcome (snapshots_updated, no_changes_needed, failed)
- **checkout_step**: Whether checkout succeeded (true/false)
- **docker_setup**: Whether Docker setup succeeded
- **playwright_tests**: Whether Playwright tests succeeded
- **commit_step**: Whether commit succeeded
- **push_step**: Whether push succeeded

**Snapshot Changes Section:**
- **has_changes**: Whether snapshots changed (true/false)
- **files_changed**: Number of snapshot files changed
- **committed**: Whether changes were committed
- **pushed**: Whether changes were pushed

**Diagnostics Section:**
- **error_step**: Which step failed (or "none")
- **error_message**: Error message (or "none")

**Trigger Details:**
- **method**: Trigger method (workflow_dispatch, issue_comment, push)
- **source_branch**: Branch where workflow ran

## Workflow Trigger Methods

The snapshot update workflow can be triggered three ways:

### 1. workflow_dispatch (Manual)
**Trigger**: GitHub UI → Actions → "Update Visual Snapshots" → Run workflow

**Reliability**: Highest (direct user control)

**When to use**:
- One-off snapshot updates
- Troubleshooting failed automated updates
- Testing workflow changes

### 2. issue_comment (PR Comment)
**Trigger**: Comment `/update-snapshots` on a pull request

**Reliability**: High (requires PR comment detection logic)

**When to use**:
- Convenient for PR workflows
- Reviewer requests snapshot update
- CI visual tests fail and need snapshot update

### 3. push (Commit Footer)
**Trigger**: Include `Snapshots: update` footer in commit message

**Reliability**: Good (requires commit message parsing)

**When to use**:
- Automated updates during development
- Most common trigger method
- Developer explicitly knows UI changed

**Note**: The workflow checks ALL commits in a push, not just HEAD. If ANY commit contains `Snapshots: update`, the workflow runs.

## Example Output

```
=== SNAPSHOT UPDATE WORKFLOW ANALYSIS ===

Period: 2025-10-20 to 2025-10-26
Workflow runs analyzed: 18

## Overall Workflow Health

Success Rate: 83% (15/18)
- Successful updates: 12
- Failed updates: 3
- No changes needed: 3

## Trigger Method Usage

| Trigger Method    | Count | Success Rate | Avg Files Changed |
|-------------------|-------|--------------|-------------------|
| push (footer)     | 10    | 80%          | 8.5               |
| issue_comment     | 5     | 100%         | 6.2               |
| workflow_dispatch | 3     | 67%          | 11.0              |

## Step-Level Failure Analysis

| Step             | Failure Count | % of Total Failures |
|------------------|---------------|---------------------|
| playwright_tests | 2             | 67%                 |
| push_step        | 1             | 33%                 |
| checkout         | 0             | 0%                  |
| docker_setup     | 0             | 0%                  |
| commit_step      | 0             | 0%                  |

## Snapshot Change Patterns

Average files changed per update: 8.6
- Largest update: 15 files (commit: abc1234)
- Smallest update: 2 files (commit: def5678)

Workflow runs with no changes: 3 (17% of total)
- Consider: Trigger detection working as expected

## Recent Failures

1. Commit 9ab3def (2025-10-25T14:22:00Z)
   - Trigger: push
   - Failed at: playwright_tests
   - Error: Visual regression tests timed out
   - Run URL: https://github.com/user/repo/actions/runs/12345

2. Commit 7cd1234 (2025-10-23T10:15:00Z)
   - Trigger: workflow_dispatch
   - Failed at: push_step
   - Error: Branch protection rules prevent push
   - Run URL: https://github.com/user/repo/actions/runs/12340

## Trends & Patterns

⚠️ Playwright tests failing occasionally (2 recent failures)
✓ PR comment trigger has 100% success rate
📊 Most updates triggered by commit footer (push)
⚠️ Push step failed once (check branch protection settings)

## Recommendations

**Playwright test failures:**
- Review test stability and potential flaky tests
- Check if recent UI changes caused legitimate visual differences
- Consider increasing timeout values if tests are slow

**Push step failure:**
- Verify branch protection rules allow GitHub Actions to push
- Ensure workflow has `contents: write` permission
- Check GITHUB_TOKEN has necessary permissions

**Overall:**
- Workflow health is good (83% success rate)
- PR comment trigger is most reliable
- Consider investigating why 17% of runs have no changes
```

## Common Issues

### High Failure Rate

**Symptom**: Most snapshot updates are failing

**Possible Causes**:
- Playwright visual tests are flaky or unstable
- Docker setup timing out
- Git authentication issues (push step)
- Branch protection rules preventing push

**Solution**: Check `error_step` in notes to identify which phase fails, then review specific step configuration

### Workflow Runs But Reports No Changes

**Symptom**: Workflow completes but reports `outcome = no_changes_needed`

**Possible Causes**:
- Snapshots are already up to date (normal)
- Workflow triggered unnecessarily
- Git diff not detecting snapshot file changes

**Solution**: This may be normal behavior. Review trigger detection logic if it happens frequently.

### Push Failures

**Symptom**: `commit_step` succeeds but `push_step` fails

**Possible Causes**:
- Branch protection rules require PR
- GITHUB_TOKEN lacks write permissions
- Network timeout during push

**Solution**:
- Settings → Branches → Allow GitHub Actions to bypass protection
- Verify workflow has `contents: write` permission

### No Git Notes Found

**Symptom**: `git notes --ref=ci/snapshot-updates list` returns nothing

**Solution**:
1. Ensure "Capture workflow metadata" step is in `.github/workflows/update-snapshots.yml`
2. Trigger the workflow (any method)
3. After workflow completes, fetch notes: `git fetch origin refs/notes/ci/snapshot-updates`

## Troubleshooting

**Workflow not capturing metadata:**
- Check workflow file has the "Capture workflow metadata" step
- Verify step has `if: always()` to run on failures
- Check extraction script is executable: `ls -l .github/scripts/extract-snapshot-update-metadata.sh`

**Cannot push git notes:**
- Workflow needs `contents: write` permission
- Check GITHUB_TOKEN environment variable is set
- Verify branch protection doesn't block git notes push

**Metadata incomplete:**
- Check environment variables are set throughout workflow
- Review extraction script logic for missing fields
- Ensure step success flags are recorded at each step

## Related Files

- **Skill Definition**: `.claude/skills/snapshot-update-analysis/analysis.yaml`
- **Workflow**: `.github/workflows/update-snapshots.yml`
- **Metadata Extraction**: `.github/scripts/extract-snapshot-update-metadata.sh`
- **Trigger Detection**: `.github/scripts/snapshots/check-trigger.sh`
- **Documentation**: `CLAUDE.md` (Visual Snapshot Management section)
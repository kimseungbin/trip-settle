# Snapshot Update Analysis

Analyze visual snapshot update workflow performance using git notes.

> **Note**: This guide uses bash for loops to iterate commits. For syntax guidance and ZSH compatibility, see [`git-notes.md` → "Common Bash Patterns"](git-notes.md#common-bash-patterns).

## Git Notes Namespace

`ci/snapshot-updates` - Snapshot workflow execution metadata

## Quick Analysis

```bash
# Fetch and show status
git fetch origin refs/notes/ci/snapshot-updates:refs/notes/ci/snapshot-updates
git notes --ref=ci/snapshot-updates show HEAD

# Check update status
git notes --ref=ci/snapshot-updates show HEAD | grep -E "^status|^outcome|^triggered_by"
```

## Trigger Methods

Snapshots can be updated via:
1. Commit message footer: `Snapshots: update`
2. PR comment: `/update-snapshots`
3. Manual workflow dispatch

## Analysis Patterns

### Track Update Success Rate

```bash
for commit in $(git log --oneline -10 --format='%h'); do
  outcome=$(git notes --ref=ci/snapshot-updates show $commit 2>/dev/null | grep "^outcome =" | cut -d'=' -f2 || echo "none")
  echo "$commit: $outcome"
done
```

### Find Timing Issues

```bash
# Check workflow duration
git notes --ref=ci/snapshot-updates show HEAD | grep "^job_duration_seconds"
```

See existing `snapshot-update-analysis` skill for detailed patterns.

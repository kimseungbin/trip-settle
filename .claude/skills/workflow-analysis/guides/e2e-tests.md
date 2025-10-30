# E2E Test Analysis

Analyze Playwright E2E test failures and flaky tests using git notes metadata.

> **Note**: This guide uses bash for loops to iterate commits. For syntax guidance and ZSH compatibility, see [`git-notes.md` → "Common Bash Patterns"](git-notes.md#common-bash-patterns).

## Git Notes Namespace

`ci/e2e-failures` - E2E test failure metadata

## Quick Analysis

```bash
# Fetch and show failures
git fetch origin refs/notes/ci/e2e-failures:refs/notes/ci/e2e-failures
git notes --ref=ci/e2e-failures show HEAD

# Find failed tests
git notes --ref=ci/e2e-failures show HEAD | grep "^\[failure\." -A 8

# Check failure count
git notes --ref=ci/e2e-failures show HEAD | grep "^failed ="
```

## Failure Categories

Git notes categorize failures by type:
- **Timeout**: Test exceeded time limit
- **Assertion**: Expectation failed
- **Navigation**: Page load/routing failed
- **Selector**: Element not found
- **Screenshot**: Visual regression mismatch

## Analysis Patterns

### Find Flaky Tests

```bash
# Tests that sometimes fail
git log --oneline -20 --format='%h' | while read commit; do
  if git notes --ref=ci/e2e-failures show $commit 2>/dev/null | grep -q "test_name = ExpenseForm"; then
    echo "$commit: ExpenseForm failed"
  fi
done
```

### Compare Failure Statistics Across Commits

```bash
# Standard pattern (see git-notes.md "Common Bash Patterns" for details)
for commit in $(git log --oneline -10 --format='%h'); do
  echo "=== $commit ==="
  git show --no-patch --format="%h: %s" $commit
  git notes --ref=ci/e2e-failures show $commit 2>/dev/null | grep "^failed ="
  echo ""
done

# Alternative: Sequential command chaining for 2-5 known commits
echo "=== Commit 1 ===" && \
git notes --ref=ci/e2e-failures show abc123 | grep "^failed =" && \
echo "=== Commit 2 ===" && \
git notes --ref=ci/e2e-failures show def456 | grep "^failed ="
```

**Note**: For bash loop syntax guidance and error handling, see `git-notes.md` → "Common Bash Patterns"

### Artifacts Location

```bash
# Get artifact paths
git notes --ref=ci/e2e-failures show HEAD | grep "^screenshot_path\|^trace_path"
```

See existing `e2e-failure-analysis` skill for detailed analysis patterns.

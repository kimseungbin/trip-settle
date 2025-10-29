# E2E Test Analysis

Analyze Playwright E2E test failures and flaky tests using git notes metadata.

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
for commit in $(git log --oneline -20 --format='%h'); do
  if git notes --ref=ci/e2e-failures show $commit 2>/dev/null | grep -q "test_name = ExpenseForm"; then
    echo "$commit: ExpenseForm failed"
  fi
done
```

### Artifacts Location

```bash
# Get artifact paths
git notes --ref=ci/e2e-failures show HEAD | grep "^screenshot_path\|^trace_path"
```

See existing `e2e-failure-analysis` skill for detailed analysis patterns.

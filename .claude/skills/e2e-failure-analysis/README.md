# E2E Failure Analysis Skill

Quickly diagnose Playwright E2E test failures and get actionable fix recommendations.

## Purpose

When E2E tests fail, you need to answer three questions fast:
1. **What failed?** (which tests)
2. **Why did it fail?** (error messages, stack traces)
3. **How do I fix it?** (debugging steps, artifact references)

This skill automates the analysis and provides targeted recommendations based on error type.

## Usage

### Invoke the Skill

```
User: "E2E tests failed, what's wrong?"
User: "Analyze E2E failures"
User: "Why did the Playwright tests fail?"
User: "Show me test failures"
```

Claude will automatically:
1. Locate test results (local or CI)
2. Parse failure data
3. Categorize by error type
4. Show relevant artifacts
5. Provide fix recommendations

### Manual Analysis (Without Skill)

If you want to manually inspect test results:

```bash
# View test results directory
ls -la packages/frontend/test-results/

# Check for JSON output (structured data)
cat packages/frontend/test-results/results.json

# View JUnit XML (alternative format)
cat packages/frontend/test-results/junit.xml

# Open HTML report in browser
open packages/frontend/playwright-report/index.html
```

## How It Works

### Phase 1: Local Analysis

**Data Sources:**
- `packages/frontend/test-results/` - Test execution results
- `packages/frontend/playwright-report/` - HTML report
- Test output logs (console)

**Capabilities:**
- Parse JSON/XML test results
- Categorize failures by type
- Extract error messages and stack traces
- Reference debugging artifacts (screenshots, videos, traces)
- Provide error-specific fix recommendations

### Phase 2: Git Notes Integration (Current)

**Enhancements (ACTIVE):**
- ✅ Store failure metadata in `refs/notes/ci/e2e-failures`
- ✅ CI automatically captures failures on every run
- ✅ No artifact download needed for basic diagnosis
- ✅ Fast analysis (metadata already extracted)

**How it works:**
```bash
# Fetch E2E failure notes
git fetch origin refs/notes/ci/e2e-failures:refs/notes/ci/e2e-failures

# View failures for current commit
git notes --ref=ci/e2e-failures show HEAD

# Skill automatically parses INI-format notes
```

**CI Integration:**
- `.github/workflows/ci.yml` - Captures failures after E2E tests
- `.github/scripts/extract-e2e-failures.js` - Parses JSON results
- Git notes pushed to `refs/notes/ci/e2e-failures` namespace

### Phase 3: Advanced Features (In Progress)

**Feature 1: Flaky Test Detection (ACTIVE)**

Identify tests that intermittently fail without code changes.

**What it detects:**
- Tests with inconsistent pass/fail patterns
- Flip rate calculation (percentage of status changes)
- Severity classification (critical >50%, moderate 30-50%, slight 10-30%)
- First flaky occurrence (commit and timestamp)

**How it works:**
```bash
# Analyze last 10-20 commits with E2E notes
git notes --ref=ci/e2e-failures show <each-commit>

# Build pass/fail history for each test
Test A: ✅ ✅ ✅ ✅ ✅  → STABLE (always passes)
Test B: ❌ ❌ ❌ ❌ ❌  → STABLE (always fails, real bug)
Test C: ✅ ❌ ✅ ❌ ✅  → FLAKY (55% flip rate, critical)

# Report flaky tests with recommendations
```

**Example output:**
```markdown
## Flaky Tests Detected ⚠️

### 1. ExpenseTracker › should add expense [chromium]
**Flakiness**: 55.6% (5 flips in 10 runs)
**Pattern**: ✅ ❌ ✅ ✅ ❌ ✅ ❌ ✅ ✅ ❌
**Severity**: 🔴 CRITICAL

**Recommendations**:
- Review timeout handling
- Check for race conditions
- Add explicit waits for button visibility
```

**Feature 2: Failure Trend Analysis (ACTIVE)**

Track when tests started failing and monitor degradation over time.

**What it tracks:**
- First failure occurrence (when did it start failing?)
- Failure duration (days and commits since first failure)
- Failure rate (recent vs historical)
- Trend direction (DEGRADING, STABLE, IMPROVING)

**How it works:**
```bash
# Walk backwards through commits to find first failure
for commit in $(git log -30 --format="%H"); do
  if test_failed_in_commit "$commit"; then
    echo "Failed"
  else
    echo "First failure after this commit"
    break
  fi
done

# Calculate failure rates
Recent (last 5):   80% (4/5) - DEGRADING
Historical (last 20): 60% (12/20)
```

**Example output:**
```markdown
## Failure Trend Analysis 📈

### ExpenseTracker › should add expense [chromium]
**First Failed**: 3 days ago (commit stu901 - "Add edit button")
**Trend**: 🔴 DEGRADING (80% recent vs 60% historical)
**Fix Priority**: HIGH - Blocking for 3 days

**Recommendations**:
- Review commit stu901 for button changes
- Likely introduced by "Add edit button" feature
```

**Remaining Features:**
- Blame integration (find commit that introduced failure)
- Comparison reports (show failures different from last run)
- Automatic regression detection (newly failing tests)

## Example Output

### Timeout Failure

```
=== E2E TEST FAILURE ANALYSIS ===

## Summary
- Total Tests: 42
- Passed: 41 ✅
- Failed: 1 ❌
- Pass Rate: 97.6%

## Failed Tests

### 1. ExpenseTracker › should add expense with Enter key [chromium]
**File**: `tests/e2e/expense-workflow.spec.ts:15`
**Error Type**: Timeout
**Duration**: 5000ms

**Error Message**:
```
Timeout 5000ms exceeded.
waiting for getByRole('button', { name: 'Add' })
```

**Artifacts**:
- 📸 Screenshot: `test-results/expense-workflow-chromium/test-failed-1.png`
- 🎥 Video: `test-results/expense-workflow-chromium/video.webm`
- 🔍 Trace: `test-results/expense-workflow-chromium/trace.zip`

**Fix Recommendations**:
1. Check if button selector changed in recent commits
2. Verify button is visible/enabled (not hidden by CSS)
3. Review component rendering logic
4. Run test locally with --debug flag

## Quick Fixes
- Check if button text changed from "Add" to something else
- Verify ExpenseForm renders submit button correctly

## Debugging Commands
npx playwright test expense-workflow --project=chromium --debug
```

### Visual Regression

```
=== E2E TEST FAILURE ANALYSIS ===

## Summary
- Total Tests: 8
- Passed: 7 ✅
- Failed: 1 ❌
- Pass Rate: 87.5%

## Failed Tests

### 1. CurrencySelector › Visual: Currency dropdown [webkit]
**File**: `tests/visual/currency-selector.spec.ts:10`
**Error Type**: Visual Regression
**Duration**: 1250ms

**Error Message**:
Screenshot comparison failed: 127 pixels (0.05%) differ

**Artifacts**:
- 📸 Expected: `tests/visual/currency-selector-webkit-expected.png`
- 📸 Actual: `test-results/currency-selector-webkit-actual.png`
- 📸 Diff: `test-results/currency-selector-webkit-diff.png`

**Fix Recommendations**:
1. View diff image to see exact pixel changes
2. Check CSS changes in recent commits
3. If change is intentional: Add [update-snapshots] to commit message
4. If change is unintentional: Investigate CSS regression

## Quick Fixes
- Review diff image to understand visual change
- Update snapshots if styling change was intentional

## Debugging Commands
# View diff image
open test-results/currency-selector-webkit-diff.png

# Update snapshots (if intentional change)
git commit -m "feat(frontend): Update currency selector [update-snapshots]"
```

## Error Type Categories

The skill classifies failures into these categories:

### Timeout Errors
**Pattern**: `Timeout.*exceeded`, `waiting for`, `locator.click: Timeout`

**Common Causes**:
- Element selector changed
- Element is hidden or disabled
- Animation/transition delays
- Race conditions in async operations

**Debugging Steps**:
- Check selector accuracy
- Verify element visibility
- Review component rendering logic
- Increase timeout if legitimately slow

### Assertion Failures
**Pattern**: `expect.*to.*`, `Expected.*Received`, `toBe`, `toHaveText`

**Common Causes**:
- Business logic changed
- State management bug
- Timing issues (async assertions)
- Test expectations outdated

**Debugging Steps**:
- Review expected vs actual values
- Check recent logic changes
- Verify test expectations are still valid

### Visual Regressions
**Pattern**: `toHaveScreenshot`, `Screenshot comparison failed`, `pixels differ`

**Common Causes**:
- CSS changes (intentional or bugs)
- Font rendering differences
- Browser engine differences
- Outdated snapshots

**Debugging Steps**:
- View diff image
- Review CSS changes
- Update snapshots if intentional
- Investigate regression if not

### Navigation/Routing Errors
**Pattern**: `page.goto`, `Navigation failed`, `net::ERR_`

**Common Causes**:
- Backend server not running
- Incorrect URL configuration
- CORS issues
- Network failures

**Debugging Steps**:
- Verify backend is running
- Check URL configuration
- Review network tab in trace
- Check CORS settings

## Debugging Artifacts

### Screenshots (`.png`)
- **When Created**: Automatically on test failure
- **Location**: `test-results/{test-name}-{browser}/test-failed-{n}.png`
- **Use Case**: See exact UI state at failure moment
- **View**: Open in image viewer or browser

### Videos (`.webm`)
- **When Created**: Configurable (on failure by default)
- **Location**: `test-results/{test-name}-{browser}/video.webm`
- **Use Case**: Watch full test execution to understand context
- **View**: Open in video player or browser

### Traces (`.zip`)
- **When Created**: On first retry (configurable)
- **Location**: `test-results/{test-name}-{browser}/trace.zip`
- **Use Case**: Deep debugging with timeline, network, console
- **View**: `npx playwright show-trace trace.zip`

### Visual Snapshots (visual tests only)
- **Expected**: `*-expected.png` (baseline)
- **Actual**: `*-actual.png` (current run)
- **Diff**: `*-diff.png` (pixel differences highlighted)
- **Use Case**: Compare visual changes pixel-by-pixel

## Troubleshooting

### No Test Results Found

**Symptom**: `test-results/` directory is empty

**Solutions**:
```bash
# Run tests to generate results
npm run test:e2e:docker

# Or run specific test
npx playwright test expense-workflow
```

### Artifacts Missing

**Symptom**: Screenshots/videos referenced but files don't exist

**Cause**: Artifacts cleaned up or test skipped

**Solution**: Re-run failed test to regenerate artifacts

### CI vs Local Differences

**Symptom**: Tests pass locally but fail in CI

**Common Causes**:
- Visual snapshots are Linux-based (CI environment)
- Environment differences (OS, browser versions)
- Timing differences (CI may be slower)

**Solution**:
- For visual tests: Update snapshots via CI workflow (`[update-snapshots]`)
- For other failures: Check `TEST_ENV` variable and environment-specific issues

## Related Files

- **Skill Definition**: `.claude/skills/e2e-failure-analysis/analysis.yaml`
- **Test Results**: `packages/frontend/test-results/`
- **HTML Report**: `packages/frontend/playwright-report/`
- **Test Configuration**: `packages/frontend/playwright.config.ts`
- **Test Files**: `packages/frontend/tests/e2e/*.spec.ts`
- **Documentation**: `CLAUDE.md` (Playwright E2E Testing section)

## Future Enhancements (Phase 2+)

### Git Notes Integration
Store failure metadata in git notes for historical analysis:

```ini
[metadata]
timestamp = 2025-10-26T14:32:10Z
commit = abc123f
run_url = https://github.com/.../runs/12345

[failure.1]
test_file = expense-workflow.spec.ts
test_name = should add expense with Enter key
browser = chromium
error_type = timeout
error_message = Timeout waiting for button
first_seen = abc123f
failure_count = 1
```

### Trend Analysis
- Identify new vs recurring failures
- Track failure frequency over time
- Detect flaky tests (intermittent failures)
- Find failure introduction point (blame commit)

### Pattern Recognition
- Detect browser-specific failure patterns
- Identify time-based failures (CI slowness)
- Recognize environment-specific issues
- Correlate failures with code changes

## Contributing

When extending this skill:

1. **Keep focus on quick diagnosis** (primary goal)
2. **Maintain actionable recommendations** (not just data dumps)
3. **Reference artifacts, don't embed** (screenshots stay as files)
4. **Categorize by error type** (enables targeted recommendations)
5. **Stay extensible** (prepare for git notes integration)

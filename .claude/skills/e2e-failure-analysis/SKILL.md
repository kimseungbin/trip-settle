---
name: E2E Failure Analysis
description: Analyze Playwright E2E test failures to quickly diagnose issues and provide fix recommendations. Use when E2E tests fail in CI or locally.
---

# E2E Failure Analysis

This skill analyzes Playwright E2E test failures to help you quickly understand what broke and how to fix it.

## When to Use

Invoke this skill when:
- E2E tests fail in GitHub Actions CI
- User asks "What E2E tests failed?"
- User asks "Why did my E2E tests fail?"
- User asks "Show me the E2E test failures"
- User mentions "Playwright failures", "test failures", or "E2E errors"

## Instructions

When analyzing E2E test failures:

1. **Read the analysis guide**:
   - Read `.claude/skills/e2e-failure-analysis/analysis.yaml`
   - Understand the failure analysis workflow

2. **Use git-notes-helper for git notes operations** (Phase 2-3 features):
   - This skill depends on `.claude/skills/git-notes-helper/helper.yaml`
   - Reference git-notes-helper Operations 1-8 for fetching, parsing, and analyzing notes
   - Use namespace: `ci/e2e-failures`

3. **Locate failure data**:
   - **Prefer git notes** (fastest, for CI failures)
   - Fall back to `packages/frontend/test-results/` for local analysis
   - Parse `results.json` or `.json` reporter output

4. **Extract failure information**:
   - Which tests failed (file, test name, browser)
   - Error messages and stack traces
   - Artifact locations (screenshots, videos, traces)

5. **Categorize failures**:
   - Timeout errors
   - Assertion failures
   - Visual regressions
   - Setup/teardown errors

6. **Present findings**:
   - Summary of failures
   - Detailed error information per test
   - Links to debugging artifacts
   - Actionable fix recommendations

7. **Use Phase 3 features** (advanced analysis):
   - Flaky Test Detection (Operation 7)
   - Failure Trend Analysis (Operations 6, 7)
   - Blame Integration (Operation 6)
   - Comparison Reports (Operation 8)
   - Automatic Regression Detection (Operations 2, 3, 5, 8)

## Example Workflow

```
User: "E2E tests failed, what's wrong?"

1. Read analysis.yaml for instructions
2. Check for test results: packages/frontend/test-results/
3. Parse results.json or reporter output
4. Extract failed tests:
   - expense-workflow.spec.ts: Timeout waiting for button
   - currency-selector.spec.ts: Visual regression
5. Categorize: 1 timeout, 1 visual
6. Present findings with debugging steps:
   - Timeout: Check selector, review recent UI changes
   - Visual: Show diff image path, suggest snapshot update
```

## Analysis Guide Location

The detailed analysis instructions are in: `.claude/skills/e2e-failure-analysis/analysis.yaml`

This file includes:
- Failure detection methods
- Error categorization logic
- Debugging recommendation templates
- Artifact reference patterns

## Key Features

- **Fast Diagnosis**: Quickly identify which tests failed and why
- **Error Categorization**: Classify failures by type (timeout, assertion, visual, etc.)
- **Artifact Links**: Direct paths to screenshots, videos, traces
- **Fix Recommendations**: Actionable debugging steps based on error type
- **Browser-Specific Detection**: Identify if failures are browser-specific
- **Flaky Test Detection** (Phase 3): Identify unreliable tests with intermittent failures
- **Historical Analysis** (Phase 3): Track test reliability across commits

## Notes

- Works with local test runs (`packages/frontend/test-results/`)
- Future: Will integrate with git notes for CI failure history
- Screenshots/videos referenced by path (not embedded)
- Focus on actionable insights, not exhaustive logs

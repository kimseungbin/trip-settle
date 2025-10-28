# Extract E2E Failures Action

TypeScript GitHub Action that extracts E2E test failure metadata from Playwright JSON reporter output and generates INI-format notes for git notes storage.

## Overview

This action replaces the Node.js script `.github/scripts/extract-e2e-failures.js` with a type-safe TypeScript implementation. It parses Playwright test results, categorizes failures, and generates structured metadata for CI/CD analysis.

## Features

- ✅ **Type-safe Playwright schema** - Full TypeScript interfaces for JSON reporter
- ✅ **Error classification** - Categorizes failures (timeout, visual, assertion, navigation, setup)
- ✅ **Artifact tracking** - Extracts screenshot, video, and trace file paths
- ✅ **INI format output** - Generates git notes-compatible metadata
- ✅ **Structured outputs** - Provides test statistics as action outputs

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `results-path` | Path to Playwright JSON results file | Yes | `packages/frontend/test-results/results.json` |
| `output-path` | Path to output INI-format note file | Yes | `e2e-failure-note.txt` |

## Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `tests-total` | Total number of tests executed | `"42"` |
| `tests-passed` | Number of tests that passed | `"40"` |
| `tests-failed` | Number of tests that failed | `"2"` |
| `tests-skipped` | Number of tests that were skipped | `"0"` |
| `pass-rate` | Test pass rate percentage | `"95.5"` |
| `failures-count` | Number of test failures detected | `"2"` |

## Usage

```yaml
- name: Extract E2E failure metadata
  id: extract
  uses: ./.github/actions/extract-e2e-failures
  with:
    results-path: packages/frontend/test-results/results.json
    output-path: e2e-failure-note.txt

- name: Use outputs
  run: |
    echo "Tests: ${{ steps.extract.outputs.tests-total }}"
    echo "Passed: ${{ steps.extract.outputs.tests-passed }}"
    echo "Failed: ${{ steps.extract.outputs.tests-failed }}"
    echo "Pass rate: ${{ steps.extract.outputs.pass-rate }}%"

- name: Store in git notes
  run: |
    git notes --ref=ci/e2e-failures add -F e2e-failure-note.txt ${{ github.sha }}
    git push origin refs/notes/ci/e2e-failures
```

## Error Classification

The action automatically classifies failures into categories:

- **timeout** - Test exceeded time limit
- **visual_regression** - Screenshot/snapshot comparison failed
- **assertion** - Assertion/expectation failed
- **navigation** - Page navigation or network error
- **setup_teardown** - beforeEach/afterEach/beforeAll/afterAll hook failed
- **unknown** - Unclassified error

## Output Format

The action generates INI-format metadata:

```ini
=== E2E TEST FAILURE REPORT ===

[metadata]
timestamp = 2025-10-28T12:00:00.000Z
commit = a1b2c3d
branch = main
run_url = https://github.com/user/repo/actions/runs/123456
total_tests = 42
passed = 40
failed = 2
skipped = 0
pass_rate = 95.2%
duration_sec = 120

[summary]
status = FAILED
new_failures = 2
timeout_failures = 1
visual_failures = 0
assertion_failures = 1
navigation_failures = 0
setup_failures = 0

[failure.1]
test_file = tests/e2e/expense-workflow.spec.ts
test_name = Expense workflow › should add expense
browser = chromium
error_type = timeout
error_message = Test timeout of 30000ms exceeded
duration_ms = 30500
screenshots = test-results/expense-workflow-chromium/test-failed-1.png
videos = none
traces = test-results/expense-workflow-chromium/trace.zip

[diagnostics]
playwright_version = 1.56.1
test_env = ci-docker
workers = 4
reporter_output = packages/frontend/test-results/results.json
artifacts_uploaded = yes (GitHub Actions)
```

## Development

### Build

```bash
npm install
npm run build
```

The build process uses `@vercel/ncc` to bundle the action into a single `dist/index.js` file with all dependencies included.

### Test

```bash
npm test
```

### Format

```bash
npm run format
```

### All checks

```bash
npm run all
```

## Benefits over Node.js Script

✅ **Type safety** - Playwright JSON schema is fully typed
✅ **Better error handling** - Structured error messages with `core.setFailed()`
✅ **Action outputs** - Test statistics available as workflow outputs
✅ **Easier testing** - Unit tests with Jest instead of manual testing
✅ **Maintainability** - TypeScript is easier to refactor and understand
✅ **Error classification** - Type-safe error categorization logic

## Migration from Node.js Script

The Node.js script `.github/scripts/extract-e2e-failures.js` can be removed after verifying this action works correctly in CI.

## License

MIT

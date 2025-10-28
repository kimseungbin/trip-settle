# Generate Failure Report Action

TypeScript GitHub Action that generates CI failure reports by aggregating build errors and test failures into a unified markdown document.

## Overview

This action replaces the Node.js script `.github/scripts/generate-failure-report.js` with a type-safe TypeScript implementation. It parses build logs, extracts TypeScript compilation errors, and generates human-readable markdown reports optimized for Claude Code analysis.

## Features

- ✅ **TypeScript error parsing** - Extracts file, line, column, error code, and message
- ✅ **Error grouping** - Groups errors by file for better readability
- ✅ **Generic error detection** - Captures non-TypeScript build failures
- ✅ **CI context** - Includes workflow run URL, commit SHA, and timestamp
- ✅ **Actionable guidance** - Provides fix instructions and Claude Code integration tips
- ✅ **Type safety** - Full TypeScript types for error structures

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `build-log-path` | Path to build log file | No | `build-log.txt` |
| `output-path` | Path to output markdown report | No | `ci-failure-report.md` |

## Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `report-path` | Path to the generated report file | `ci-failure-report.md` |

## Usage

```yaml
- name: Build all packages
  run: npm run build 2>&1 | tee build-log.txt
  continue-on-error: true
  id: build

- name: Generate failure report
  if: steps.build.outcome == 'failure'
  uses: ./.github/actions/generate-failure-report
  with:
    build-log-path: build-log.txt
    output-path: ci-failure-report.md

- name: Upload failure report
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: ci-failure-report
    path: ci-failure-report.md
    retention-days: 30

- name: Add report to job summary
  if: failure() && hashFiles('ci-failure-report.md') != ''
  run: cat ci-failure-report.md >> $GITHUB_STEP_SUMMARY
```

## Error Detection

The action detects two types of errors:

### TypeScript Compilation Errors

Pattern: `path/to/file.ts(line,col): error TS1234: message`

Example:
```
packages/frontend/src/App.svelte.ts(42,10): error TS2304: Cannot find name 'foo'.
```

Extracted as:
```typescript
{
  file: "packages/frontend/src/App.svelte.ts",
  line: 42,
  column: 10,
  code: "TS2304",
  message: "Cannot find name 'foo'.",
  type: "typescript"
}
```

### Generic Build Errors

Pattern: `error <message>`

Example:
```
error Command failed with exit code 1.
```

## Output Format

The action generates a markdown report with this structure:

```markdown
# CI Failure Report

**Generated:** 2025-10-28T12:00:00.000Z

**Workflow Run:** [#123456](https://github.com/user/repo/actions/runs/123456)

**Commit:** [`a1b2c3d`](https://github.com/user/repo/commit/a1b2c3d)

**Ref:** `refs/heads/main`

---

## Build Failures

**Total Errors:** 3

### `packages/frontend/src/App.svelte.ts`

**Line 42:10** - `TS2304`

\`\`\`
Cannot find name 'foo'.
\`\`\`

**Line 55:20** - `TS2345`

\`\`\`
Argument of type 'string' is not assignable to parameter of type 'number'.
\`\`\`

### General Build Errors

- Command failed with exit code 1.

---

## How to Fix

1. Review the errors above and identify the root cause
2. Fix the issues locally and ensure tests pass
3. Run `npm run build` to verify the build succeeds
4. Commit and push your changes

## Need Help?

You can provide this report to Claude Code for assistance:
1. Download this artifact from the GitHub Actions run
2. Share the report with Claude Code
3. Claude Code will analyze the errors and suggest fixes
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

✅ **Type safety** - Error structures are fully typed
✅ **Better error handling** - Structured error messages with `core.setFailed()`
✅ **Action outputs** - Report path available as workflow output
✅ **Easier testing** - Unit tests with Jest instead of manual testing
✅ **Cleaner code** - TypeScript's type system catches bugs early
✅ **Maintainability** - TypeScript is easier to refactor and understand

## Migration from Node.js Script

The Node.js script `.github/scripts/generate-failure-report.js` can be removed after verifying this action works correctly in CI.

## License

MIT

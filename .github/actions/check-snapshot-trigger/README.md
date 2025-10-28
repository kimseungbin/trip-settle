# Check Snapshot Trigger Action

TypeScript GitHub Action that determines if the visual snapshot update workflow should run based on the trigger method.

## Overview

This action replaces the shell script `.github/scripts/snapshots/check-trigger.sh` with a type-safe TypeScript implementation. It detects three trigger methods:

1. **Manual `workflow_dispatch`** - Triggered from GitHub UI
2. **PR comment** - Comment containing `/update-snapshots` on a pull request
3. **Commit footer** - Commit message containing `Snapshots: update`

## Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `should_run` | Whether workflow should run | `"true"` or `"false"` |
| `branch` | Branch to update snapshots on | `"main"` or custom branch |
| `test_scope` | Test scope to run | `"all"`, `"visual"`, or `"e2e"` |

## Usage

```yaml
- name: Check trigger condition
  id: check
  uses: ./.github/actions/check-snapshot-trigger

- name: Use outputs
  if: steps.check.outputs.should_run == 'true'
  run: |
    echo "Running snapshots on branch: ${{ steps.check.outputs.branch }}"
    echo "Test scope: ${{ steps.check.outputs.test_scope }}"
```

## Test Scope

The `test_scope` output enables selective test execution for faster updates:

- **`all`** (default) - Run all visual tests (safest)
- **`visual`** - Run only `tests/visual/` tests
- **`e2e`** - Run only `tests/e2e/` tests

Specify scope in commit message:

```
feat: Update button styling

Snapshots: update:visual
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

## Benefits over Shell Script

✅ **Type safety** - GitHub event payloads are type-checked
✅ **Better error handling** - Structured error messages with `core.setFailed()`
✅ **Easier testing** - Unit tests with Jest instead of bash assertions
✅ **Cleaner logic** - No more complex `jq` parsing chains
✅ **Better logging** - GitHub Actions toolkit provides structured logging
✅ **Maintainability** - TypeScript is easier to refactor and understand

## Migration from Shell Script

The shell script `.github/scripts/snapshots/check-trigger.sh` can be removed after verifying this action works correctly in CI.

## License

MIT

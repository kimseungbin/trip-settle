# CI/CD Pipeline

This document explains the continuous integration and deployment pipeline for Trip Settle, including optimizations, metrics, and troubleshooting.

## Table of Contents

- [Pipeline Overview](#pipeline-overview)
- [Running CI Checks Locally](#running-ci-checks-locally)
- [CI Optimizations](#ci-optimizations)
- [Docker Build Cache Metrics](#docker-build-cache-metrics)
- [CI Failure Reports](#ci-failure-reports)
- [What to Do When CI Fails](#what-to-do-when-ci-fails)

## Pipeline Overview

The project uses GitHub Actions to automatically validate code changes. Every push and pull request triggers a comprehensive CI pipeline.

### What Runs in CI

The CI workflow runs **4 jobs in parallel** for fast feedback:

1. **Code Quality** (~2 min) - Formatting, linting, type-checking
2. **Build** (~2 min) - Compiles all packages (frontend, backend, infra)
3. **Unit Tests** (~1 min) - Fast tests for frontend (Vitest) and backend (Vitest)
4. **E2E Tests** (~5-7 min) - End-to-end tests via Docker + Playwright

**Total CI time**: ~7-8 minutes (jobs run in parallel)

## Running CI Checks Locally

**Before pushing**, run the same checks CI will run to avoid failures:

```bash
# Code quality (formatting, linting, type-checking)
npm run format:check && npm run lint && npm run type-check --workspace=frontend

# Build all packages
npm run build

# Unit tests (fast)
npm run test:unit --workspace=frontend  # Frontend unit tests
npm run test --workspace=backend        # Backend unit tests

# E2E tests (slower, run before push)
npm run test:e2e:docker  # Full E2E test suite with Docker
```

**Pre-commit hooks** automatically run formatting, linting, and build checks. See the main README's Git Hooks section.

## CI Optimizations

The CI pipeline is optimized for speed and efficiency:

- **Parallel execution**: Quality checks run concurrently with builds and tests
- **Docker layer caching**: GitHub Actions cache persists build layers across runs
- **Reduced browser matrix**: Tests run on 2 browsers (Chromium + WebKit) instead of 4
- **Optimized Dockerfile**: Layer ordering preserves npm cache when only code changes

**Performance gains**: 40-50% faster than sequential execution (~12-15 min → 7-8 min)

### Parallel Execution Strategy

**4 jobs run concurrently**:
- Quality checks, build, unit tests, E2E tests
- **Smart dependencies**: E2E depends only on build, not quality (maximizes parallelism)
- **Docker layer caching**: 71% cache hit rate, 90% time savings vs cold builds
- **Base image caching**: Playwright image (786MB) cached, saves 46 seconds per build

### Cache Strategy

All CI jobs reuse a shared setup action that ensures consistent caching:

```yaml
# .github/actions/setup-node-project/action.yml (Reused across all jobs)
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
      node-version: '24'
      cache: 'npm'
      cache-dependency-path: './package-lock.json'

- name: Install dependencies
  run: npm ci # Installs all workspaces (root + packages)
```

**Cache effectiveness by change type:**

- Code-only changes: Full cache hit (~0s install)
- Single package update: Partial cache hit - root deps cached (~15s install vs 30-40s)
- Root tooling update: Partial cache hit - package deps cached (~20s install)

## Docker Build Cache Metrics

CI automatically tracks Docker build efficiency with detailed metrics:

- **Cache hit rate**: Percentage of layers reused vs. rebuilt
- **Per-layer timing**: Identifies slow build steps
- **Build duration**: Tracks performance improvements over time

View metrics in the "e2e-tests" job summary after each CI run.

**Git notes storage**: Metrics are stored in `refs/notes/ci/cache-metrics` for historical analysis.

### Analyzing Cache Performance

Use the `workflow-analysis` skill to analyze Docker cache trends:

```bash
# Fetch cache metrics from git notes
git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics

# View metrics for a specific commit
git notes --ref=ci/cache-metrics show <commit-hash>
```

For detailed cache analysis, see `.claude/skills/workflow-analysis/guides/docker-cache.md`.

## CI Failure Reports

When GitHub Actions workflows fail, downloadable reports are automatically generated to help diagnose issues. These reports are optimized for both human developers and AI assistants like Claude Code.

### Available Reports

**Build Failures** (`ci-failure-report.md`):

- Aggregates TypeScript compilation errors
- Groups errors by file with line numbers
- Includes error codes and messages
- Available as a downloadable artifact

**E2E Test Failures** (Playwright reports):

- HTML test report with screenshots
- Test results with stack traces
- Visual diff images for failed tests

### How to Access Reports

1. **GitHub Actions UI**:
    - Go to the failed workflow run
    - Scroll to bottom → "Artifacts" section
    - Download `ci-failure-report` (build errors) or `playwright-report` (E2E failures)

2. **Job Summary**:
    - The CI failure report is also displayed in the workflow job summary
    - Click on the "All Checks Passed" job to view inline

### Using Reports with Claude Code

These reports are designed to be Claude Code-friendly:

```bash
# 1. Download the ci-failure-report.md artifact from GitHub Actions
# 2. In Claude Code, share the report:
"Here's my CI failure report, can you help me fix it?"
# 3. Attach the ci-failure-report.md file

# Claude Code will analyze the errors and suggest fixes
```

### What Gets Captured

The CI workflow captures failure information using several techniques:

- **Build logs**: Uses `tee` command to capture output while displaying it real-time

    ```bash
    npm run build 2>&1 | tee build-log.txt
    ```

    - `2>&1` redirects stderr to stdout (combines all output)
    - `tee` writes to both file and terminal simultaneously
    - Logs are uploaded as artifacts on failure

- **Test reports**: Playwright automatically generates HTML reports
- **Summary generation**: Node.js script parses logs and creates structured markdown

### Technical Details

**How `tee` Works**:
The `tee` command is like a T-shaped pipe fitting - it duplicates input to multiple destinations:

- Writes output to a file (`build-log.txt`)
- Also prints to stdout (visible in GitHub Actions UI)
- This ensures you get both real-time logs AND saved artifacts

**Failure Report Script**: `.github/scripts/generate-failure-report.js`

- Parses TypeScript errors using regex patterns
- Groups errors by file for easy navigation
- Includes git context (commit SHA, branch, run URL)
- Runs only when failures are detected

## What to Do When CI Fails

1. **Check the job summary** - Click on the failed job to see details
2. **Download artifacts** - Failed builds/tests generate downloadable reports
3. **Run checks locally** - Reproduce the failure with local commands above
4. **Analyze with tools** - Use the `workflow-analysis` skill for deeper investigation

### E2E Test Failures

For E2E test failures, use the `workflow-analysis` skill:

```bash
# Fetch E2E failure notes from git notes
git fetch origin refs/notes/ci/e2e-failures:refs/notes/ci/e2e-failures

# View failure metadata for a specific commit
git notes --ref=ci/e2e-failures show <commit-hash>
```

See `.claude/skills/workflow-analysis/guides/e2e-tests.md` for detailed E2E failure analysis.

### Snapshot Update Failures

For visual snapshot update workflow failures:

```bash
# Fetch snapshot update notes
git fetch origin refs/notes/ci/snapshot-updates:refs/notes/ci/snapshot-updates

# View snapshot update metadata
git notes --ref=ci/snapshot-updates show <commit-hash>
```

See `.claude/skills/workflow-analysis/guides/snapshots.md` for snapshot update troubleshooting.

### Workflow Performance Issues

For workflow timing and performance analysis:

```bash
# Fetch workflow metrics
git fetch origin refs/notes/ci/workflow-metrics:refs/notes/ci/workflow-metrics

# View timing metrics for a specific commit
git notes --ref=ci/workflow-metrics show <commit-hash>
```

See `.claude/skills/workflow-analysis/guides/workflows.md` for workflow performance analysis.

---
name: ci-failure-analysis
description: Analyze GitHub Actions CI/CD failures using git notes. Covers workflow issues, Docker cache, E2E tests, and snapshot updates. Use when CI fails or performance degrades.
---

# CI Failure Analysis Skill

This skill provides comprehensive analysis of GitHub Actions CI/CD failures using git notes metadata.

## When to Use

- CI workflow fails or won't start
- E2E tests fail in CI
- Docker builds are slow or failing
- Visual snapshot updates fail
- Performance degradation in CI

## How It Works

1. **Identifies failure type** from user description
2. **Routes to appropriate guide** for detailed analysis
3. **Uses git notes** for historical data and trends
4. **Provides actionable fixes** with code examples

## Available Guides

### `guides/workflows.md` - Workflow & Job Failures
**Use when:**
- Workflow fails to start
- Jobs fail with syntax errors
- Job dependency errors
- Permission denied errors
- Timeouts or performance issues

**Common fixes:**
- Fix job dependency references
- Correct YAML syntax
- Add missing permissions
- Remove obsolete imports (e.g., source-map-support)

### `guides/docker-cache.md` - Docker Build Cache Analysis
**Use when:**
- Docker builds are slow
- Cache hit rate is low
- Want to optimize build performance
- Analyzing build trends

**Capabilities:**
- Parse cache metrics from git notes
- Calculate hit/miss rates
- Identify inefficient layer ordering
- Track performance trends

### `guides/e2e-failures.md` - E2E Test Failure Analysis
**Use when:**
- Playwright tests fail
- Need to categorize test failures
- Want failure recommendations
- Analyzing flaky tests

**Capabilities:**
- Parse test results from git notes
- Categorize by error type
- Show artifacts and screenshots
- Provide fix recommendations

### `guides/snapshots.md` - Snapshot Update Analysis
**Use when:**
- Snapshot update workflow fails
- Want to track update history
- Analyzing update triggers
- Checking workflow performance

**Capabilities:**
- Parse snapshot workflow metadata
- Show trigger reasons
- Track success/failure rates
- Identify timing issues

## Git Notes Integration

All guides use the `git-notes-helper` skill for consistent git notes operations:
- Fetching notes from remote
- Parsing INI-format metadata
- Historical trend analysis
- Comparative analysis across commits

Reference: `.claude/skills/git-notes-helper/helper.yaml`

## Quick Start

**User**: "CI is failing"
**Claude Code**:
1. Asks for clarification (which workflow/job?)
2. Routes to appropriate guide
3. Fetches git notes if available
4. Analyzes and provides fix

**User**: "Deploy workflow won't run"
**Claude Code**:
1. Loads `guides/workflows.md`
2. Checks for syntax/dependency errors
3. Tests locally if possible
4. Provides specific fix with code

## Cross-Guide Analysis

The skill can correlate issues across domains:
- Slow Docker build → E2E timeout
- Workflow syntax error → No metrics captured
- Permission error → Snapshot update fails

## Implementation Notes

Each guide is loaded on-demand based on failure type. The main skill file (this file) provides routing logic and shared context.
---
name: workflow-analysis
description: Analyze GitHub Actions workflows using git notes metadata. Covers workflow failures, performance metrics, Docker cache optimization, E2E test analysis, and snapshot updates. Use when workflows fail or performance degrades.
---

# Workflow Analysis Skill

This skill provides comprehensive analysis of GitHub Actions workflows using git notes metadata.

## When to Use

- Any GitHub Actions workflow fails or won't start
- CI pipeline (test/lint/build) issues
- Deployment workflows fail (CDK, Pages)
- E2E tests fail or are flaky
- Docker builds are slow or failing
- Visual snapshot updates fail
- Performance degradation in any workflow
- Need to analyze workflow metrics or trends

## How It Works

1. **Identifies failure type** from user description
2. **Routes to appropriate guide** for detailed analysis
3. **Uses git notes** for historical data and trends
4. **Provides actionable fixes** with code examples

## Available Guides

### `guides/git-notes.md` - Git Notes Operations (NEW)
**Use when:**
- Need to fetch/parse git notes
- Understanding git notes structure
- Common operations reference

**Provides:**
- Fetching notes from remote
- Parsing INI-format metadata
- Historical trend analysis patterns
- Best practices and examples

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

All workflow analysis relies on git notes metadata captured during CI runs. The `guides/git-notes.md` provides common operations for:
- Fetching notes from remote
- Parsing INI-format metadata
- Historical trend analysis
- Comparative analysis across commits

Each analysis guide references git-notes operations as needed.

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
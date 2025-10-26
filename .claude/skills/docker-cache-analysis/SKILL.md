---
name: Docker Cache Analysis
description: Analyze Docker build cache efficiency in GitHub Actions CI from git notes. Use when user asks about cache performance, trends, or optimization opportunities.
---

# Docker Cache Analysis

This skill analyzes Docker build cache efficiency metrics captured by GitHub Actions CI and stored in git notes.

## When to Use

Invoke this skill when the user:
- Asks about Docker cache performance or trends
- Requests cache efficiency analysis
- Wants to know why cache hit rates changed
- Asks to review build optimization opportunities
- Mentions "docker cache", "build performance", or "cache metrics"

## Instructions

When analyzing Docker build cache performance:

1. **Read the analysis guide**:
   - Read `.claude/skills/docker-cache-analysis/analysis.yaml`
   - Understand the metrics structure and analysis steps

2. **Use git-notes-helper for git notes operations**:
   - This skill depends on `.claude/skills/git-notes-helper/helper.yaml`
   - Reference git-notes-helper Operations 1-8 for fetching, parsing, and analyzing notes
   - Use namespace: `ci/cache-metrics`

3. **Extract and analyze cache metrics**:
   - Fetch notes using git-notes-helper Operation 1
   - Parse INI-format notes (timestamp, cache_status, change_type, etc.)
   - Use git-notes-helper Operation 5 for field extraction
   - Use git-notes-helper Operation 7 for historical analysis

4. **Analyze trends** (domain-specific):
   - Calculate base image cache hit rate
   - Group by change type (code-only, deps, dockerfile)
   - Identify degradation points or anomalies
   - Compare current vs historical performance

5. **Present findings**:
   - Summary statistics (hit rate, time saved)
   - Breakdown by change type
   - Trend identification
   - Actionable recommendations

## Example Workflow

```
User: "Analyze cache trends"

1. Read analysis.yaml for instructions
2. Fetch git notes: git fetch origin refs/notes/ci/cache-metrics
3. Extract metrics from last 20 commits
4. Calculate base image hit rate: 85% (17/20)
5. Group by change type:
   - code-only: 95% hit rate ✓
   - deps: 60% hit rate (expected)
   - dockerfile: 0% hit rate (expected)
6. Present findings:
   - Base cache saves ~46s per build
   - Total time saved: ~13 minutes
   - No concerning degradation patterns
   - Recommendations: Cache working optimally
```

## Analysis Guide Location

The detailed analysis instructions are in: `.claude/skills/docker-cache-analysis/analysis.yaml`

This file includes:
- Metric extraction commands
- Parsing templates
- Trend analysis patterns
- Common issues and solutions
- Output format templates

## Key Metrics

- **Base Image Cache Hit Rate**: % of builds that load 786MB Playwright image from cache vs downloading
- **Cache Status**: HIT (optimal), MISS (suboptimal), or PARTIAL
- **Change Type**: code-only, deps (package.json), dockerfile
- **Time Saved**: Builds with cache HIT save ~46 seconds each

## Notes

- Git notes must be fetched explicitly (not fetched by default)
- Notes are stored in `refs/notes/ci/cache-metrics` namespace
- If no notes exist, CI workflow needs cache capture step
- Cache misses are expected for dependency and Dockerfile changes
- Code-only changes should have high cache hit rates (>80%)
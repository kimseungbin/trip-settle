---
name: Workflow Metrics Analysis
description: Analyze GitHub Actions workflow job and step timing metrics from git notes. Use when user asks about CI performance, job duration trends, or workflow optimization opportunities.
---

# Workflow Metrics Analysis

This skill analyzes GitHub Actions workflow timing metrics captured by CI and stored in git notes.

## When to Use

Invoke this skill when the user:
- Asks about CI/CD performance or timing trends
- Requests workflow speed analysis
- Wants to know why jobs are taking longer
- Asks to review workflow optimization opportunities
- Mentions "workflow timing", "job duration", "CI speed", or "workflow metrics"

## Instructions

When analyzing GitHub Actions workflow performance:

1. **Read the analysis guide**:
   - Read `.claude/skills/workflow-metrics-analysis/analysis.yaml`
   - Understand the metrics structure and analysis steps

2. **Use git-notes-helper for git notes operations**:
   - This skill depends on `.claude/skills/git-notes-helper/helper.yaml`
   - Reference git-notes-helper Operations 1-8 for fetching, parsing, and analyzing notes
   - Use namespace: `ci/workflow-metrics`

3. **Extract and analyze workflow metrics**:
   - Fetch notes using git-notes-helper Operation 1
   - Parse INI-format notes (timestamp, job_name, job_duration_sec, steps[], etc.)
   - Use git-notes-helper Operation 5 for field extraction
   - Use git-notes-helper Operation 7 for historical analysis

4. **Analyze trends** (domain-specific):
   - Calculate average job duration by job name
   - Identify slowest jobs and steps
   - Track duration changes over time
   - Compare current vs historical performance
   - Spot regressions or improvements

5. **Present findings**:
   - Summary statistics (total time, slowest jobs)
   - Job-by-job breakdown with step details
   - Trend identification (getting faster/slower)
   - Actionable recommendations

## Example Workflow

```
User: "Analyze CI workflow performance"

1. Read analysis.yaml for instructions
2. Fetch git notes: git fetch origin refs/notes/ci/workflow-metrics
3. Extract metrics from last 20 workflow runs
4. Calculate average durations:
   - e2e-tests: avg 5.2min
   - build: avg 1.8min
   - code-format: avg 0.5min
5. Identify slowest steps:
   - e2e-tests → Run Playwright tests: 4.1min (79%)
   - build → Build all packages: 1.5min (83%)
6. Present findings:
   - Total workflow time: ~7min
   - Bottleneck: E2E tests (Playwright execution)
   - Trend: Stable over last 20 runs
   - Recommendations: Consider test parallelization
```

## Analysis Guide Location

The detailed analysis instructions are in: `.claude/skills/workflow-metrics-analysis/analysis.yaml`

This file includes:
- Metric extraction commands
- Parsing templates
- Trend analysis patterns
- Common issues and solutions
- Output format templates

## Key Metrics

- **Job Duration**: Total time for each job (code-format, lint, type-check, build, unit-tests, docker-images, e2e-tests)
- **Step Duration**: Time for individual steps within jobs
- **Total Workflow Time**: End-to-end CI execution time
- **Critical Path**: Longest serial dependency chain
- **Parallel Efficiency**: How well jobs run in parallel

## Notes

- Git notes must be fetched explicitly (not fetched by default)
- Notes are stored in `refs/notes/ci/workflow-metrics` namespace
- If no notes exist, CI workflow needs metrics capture step
- Timing includes queue time, setup, execution, and teardown
- Compare job durations across different change types for context
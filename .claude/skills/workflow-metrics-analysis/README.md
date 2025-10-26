# Workflow Metrics Analysis Skill

Analyze GitHub Actions workflow job and step timing metrics from git notes.

## Purpose

This skill provides comprehensive analysis of CI/CD pipeline performance by:
- Tracking job and step durations over time
- Identifying bottlenecks and slow steps
- Finding timing regressions after specific commits
- Calculating parallelization efficiency
- Recommending optimization targets

## When to Use

Invoke this skill when you need to:
- Understand why CI is slow
- Find which jobs or steps are bottlenecks
- Track performance trends over time
- Identify commits that caused regressions
- Prioritize workflow optimization efforts

## How It Works

### Metrics Capture (CI Workflow)

The CI workflow captures timing data using GitHub Actions API:

1. **Final job** runs after all other jobs complete
2. **Fetches job data** from GitHub API (`gh api repos/.../runs/.../jobs`)
3. **Extracts metrics**: job names, durations, step timings, conclusions
4. **Stores in git notes**: `refs/notes/ci/workflow-metrics` namespace
5. **Pushes to remote**: Team-wide access to metrics

### Analysis (Claude Code)

When you invoke this skill, Claude Code:

1. Fetches git notes from remote
2. Parses INI-format metrics for recent commits
3. Calculates averages, trends, and percentages
4. Identifies slowest jobs and steps
5. Compares to historical baseline
6. Provides prioritized recommendations

## Metrics Collected

### Job-Level Metrics
- Job name (code-format, lint, build, e2e-tests, etc.)
- Start/end timestamps
- Total duration in seconds
- Conclusion (success, failure, skipped)
- Number of steps

### Step-Level Metrics
- Step name
- Duration in seconds
- Percentage of total job time
- Conclusion status

### Workflow-Level Metrics
- Total workflow duration (end-to-end)
- Critical path (longest serial dependency chain)
- Parallel efficiency ratio
- Number of jobs passed/failed

## Example Usage

### Basic Performance Analysis
```
User: "Analyze CI workflow performance"

Claude analyzes last 20 workflow runs and reports:
- Average total time: 7min 15sec
- Slowest job: e2e-tests (5.2min, 72% of workflow)
- Top bottleneck: Playwright tests step (4.1min, 79% of e2e job)
- Recommendation: Parallelize Playwright tests across shards
```

### Regression Investigation
```
User: "Why did CI get slower?"

Claude compares recent metrics and identifies:
- Workflow time increased from 6min to 9min after commit abc123
- e2e-tests job duration jumped from 4min to 7min
- Root cause: Added 15 new E2E tests without sharding
- Recommendation: Implement test sharding to distribute load
```

### Job-Specific Analysis
```
User: "Show e2e-tests performance breakdown"

Claude extracts e2e-tests job data:
- Total duration: 5.2min average
- Step breakdown:
  1. Run Playwright tests: 4.1min (79%)
  2. Build images: 0.6min (12%)
  3. Setup: 0.3min (6%)
  4. Other: 0.2min (3%)
- Recommendation: Focus optimization on Playwright step
```

## Setup Requirements

### 1. CI Workflow Configuration

Add the capture-metrics job to `.github/workflows/ci.yml`:

```yaml
capture-metrics:
  name: Capture Workflow Metrics
  runs-on: ubuntu-latest
  needs: [code-format, lint, type-check, build, unit-tests, docker-images, e2e-tests]
  if: always()

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Capture workflow timing metrics
      run: |
        gh api repos/${{ github.repository }}/actions/runs/${{ github.run_id }}/jobs \
          --jq '.jobs[] | {name, started_at, completed_at, conclusion, steps}' \
          > jobs-raw.json

        .github/scripts/extract-workflow-metrics.sh jobs-raw.json workflow-note.txt

        git config user.name "github-actions[bot]"
        git config user.email "github-actions[bot]@users.noreply.github.com"
        git notes --ref=ci/workflow-metrics add -F workflow-note.txt ${{ github.sha }}
        git push origin refs/notes/ci/workflow-metrics
      env:
        GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Extraction Script

Create `.github/scripts/extract-workflow-metrics.sh`:

```bash
#!/bin/bash
# Extract workflow metrics from GitHub API JSON
# Usage: extract-workflow-metrics.sh <jobs.json> <output.txt>

INPUT_JSON=$1
OUTPUT_FILE=$2

# Parse JSON and generate INI format
# (Implementation details in analysis.yaml)

echo "timestamp = $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$OUTPUT_FILE"
echo "commit = $GITHUB_SHA" >> "$OUTPUT_FILE"
# ... parse jobs and steps ...
```

### 3. Git Notes Fetch

After CI runs, fetch notes locally:

```bash
git fetch origin refs/notes/ci/workflow-metrics:refs/notes/ci/workflow-metrics
```

## Dependencies

This skill depends on:
- **git-notes-helper**: Reusable git notes operations
- **GitHub Actions API**: Source of timing data
- **gh CLI**: Installed in GitHub Actions runners

## File Structure

```
.claude/skills/workflow-metrics-analysis/
├── SKILL.md         # Skill entry point (auto-discovered by Claude Code)
├── README.md        # This file (documentation for humans)
└── analysis.yaml    # Detailed analysis instructions
```

## Common Analysis Patterns

### Identify Critical Path
The critical path is the longest serial dependency chain that determines minimum workflow time:
```
code-format/lint/type-check (parallel, ~1min)
  ↓
build (~1.5min)
  ↓
docker-images (~2min)
  ↓
e2e-tests (~5min)
  ↓
Total: ~9.5min minimum
```

### Calculate Parallel Efficiency
```
Total job time: 12min (sum of all job durations)
Wall-clock time: 9min (actual elapsed time)
Parallel efficiency: 75% (12/9 ≈ 1.33× speedup)
```

### Find Optimization Targets
Prioritize by:
1. **Impact**: % of total workflow time
2. **Feasibility**: How easily can it be optimized?
3. **Trend**: Is it getting worse over time?

Example priority ranking:
1. **High**: E2E tests (72% of time, parallelizable)
2. **Medium**: Docker builds (21% of time, cache optimization)
3. **Low**: Setup overhead (7% of time, limited optimization potential)

## Limitations

- **Runner variance**: GitHub Actions runners have variable specs, causing 10-15% timing variance
- **Network latency**: Dependency downloads can vary significantly
- **Cold starts**: First run after cache expiration is always slower
- **Shared runners**: Peak hours may have contention

**Recommendation**: Analyze trends over multiple runs (10-20), not single data points.

## Related Skills

- **docker-cache-analysis**: Analyzes Docker build cache efficiency
- **e2e-failure-analysis**: Diagnoses Playwright E2E test failures
- **git-notes-helper**: Provides reusable git notes operations

## See Also

- Analysis instructions: `analysis.yaml`
- Git notes helper: `.claude/skills/git-notes-helper/helper.yaml`
- Docker cache analysis: `.claude/skills/docker-cache-analysis/analysis.yaml`
- GitHub Actions API: https://docs.github.com/en/rest/actions/workflow-runs
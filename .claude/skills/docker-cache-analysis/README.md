# Docker Cache Analysis Skill

Analyze Docker build cache efficiency in GitHub Actions CI from git notes stored by the pipeline.

## Purpose

This skill helps you understand and optimize Docker build cache performance by:
- Tracking cache hit rates over time
- Identifying when and why cache efficiency degraded
- Correlating cache performance with different types of changes
- Providing actionable recommendations for improvement

## Usage

### Invoke the Skill

```
User: "Analyze Docker cache trends"
User: "Show Docker build cache efficiency"
User: "Why did Docker cache efficiency drop?"
User: "Show Docker cache metrics for commit abc123"
```

Claude will automatically:
1. Fetch git notes with cache metrics
2. Parse and analyze the data
3. Present findings with visualizations
4. Provide recommendations

### Manual Analysis (Without Skill)

If you want to manually inspect cache metrics:

```bash
# Fetch cache metrics notes
git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics

# View metrics for current commit
git notes --ref=ci/cache-metrics show

# View metrics for specific commit
git notes --ref=ci/cache-metrics show abc123

# List all commits with cache metrics
git log --notes=ci/cache-metrics --format="%h %s" -20
```

## Prerequisites

The CI workflow must be configured to capture cache metrics. See `.github/workflows/ci.yml` for the "Capture cache metrics" step.

## How Metrics Are Captured

Understanding the full pipeline helps with troubleshooting and maintenance.

### CI Workflow Integration

Cache metrics are captured automatically in the GitHub Actions `e2e-tests` job:

```yaml
# .github/workflows/ci.yml (e2e-tests job)
- name: Capture Docker cache metrics
  if: always()  # Run even if tests fail
  run: |
    # Extract metrics from Docker build output
    .github/scripts/extract-cache-metrics.sh docker-build.log cache-note.txt

    # Store in git notes
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git notes --ref=ci/cache-metrics add -F cache-note.txt ${{ github.sha }}

    # Push to remote
    git push origin refs/notes/ci/cache-metrics
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**What happens:**
1. Docker build runs and outputs to log file
2. Extraction script parses log and generates INI-format note
3. Git note attached to commit using `refs/notes/ci/cache-metrics` namespace
4. Note pushed to remote for team access

### Extraction Script

**File**: `.github/scripts/extract-cache-metrics.sh`

**Input**: Docker BuildKit output (captured from build step)

**Processing**:
- Extracts total build time from final `DONE` line
- Counts cached vs built layers (grep for `CACHED`)
- Detects base image pulls (searches for `pulling.*playwright`)
- Calculates cache hit rate percentage

**Output**: INI-style note with sections for metadata, timing, cache stats, and layers

### Git Notes Storage

**Namespace**: `refs/notes/ci/cache-metrics`

**Why git notes?**
- Attach metadata to commits without changing commit history
- Store independently from code (separate ref)
- Team-wide visibility (pushed to remote)
- Commit-specific (each commit gets its own metrics)

**Note**: Git notes are NOT fetched by default. You must fetch them explicitly:

```bash
git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics
```

## Metrics Captured

The skill analyzes these metrics from git notes:

- **timestamp**: When the build occurred
- **commit**: Git commit hash
- **base_image**: Cache status (HIT/MISS)
- **cache_status**: Overall cache status
- **change_type**: Type of change (code-only, deps, dockerfile)
- **run_url**: Link to CI run for detailed logs

## Example Output

```
=== DOCKER CACHE EFFICIENCY ANALYSIS ===

Period: 2025-10-20 to 2025-10-24
Commits analyzed: 15

## Base Image Cache Performance

Cache Hit Rate: 87% (13/15)
- HIT: 13 builds (saved ~46s each)
- MISS: 2 builds (downloaded 786MB)

Total time saved: ~10 minutes

## Cache Efficiency by Change Type

code-only changes:
  - Total: 10
  - Base cache HIT: 100%
  - Status: ✓ Optimal

dependency changes:
  - Total: 3
  - Base cache HIT: 67%
  - Note: Cache misses expected for npm layer

dockerfile changes:
  - Total: 2
  - Base cache HIT: 50%
  - Note: Full rebuild expected

## Trends & Patterns

✓ Cache efficiency stable for code-only changes
📊 Dependency updates occur every ~7 days
⚠️ Base image cache missed on commit abc123 (Dockerfile modified)

## Recommendations

✓ Cache is working optimally
💡 Consider scheduling dependency updates to minimize cache churn
```

## Troubleshooting

**No git notes found:**
- Ensure CI workflow has "Capture cache metrics" step
- Push a commit to trigger CI
- Fetch notes: `git fetch origin refs/notes/ci/cache-metrics`

**Cache always missing:**
- Check if Dockerfile changed (invalidates cache key)
- Verify GitHub Actions cache hasn't expired (7 days)
- Review cache configuration in workflow

## Related Files

- **Skill Definition**: `.claude/skills/docker-cache-analysis/analysis.yaml`
- **CI Workflow**: `.github/workflows/ci.yml`
- **Metrics Extraction**: `.github/scripts/extract-cache-metrics.sh`
- **Documentation**: `CLAUDE.md` (CI/CD Pipeline Optimization section)
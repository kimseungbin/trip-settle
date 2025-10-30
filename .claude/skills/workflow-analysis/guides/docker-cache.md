# Docker Build Cache Analysis

Analyze Docker build cache efficiency and optimize build performance using git notes metrics.

> **Note**: This guide uses bash for loops to iterate commits. For syntax guidance and ZSH compatibility, see [`git-notes.md` → "Common Bash Patterns"](git-notes.md#common-bash-patterns).

## When to Use

- Docker builds are slow in CI
- Want to track cache hit rate trends
- Investigating cache degradation
- Optimizing Dockerfile layer ordering
- Comparing performance across commits

## Git Notes Namespace

`ci/cache-metrics` - Docker cache efficiency data

## Quick Analysis

### Fetch and Show Latest Metrics

```bash
# Fetch metrics
git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics

# Show latest
git notes --ref=ci/cache-metrics show HEAD
```

### Key Metrics

```bash
# Overall cache hit rate
git notes --ref=ci/cache-metrics show HEAD | grep "^overall_cache_hit_rate"

# Base image cache status
git notes --ref=ci/cache-metrics show HEAD | grep "^base_image"

# Per-build hit rates
git notes --ref=ci/cache-metrics show HEAD | grep "cache_hit_rate"
```

## Metrics Structure

Git notes contain INI-format cache data:

```ini
timestamp = 2025-10-29T10:30:00Z
commit = abc123

[backend]
cache_hit_rate = 85%
cached_layers = 17
built_layers = 3

[frontend]
cache_hit_rate = 90%
cached_layers = 15
built_layers = 2

[playwright]
base_image = HIT
cache_hit = true

overall_cache_hit_rate = 87%
```

## Analysis Patterns

### 1. Track Hit Rate Trends

```bash
# Recent cache performance
for commit in $(git log --oneline -10 --format='%h'); do
  if git notes --ref=ci/cache-metrics show $commit 2>/dev/null; then
    echo "=== $commit ==="
    git log -1 --oneline $commit
    git notes --ref=ci/cache-metrics show $commit | grep "^overall_cache_hit_rate"
    echo ""
  fi
done
```

### 2. Identify Cache Misses

```bash
# Find commits with low cache hit rate
for commit in $(git log --oneline -20 --format='%h'); do
  rate=$(git notes --ref=ci/cache-metrics show $commit 2>/dev/null | grep "^overall_cache_hit_rate" | cut -d'=' -f2 | tr -d ' %' || echo "0")
  if [ "$rate" -lt 70 ]; then
    echo "❌ Low cache: $commit ($rate%)"
    git show --no-patch --format="%h: %s" $commit
  fi
done
```

### 3. Correlate with Change Type

```bash
# Check what changed when cache missed
git notes --ref=ci/cache-metrics show <commit> | grep "^change_type"

# Common patterns:
# - code-only: Should have >80% hit rate
# - deps: Expected misses (npm install layers)
# - dockerfile: Expected full rebuild
```

### 4. Base Image Analysis

```bash
# Track base image cache
for commit in $(git log --oneline -10 --format='%h'); do
  base=$(git notes --ref=ci/cache-metrics show $commit 2>/dev/null | grep "^base_image" | cut -d'=' -f2 || echo "UNKNOWN")
  echo "$commit: $base"
done

# HIT = cached (saves ~46s, ~786MB download)
# MISS = pulled from registry
```

## Common Issues

### Issue 1: Dockerfile Layer Ordering

**Symptom**: Cache miss rate increasing over time

**Diagnosis:**
```bash
# Check recent Dockerfile changes
git log --oneline -20 -- Dockerfile packages/*/Dockerfile*

# Look for layer reordering
git diff HEAD~5..HEAD -- Dockerfile
```

**Fix:** Order layers from least to most frequently changing:
```dockerfile
# GOOD (stable → volatile)
FROM node:20
COPY package*.json ./
RUN npm ci
COPY . .

# BAD (violates ordering)
FROM node:20
COPY . .              # ← Changes often, invalidates npm ci
RUN npm ci
```

### Issue 2: Package.json Changes

**Symptom**: Low cache hit on dependency changes

**Expected:** This is normal! Dependencies changing invalidate npm layers.

**Optimization:**
- Use `package-lock.json` for reproducible installs
- Consider multi-stage builds to cache deps separately
- Use `--mount=type=cache` for npm cache

### Issue 3: Base Image Updates

**Symptom**: Periodic cache misses for base image

**Cause:** GitHub Actions cache expires after 7 days, or image updated

**Monitor:**
```bash
# Track base image hits/misses
git notes --ref=ci/cache-metrics show HEAD | grep "base_image"
```

**Optimization:**
- Cache base image in GitHub Actions cache
- See `.github/workflows/ci.yml` → `cache-playwright-image` step

## Performance Impact

### Time Savings Calculation

```bash
# Calculate time saved by cache
commits_with_hit=$(git notes --ref=ci/cache-metrics list | wc -l)
hit_rate=$(git notes --ref=ci/cache-metrics show HEAD | grep "^overall_cache_hit_rate" | cut -d'=' -f2 | tr -d ' %')

echo "Commits analyzed: $commits_with_hit"
echo "Average hit rate: $hit_rate%"
echo "Estimated time saved: ~$((commits_with_hit * hit_rate / 100 * 30))s"
```

**Typical savings:**
- Base image HIT: ~46s per build
- npm install cache: ~15-20s per build
- Overall: 1-2 minutes per CI run

## Optimization Checklist

When optimizing Docker builds:

1. ✅ Check layer ordering (stable → volatile)
2. ✅ Verify package-lock.json is committed
3. ✅ Use multi-stage builds appropriately
4. ✅ Monitor base image cache status
5. ✅ Review .dockerignore (exclude unnecessary files)
6. ✅ Consider buildx cache mounts
7. ✅ Track metrics before/after changes

## CI Integration

Cache metrics are captured in `.github/workflows/ci.yml`:

**Capture step:**
```yaml
- name: Capture Docker cache metrics
  if: always()
  run: ./.github/scripts/docker/capture-cache-metrics.sh
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Validation step:**
```yaml
- name: Validate cache effectiveness
  run: |
    # Check if hit rate meets threshold
    # Threshold varies by change type (code: 80%, deps: 50%, dockerfile: 0%)
```

See `.github/workflows/ci.yml` → `docker-images` job for complete setup.

## Cross-Guide Integration

- **workflows.md**: If slow builds cause job timeouts
- **e2e-tests.md**: If slow Docker builds delay E2E tests
- **git-notes.md**: For git notes operation details

## References

- Docker BuildKit cache: https://docs.docker.com/build/cache/
- GitHub Actions cache: https://docs.github.com/actions/using-workflows/caching-dependencies
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/

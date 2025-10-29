# Docker Build Cache Analysis

**Temporary Note**: This guide is being migrated from the existing `docker-cache-analysis` skill.

For now, refer to: `.claude/skills/docker-cache-analysis/analysis.yaml`

## Quick Reference

### Fetch cache metrics
```bash
git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics
git notes --ref=ci/cache-metrics show HEAD
```

### Analyze recent performance
```bash
for commit in $(git log --oneline -10 --format='%h'); do
  if git notes --ref=ci/cache-metrics show $commit 2>/dev/null; then
    echo "=== $commit ==="
    git log -1 --oneline $commit
    git notes --ref=ci/cache-metrics show $commit | grep -E "^overall_cache_hit_rate|^base_image"
    echo ""
  fi
done
```

---

**TODO**: Full guide migration pending. Use existing docker-cache-analysis skill for complete analysis.

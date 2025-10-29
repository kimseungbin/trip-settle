# Snapshot Update Analysis

**Temporary Note**: This guide is being migrated from the existing `snapshot-update-analysis` skill.

For now, refer to: `.claude/skills/snapshot-update-analysis/analysis.yaml`

## Quick Reference

### Fetch snapshot update metrics
```bash
git fetch origin refs/notes/ci/snapshot-updates:refs/notes/ci/snapshot-updates
git notes --ref=ci/snapshot-updates show HEAD
```

### Check update status
```bash
git notes --ref=ci/snapshot-updates show HEAD | grep -E "^status|^outcome|^triggered_by"
```

---

**TODO**: Full guide migration pending. Use existing snapshot-update-analysis skill for complete analysis.

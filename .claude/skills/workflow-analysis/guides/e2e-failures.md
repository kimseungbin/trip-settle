# E2E Test Failure Analysis

**Temporary Note**: This guide is being migrated from the existing `e2e-failure-analysis` skill.

For now, refer to: `.claude/skills/e2e-failure-analysis/analysis.yaml`

## Quick Reference

### Fetch E2E failure notes
```bash
git fetch origin refs/notes/ci/e2e-failures:refs/notes/ci/e2e-failures
git notes --ref=ci/e2e-failures show HEAD
```

### Find failed tests
```bash
git notes --ref=ci/e2e-failures show HEAD | grep "^\[failure\." -A 8
```

---

**TODO**: Full guide migration pending. Use existing e2e-failure-analysis skill for complete analysis.

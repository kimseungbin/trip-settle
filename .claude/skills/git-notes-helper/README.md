# Git Notes Helper Skill

Reusable utilities for working with git notes metadata in CI/CD workflows.

## Overview

This skill provides common git notes operations that other analysis skills use. It's a **helper skill** that encapsulates git notes functionality to avoid duplication across multiple skills.

### What Are Git Notes?

Git notes are metadata attached to commits without modifying commit history:

- **Separate storage**: Lives in `refs/notes/*` namespace
- **Explicit fetch**: Not fetched by default (`git fetch` doesn't include notes)
- **Independent updates**: Can be pushed/pulled separately from commits
- **Perfect for CI**: Store test results, metrics, build data

### Why Use Git Notes for CI Metadata?

**Traditional approach** (external database):
- Requires separate database/service
- Harder to version and audit
- Tight coupling to infrastructure

**Git notes approach**:
- ✅ No external database needed
- ✅ Metadata stored with code
- ✅ Version-controlled and auditable
- ✅ Team-wide visibility
- ✅ Historical analysis with git commands

## Skills Using This Helper

1. **docker-cache-analysis**
   - Namespace: `refs/notes/ci/cache-metrics`
   - Data: Docker build cache efficiency metrics
   - Use case: Analyze cache hit rates over time

2. **e2e-failure-analysis**
   - Namespace: `refs/notes/ci/e2e-failures`
   - Data: Playwright E2E test failure metadata
   - Use case: Diagnose test failures, detect flaky tests

## Common Operations

### Fetch Notes from Remote

```bash
git fetch origin refs/notes/ci/<namespace>:refs/notes/ci/<namespace>
```

### List Commits with Notes

```bash
git notes --ref=ci/<namespace> list
```

### Show Note for Commit

```bash
git notes --ref=ci/<namespace> show <commit-hash>
```

### Parse INI Format Field

```bash
git notes --ref=ci/<namespace> show <commit> | grep "^field_name" | cut -d'=' -f2 | xargs
```

### Compare Two Commits

```bash
CURRENT=$(git notes --ref=ci/<namespace> show HEAD | grep "^metric" | cut -d'=' -f2)
PREVIOUS=$(git notes --ref=ci/<namespace> show HEAD~1 | grep "^metric" | cut -d'=' -f2)
echo "Change: $PREVIOUS -> $CURRENT"
```

## INI Format Structure

Git notes in this project use INI format for structured data:

```ini
# Top-level fields
timestamp = 2025-10-26T10:30:00Z
commit = abc123de

# Sections
[metadata]
field1 = value1
field2 = value2

[section2]
data = something
```

**Parsing examples**:
- Top-level field: `grep "^timestamp"`
- Field in section: `grep -A 10 "^\[metadata\]" | grep "^field1"`
- Count sections: `grep -c "^\[section"`

## Best Practices

1. **Always fetch first**: Notes aren't fetched by default
2. **Handle missing notes**: Check existence before reading
3. **Use error suppression**: `2>/dev/null` for conditional checks
4. **Avoid complex loops**: Claude Code Bash tool prefers simple sequential commands
5. **Clean up temp files**: Remove files created during analysis

## Namespaces Used in This Project

| Namespace | Description | Used By |
|-----------|-------------|---------|
| `ci/cache-metrics` | Docker build cache efficiency | docker-cache-analysis |
| `ci/e2e-failures` | E2E test failure metadata | e2e-failure-analysis |

## Example: Analyzing Cache Trends

```bash
# 1. Fetch notes
git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics

# 2. Check if notes exist
git notes --ref=ci/cache-metrics list | head -5

# 3. Show note for current commit
git notes --ref=ci/cache-metrics show HEAD

# 4. Extract cache status
git notes --ref=ci/cache-metrics show HEAD | grep "^cache_status" | cut -d'=' -f2 | xargs

# 5. Get recent metrics
git notes --ref=ci/cache-metrics list | head -10 | awk '{print $2}' | while read commit; do
  echo "Commit: $commit"
  git notes --ref=ci/cache-metrics show $commit | grep "^cache_status"
done
```

## Troubleshooting

### No notes found

```bash
# Check if remote has notes
git ls-remote origin refs/notes/*

# Fetch notes
git fetch origin refs/notes/ci/<namespace>:refs/notes/ci/<namespace>

# If still empty, CI capture may not be set up
```

### Field not parsing correctly

```bash
# Show full note to debug format
git notes --ref=ci/<namespace> show <commit>

# Check for extra spaces, different formatting
# Adjust grep pattern accordingly
```

### Note attached to wrong commit

```bash
# Verify commit hash
git rev-parse <commit-ref>

# Show note with commit context
git log --show-notes=ci/<namespace> --format="%H %s" -1 <commit>
```

## Detailed Documentation

For comprehensive implementation details, see:
- `.claude/skills/git-notes-helper/helper.yaml` - Complete operation reference
- `.claude/skills/git-notes-helper/SKILL.md` - Skill metadata

## Contributing

When adding new git notes functionality:

1. Add common operations to `helper.yaml`
2. Update this README with examples
3. Update consuming skills to reference helper skill
4. Avoid duplicating git notes logic across skills

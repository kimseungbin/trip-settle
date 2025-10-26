---
name: Git Notes Helper
description: Reusable utilities for working with git notes. Provides common operations for fetching, reading, and parsing git notes metadata. Used by other skills (docker-cache-analysis, e2e-failure-analysis).
---

# Git Notes Helper

Reusable utilities for working with git notes in CI/CD workflows.

## When to Use

This skill is typically used **by other skills**, not invoked directly. It provides common git notes operations that other analysis skills depend on:

- **docker-cache-analysis**: Uses git notes for cache metrics
- **e2e-failure-analysis**: Uses git notes for test failure metadata

You would invoke this skill directly only if you need to:
- Debug git notes issues
- Manually inspect note content
- Understand git notes structure

## Instructions

When working with git notes:

1. **Read the helper guide**:
   - Read `.claude/skills/git-notes-helper/helper.yaml`
   - Understand available operations and patterns

2. **Choose appropriate operation**:
   - Fetch: Retrieve notes from remote
   - Show: Read note content for a commit
   - Parse: Extract fields from INI-format notes
   - Compare: Analyze changes between commits
   - Historical: Walk backwards through commits

3. **Follow best practices**:
   - Always fetch before reading
   - Handle missing notes gracefully
   - Use simple commands (avoid complex loops)
   - Clean up temp files

## Helper Guide Location

The detailed implementation guide is in: `.claude/skills/git-notes-helper/helper.yaml`

## Common Operations

- **Fetch notes**: `git fetch origin refs/notes/ci/<namespace>:refs/notes/ci/<namespace>`
- **List commits with notes**: `git notes --ref=ci/<namespace> list`
- **Show note**: `git notes --ref=ci/<namespace> show <commit>`
- **Parse field**: `git notes --ref=ci/<namespace> show <commit> | grep "^field" | cut -d'=' -f2 | xargs`
- **Compare commits**: Compare note content between HEAD and HEAD~1

## Git Notes Namespaces

This project uses these namespaces:

- **`ci/cache-metrics`**: Docker build cache efficiency metrics
- **`ci/e2e-failures`**: Playwright E2E test failure metadata

## Notes

- Git notes are NOT fetched by default (explicit fetch required)
- Notes are stored separately from commits
- Perfect for storing CI metadata without polluting commit history
- Team-wide visibility when pushed to remote

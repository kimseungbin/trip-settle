---
name: git-hooks-setup
description: |
  Guide for setting up, verifying, and troubleshooting custom git hooks.
  Use when user asks about git hooks, pre-commit checks, or hook configuration.
---

# Git Hooks Setup & Troubleshooting

This skill provides step-by-step instructions for configuring and managing custom git hooks in the Trip Settle project.

## Overview

The project uses custom git hooks stored in `.githooks/` (instead of the default `.git/hooks/`) to ensure code quality before commits. These hooks are version-controlled and shared across the team.

## Available Hooks

### pre-commit

Runs before each commit to validate:
- **Code formatting** (Prettier)
- **Linting** (ESLint)
- **Build compilation** (all packages)
- **Cleans build artifacts** after validation

**Important**: E2E tests are NOT run in pre-commit hooks due to slow execution time (several minutes with Docker). Run E2E tests manually before pushing.

## Setup Instructions

### Initial Configuration (One-Time Setup)

After cloning the repository, enable custom hooks:

```bash
# Configure git to use the .githooks directory
git config core.hooksPath .githooks

# Make all hooks executable (required on Unix-based systems)
chmod +x .githooks/*
```

### Verification

Verify the hooks are configured correctly:

```bash
# Check git configuration
git config core.hooksPath
# Should output: .githooks

# Test hook execution
git add .
git commit -m "test"
# You should see pre-commit hook output (formatting, linting, build)
```

## Troubleshooting

### Hook Not Running

**Symptom**: Commits succeed without any hook output

**Diagnosis**:
```bash
# Check if hooks path is configured
git config core.hooksPath
```

**Solutions**:
1. If output is empty or incorrect, run setup commands again
2. Verify `.githooks/` directory exists in repository root
3. Check hook files have executable permissions: `ls -l .githooks/`

### Permission Denied Errors

**Symptom**: `permission denied: .githooks/pre-commit`

**Solution**:
```bash
# Make hooks executable
chmod +x .githooks/*

# Verify permissions (should show -rwxr-xr-x)
ls -l .githooks/
```

### Hook Fails on Build/Lint Errors

**Symptom**: Commit blocked with error messages

**This is expected behavior!** The hook is working correctly.

**Solutions**:
1. **Fix the issues** (recommended):
   ```bash
   npm run format        # Auto-fix formatting
   npm run lint          # Show linting errors
   npm run build         # Verify build works
   ```

2. **Bypass temporarily** (use sparingly):
   ```bash
   git commit --no-verify -m "WIP: Your message"
   ```

**Warning**: Use `--no-verify` only for work-in-progress commits. Fix issues before final push.

### Build Artifacts Left Behind

**Symptom**: `dist/` or `build/` directories created after commit

**Root Cause**: Hook script failed before cleanup step

**Solution**:
```bash
# Manually clean build artifacts
npm run build           # Rebuild to ensure it works
rm -rf packages/*/dist  # Clean up artifacts
```

## Bypassing Hooks

### When to Bypass

Use `--no-verify` flag only for:
- Work-in-progress commits (fix issues later)
- Emergency hotfixes (fix quality issues immediately after)
- Commits that intentionally break quality checks (rare, document why)

### How to Bypass

```bash
# Skip pre-commit hook for this commit only
git commit --no-verify -m "WIP: Your message"

# Or use shorthand
git commit -n -m "WIP: Your message"
```

### Best Practice

It's better to fix issues caught by hooks than to bypass them. Hooks save time by catching problems before they reach CI/CD.

## What Hooks Check

### Format Check (Prettier)
```bash
npm run format:check
```

Validates code formatting according to `.prettierrc.yaml`:
- 120 character line width
- Tabs (width: 4)
- Single quotes
- No semicolons
- ES5 trailing commas

**Auto-fix**: `npm run format`

### Linting (ESLint)
```bash
npm run lint
```

Validates code quality and best practices:
- Frontend: Svelte-specific rules
- Backend: NestJS-specific rules
- Infra: TypeScript-only rules

**Configuration**: `.eslintrc.cjs` in each package

### Build Compilation
```bash
npm run build
```

Compiles all packages to verify no TypeScript errors:
- Frontend: Vite build
- Backend: NestJS build
- Infra: CDK synth

**Note**: Build artifacts are cleaned after validation to avoid committing generated files.

## E2E Tests (Not in Hooks)

E2E tests are **intentionally excluded** from pre-commit hooks due to execution time (2-5 minutes with Docker).

**Run manually before pushing**:
```bash
npm run test:e2e:docker
```

**Why not in hooks?**
- Too slow for fast commit workflow
- Blocks developer productivity
- Better suited for pre-push validation or CI/CD

## Hook Internals

### Hook Location

Custom hooks live in `.githooks/` (version-controlled) instead of `.git/hooks/` (ignored by git).

### How It Works

When you run `git config core.hooksPath .githooks`:
1. Git reads hook scripts from `.githooks/` instead of `.git/hooks/`
2. Hooks execute before git operations (commit, push, etc.)
3. Non-zero exit code blocks the git operation
4. Zero exit code allows operation to proceed

### Hook Script Structure

```bash
#!/bin/bash
# Pre-commit hook structure

# 1. Run checks
npm run format:check || exit 1
npm run lint || exit 1
npm run build || exit 1

# 2. Clean up artifacts
npm run clean

# 3. Exit successfully
exit 0
```

## Team Workflow

### New Team Member Setup

1. Clone repository
2. Run `npm install`
3. Run hook setup commands (see Setup Instructions)
4. Verify with test commit
5. Start development

### Updating Hooks

When hook scripts are updated:
1. Changes propagate via `git pull`
2. No additional setup needed (hooks already configured)
3. Permissions preserved if committed correctly

### Sharing Hook Changes

```bash
# 1. Modify hook script
vim .githooks/pre-commit

# 2. Ensure executable
chmod +x .githooks/pre-commit

# 3. Commit and push
git add .githooks/pre-commit
git commit -m "chore: Update pre-commit hook to check X"
git push

# 4. Team members get changes automatically on next pull
```

## Related Documentation

- **Why custom hooks?**: See README.md "Development Workflow → Why Custom Git Hooks?"
- **CI/CD pipeline**: See README.md "Continuous Integration (CI/CD)"
- **TDD workflow**: See `.claude/skills/tdd-workflow/workflow.yaml`
# Workflow & Job Failure Analysis

Diagnose and fix GitHub Actions workflow failures using git notes and local testing.

## Prerequisites

This guide uses git notes for historical analysis.

> **Note**: This guide uses bash for loops to iterate commits. For syntax guidance and ZSH compatibility, see [`git-notes.md` → "Common Bash Patterns"](git-notes.md#common-bash-patterns).

**Git notes namespace**: `ci/workflow-metrics`

## Step 1: Fetch Workflow Metrics

```bash
# Fetch workflow metrics from remote
git fetch origin refs/notes/ci/workflow-metrics:refs/notes/ci/workflow-metrics 2>/dev/null || \
  echo "No workflow metrics found (capture job may have failed)"

# Check if metrics exist for recent commits
git notes --ref=ci/workflow-metrics list | head -20

# Show metrics for specific commit
git notes --ref=ci/workflow-metrics show HEAD
git notes --ref=ci/workflow-metrics show <commit-hash>
```

**If no metrics exist**: The `capture-workflow-metrics` job likely failed. Common cause: incorrect job dependencies.

## Step 2: Common Failure Patterns

### Pattern 1: Job Dependency Errors ⭐ MOST COMMON

**Symptom**: Workflow fails immediately with "job needs: references unknown job"

**Example Error**:
```
Invalid workflow file: .github/workflows/ci.yml
Job 'capture-workflow-metrics' depends on unknown job 'build-and-test'
```

**Root Cause**: Job names in `needs:` array don't match actual job IDs.

**Diagnosis**:
```bash
# Check all job dependencies
grep -n "needs:" .github/workflows/ci.yml

# List actual job names (job IDs)
grep "^  [a-z-]*:" .github/workflows/ci.yml | sed 's/://g'
```

**Fix Example**:

Before (WRONG):
```yaml
capture-workflow-metrics:
  needs: [build-and-test, docker-e2e-test, infrastructure-validation, all-checks]
```

After (CORRECT):
```yaml
capture-workflow-metrics:
  needs: [code-format, lint, type-check, build, docker-images, unit-tests, e2e-tests, all-checks]
```

**How to apply**:
1. Find the incorrect `needs:` array
2. Replace with actual job IDs from the workflow
3. Test by pushing to a branch

### Pattern 2: Missing Package Imports ⭐ DEPLOYMENT ISSUE

**Symptom**: CDK/deploy workflow fails with "Cannot find package" or "ERR_MODULE_NOT_FOUND"

**Example Error**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'source-map-support'
imported from /path/to/packages/infra/bin/infra.ts
```

**Root Cause**: Package was removed during refactoring but import statement remains.

**Common Cases**:
- `source-map-support` removed after tsx migration (doesn't need it)
- Dev dependencies moved to root but imports not updated
- ESM migration left stale CommonJS imports

**Diagnosis**:
```bash
# Test locally first
npm run build --workspace=infra
npm run synth --workspace=infra

# Check for obsolete imports
grep -r "source-map-support" packages/infra/
grep -r "^import.*from.*['\"][^@]" packages/infra/bin/ packages/infra/lib/
```

**Fix Example** (source-map-support):

Before (WRONG):
```typescript
#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
```

After (CORRECT):
```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
```

**Why**: tsx (the executor) handles source maps internally, so `source-map-support` is not needed.

### Pattern 3: Syntax Errors

**Symptom**: Workflow fails to parse with "Invalid workflow file"

**Common issues**:
- Inconsistent indentation (mixing tabs/spaces)
- Missing colons after keys
- Unclosed quotes or brackets
- Invalid job/step names (must be alphanumeric + hyphens)

**Diagnosis**:
```bash
# Check indentation consistency
cat .github/workflows/ci.yml | grep -E "^[[:space:]]+" | cut -c1-10 | sort | uniq -c

# Validate YAML syntax (if yamllint available)
yamllint .github/workflows/ci.yml

# Check for common mistakes
grep -n "^[[:space:]]*-[[:space:]]*name:" .github/workflows/ci.yml | grep -v "  - name:"
```

**Fix**: Correct YAML syntax, ensure consistent 2-space indentation.

### Pattern 4: Permission Errors

**Symptom**: Job fails with "Resource not accessible" or "403 Forbidden"

**Common causes**:
- Missing `contents: write` for git operations
- Missing `id-token: write` for OIDC (AWS deployment)
- Missing `actions: read` for workflow API access

**Diagnosis**:
```bash
# Check workflow permissions
grep -A 10 "^permissions:" .github/workflows/*.yml
```

**Fix Example**:

```yaml
permissions:
  contents: write  # For git notes push
  actions: read    # For workflow API
  id-token: write  # For AWS OIDC (deploy.yml only)
```

### Pattern 5: Timeout Failures

**Symptom**: Job cancelled after exceeding timeout

**Diagnosis**:
```bash
# Check job durations from git notes
git notes --ref=ci/workflow-metrics show HEAD | \
  grep -E "^name =|^duration_seconds =" | \
  paste - -

# Compare to configured timeouts
grep "timeout-minutes:" .github/workflows/*.yml
```

**Fix**: Increase `timeout-minutes` or optimize job (caching, parallelization).

## Step 3: Search for Historical Failures

Find patterns across commits:

```bash
# Find commits with workflow failures
for commit in $(git log --oneline -20 --format='%h'); do
  if git notes --ref=ci/workflow-metrics show $commit 2>/dev/null | grep -q "conclusion = failure"; then
    echo "=== $commit ==="
    git log -1 --oneline $commit
    git notes --ref=ci/workflow-metrics show $commit | grep -B 1 "conclusion = failure" | grep "^name =" | cut -d'=' -f2
    echo "---"
  fi
done
```

### Find Specific Workflow

```bash
# Find "Deploy Infrastructure" runs
for commit in $(git log --oneline -30 --format='%h'); do
  if git notes --ref=ci/workflow-metrics show $commit 2>/dev/null | grep -q "workflow = Deploy Infrastructure"; then
    echo "=== $commit ==="
    git log -1 --oneline $commit
    git notes --ref=ci/workflow-metrics show $commit | grep -E "^workflow =|^conclusion ="
    echo "---"
  fi
done
```

## Step 4: Test Fixes Locally

Before pushing, test fixes locally when possible:

### For CI workflow
```bash
# Build all packages
npm run build

# Run quality checks
npm run format:check
npm run lint
npm run type-check --workspace=frontend
```

### For Deploy workflow
```bash
# Build infra package
npm run build --workspace=infra

# Test CDK synth
npm run synth --workspace=infra

# Preview changes (if AWS configured)
npm run diff --workspace=infra
```

### For E2E tests
```bash
# Run E2E tests locally (Docker)
npm run test:e2e:docker --workspace=frontend
```

## Step 5: Verify Fix Success

After pushing, check if workflow runs successfully:

```bash
# Fetch latest metrics
git fetch origin refs/notes/ci/workflow-metrics:refs/notes/ci/workflow-metrics

# Check HEAD for metrics (proves workflow ran)
git notes --ref=ci/workflow-metrics show HEAD

# Verify no failures
git notes --ref=ci/workflow-metrics show HEAD | grep "conclusion = failure" && \
  echo "Still failing" || echo "All jobs passed"
```

## Workflow Files Reference

- `.github/workflows/ci.yml` - Main CI pipeline
  - Jobs: code-format, lint, type-check, build, docker-images, unit-tests, e2e-tests, all-checks, capture-workflow-metrics
- `.github/workflows/deploy.yml` - Infrastructure deployment
  - Jobs: deploy
- `.github/workflows/update-snapshots.yml` - Visual snapshot updates
  - Jobs: check-trigger, update-snapshots, post-results
- `.github/workflows/deploy-github-pages.yml` - Documentation deployment
  - Jobs: build-and-deploy

## Quick Diagnosis Checklist

When user reports workflow failure:

1. ✅ Identify which workflow (CI, Deploy, Snapshots, Pages)
2. ✅ Fetch git notes (check if metrics exist)
3. ✅ Check for job dependency errors (Pattern 1)
4. ✅ Check for missing imports (Pattern 2)
5. ✅ Test locally if possible
6. ✅ Provide specific fix with code example
7. ✅ Show before/after comparison

## Real-World Fix Example

**Issue**: Deploy Infrastructure workflow failing

**Investigation**:
1. No git notes exist → capture-workflow-metrics job failed
2. Check ci.yml for dependency errors
3. Found: `needs: [build-and-test, docker-e2e-test, infrastructure-validation]`
4. Actual jobs: `code-format, lint, type-check, build, docker-images, unit-tests, e2e-tests`

**Fix 1** (ci.yml):
```yaml
# Before
capture-workflow-metrics:
  needs: [build-and-test, docker-e2e-test, infrastructure-validation, all-checks]

# After
capture-workflow-metrics:
  needs: [code-format, lint, type-check, build, docker-images, unit-tests, e2e-tests, all-checks]
```

**Fix 2** (infra/bin/infra.ts):
```typescript
# Before
#!/usr/bin/env node
import 'source-map-support/register'  // ❌ Package not installed
import * as cdk from 'aws-cdk-lib'

# After
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'  // ✅ Removed obsolete import
```

**Verification**:
```bash
npm run synth --workspace=infra  # ✅ Works!
```

## Integration with Other Guides

- **docker-cache.md**: For Docker build failures in `docker-images` job
- **e2e-failures.md**: For test failures in `e2e-tests` job
- **snapshots.md**: For snapshot workflow issues

## Notes for Claude Code

- Always test locally before recommending fixes
- Provide complete before/after code examples
- Explain the "why" behind each fix
- Link to relevant documentation when applicable
- Check git notes first for historical context

## Workflow Performance Metrics

Beyond failures, track workflow performance using `ci/workflow-metrics` namespace.

### Job Duration Analysis

```bash
# Show job durations
git notes --ref=ci/workflow-metrics show HEAD | grep -E "^name =|^duration_seconds =" | paste - -

# Find slow jobs
for commit in $(git log --oneline -10 --format='%h'); do
  git notes --ref=ci/workflow-metrics show $commit 2>/dev/null | awk '/^name =/ {name=$3} /^duration_seconds =/ {if($3>300) print name, $3 "s"}'
done
```

### Step-Level Timing

```bash
# Detailed step timing
git notes --ref=ci/workflow-metrics show HEAD | grep -A 3 "^\[job\..*\.step"
```

See existing `workflow-metrics-analysis` skill for detailed performance analysis.


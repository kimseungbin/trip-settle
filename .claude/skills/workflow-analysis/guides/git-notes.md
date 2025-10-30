# Git Notes Operations

Common operations for working with git notes in workflow analysis.

## What Are Git Notes?

Git notes are metadata attached to commits without changing commit history:
- **Stored separately**: Live in `refs/notes/*` namespace
- **Not fetched by default**: Require explicit fetch
- **Pushed independently**: Can update without changing commits
- **Perfect for CI metadata**: Store test results, metrics, build data

**Benefits:**
- No database needed (metadata lives in git)
- Version-controlled and auditable
- Team-wide visibility (pushed to remote)
- Historical analysis (walk through commits)

## Namespaces Used

- `ci/workflow-metrics` - Job/step timing and status
- `ci/cache-metrics` - Docker build cache efficiency
- `ci/e2e-failures` - E2E test failure metadata
- `ci/snapshot-updates` - Snapshot update workflow execution

## Common Operations

### 1. Fetch Git Notes

Retrieve notes from remote repository before analysis.

```bash
# Fetch specific namespace
git fetch origin refs/notes/ci/<namespace>:refs/notes/ci/<namespace> 2>/dev/null || \
  echo "No remote notes found"

# Examples
git fetch origin refs/notes/ci/workflow-metrics:refs/notes/ci/workflow-metrics
git fetch origin refs/notes/ci/cache-metrics:refs/notes/ci/cache-metrics
git fetch origin refs/notes/ci/e2e-failures:refs/notes/ci/e2e-failures
```

### 2. Check If Notes Exist

Verify notes are available before reading.

```bash
# Check if any notes exist
git notes --ref=ci/<namespace> list | head -1

# Check if specific commit has note
git notes --ref=ci/<namespace> show <commit-hash> >/dev/null 2>&1
echo $?  # 0 = exists, 1 = doesn't exist
```

### 3. Show Note Content

Retrieve full note for a commit.

```bash
# Show note for specific commit
git notes --ref=ci/<namespace> show <commit-hash>

# Show note for HEAD
git notes --ref=ci/<namespace> show HEAD

# With error suppression
git notes --ref=ci/<namespace> show <commit-hash> 2>/dev/null
```

### 4. List Commits with Notes

Find all commits that have notes.

```bash
# List all (shows object hash pairs)
git notes --ref=ci/<namespace> list

# Get just commit hashes
git notes --ref=ci/<namespace> list | awk '{print $2}'

# Recent commits only
git notes --ref=ci/<namespace> list | head -20
```

### 5. Parse INI Format

Extract fields from INI-format notes.

**INI Structure:**
```ini
# Top-level fields
timestamp = 2025-10-26T10:30:00Z
commit = abc123

[section_name]
field1 = value1
field2 = value2
```

**Parsing commands:**
```bash
# Extract top-level field
git notes --ref=ci/<namespace> show HEAD | grep "^field_name =" | cut -d'=' -f2 | xargs

# Extract from section
git notes --ref=ci/<namespace> show HEAD | grep -A 5 "^\[section\]"

# Multiple fields
git notes --ref=ci/<namespace> show HEAD | grep -E "^field1 =|^field2 ="
```

### 6. Get Commit Context

Show commit info alongside note data.

```bash
# Show commit message + note
git show --no-patch --format="%h: %s (%ar)" <commit-hash>
git notes --ref=ci/<namespace> show <commit-hash>

# Combine files changed with note
git show --name-only --format="" <commit-hash>
```

### 7. Historical Analysis

Analyze notes across multiple commits.

```bash
# Iterate recent commits
for commit in $(git log --oneline -10 --format='%h'); do
  if git notes --ref=ci/<namespace> show $commit 2>/dev/null; then
    echo "=== $commit ==="
    git log -1 --oneline $commit
    git notes --ref=ci/<namespace> show $commit | grep "^field ="
    echo ""
  fi
done
```

### 8. Compare Commits

Find differences in metrics between commits.

```bash
# Compare two commits
echo "=== Commit A ==="
git notes --ref=ci/<namespace> show <commit-a> | grep "^metric ="

echo "=== Commit B ==="
git notes --ref=ci/<namespace> show <commit-b> | grep "^metric ="
```

## Common Bash Patterns

### Safe For Loops (ZSH Compatible)

**CORRECT ✅ - Command Substitution with For Loop**
```bash
# Standard pattern used in all guides
for commit in $(git log --oneline -10 --format='%h'); do
  if git notes --ref=ci/<namespace> show $commit 2>/dev/null; then
    echo "=== $commit ==="
    git notes --ref=ci/<namespace> show $commit | grep "^field ="
  fi
done
```

**CORRECT ✅ - Pipe to While Read**
```bash
# Alternative pattern (safer for commits with spaces)
git log --oneline -10 --format='%h' | while read commit; do
  if git notes --ref=ci/<namespace> show $commit 2>/dev/null; then
    echo "=== $commit ==="
  fi
done
```

**CORRECT ✅ - Sequential Command Chaining**
```bash
# Best for small number of known commits
echo "=== Commit 1 ===" && \
git notes --ref=ci/<namespace> show abc123 | grep "^field =" && \
echo "=== Commit 2 ===" && \
git notes --ref=ci/<namespace> show def456 | grep "^field ="
```

**INCORRECT ❌ - Inline For Loop**
```bash
# FAILS in ZSH with "parse error near done"
for commit in "abc123" "def456"; do echo $commit; done

# Why it fails: ZSH requires proper line breaks in multi-command for loops
# when entered as a single line in interactive shell
```

### When to Use Which Pattern

| Pattern | Use Case | Performance | Safety |
|---------|----------|-------------|--------|
| `for commit in $(...)` | Standard iteration, most readable | Fast | Good |
| `... \| while read` | Commits with spaces in format | Slower | Best |
| Command chaining `&&` | 2-5 known commits | Fastest | Good |

### Error Handling

```bash
# Always redirect stderr when notes might not exist
git notes --ref=ci/<namespace> show $commit 2>/dev/null

# Check exit code before processing
if git notes --ref=ci/<namespace> show $commit 2>/dev/null; then
  # Process note
fi

# Provide default value if note missing
value=$(git notes show $commit 2>/dev/null | grep "^field =" | cut -d'=' -f2 || echo "N/A")
```

## Best Practices

1. **Always fetch first**: Notes aren't fetched with `git pull`
2. **Handle missing notes gracefully**: Not all commits have notes (use `2>/dev/null`)
3. **Use specific namespaces**: Don't mix different data types
4. **Keep notes structured**: Use INI format for consistency
5. **Prefer command substitution**: `for commit in $(...)` works reliably
6. **Avoid inline loops**: Multi-line for loops need proper syntax in ZSH

## Troubleshooting

**No notes found:**
- CI capture job may not be configured
- Check workflow files for note-writing steps
- Verify permissions to push notes

**Parse errors:**
- Check INI format is correct
- Look for special characters in values
- Verify section names match expected format

**Stale data:**
- Fetch notes again: `git fetch origin refs/notes/...`
- Check CI actually ran on recent commits
- Verify notes weren't accidentally deleted

## Writing Notes in CI

Notes are written by CI workflows using a post-job architecture pattern.

**Key pattern:**
```yaml
- name: Capture metrics
  if: always()  # Run even if previous steps failed
  run: |
    # Extract/generate metadata
    ./scripts/extract-metrics.sh > note.txt

    # Write to git notes
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"

    git notes --ref=ci/<namespace> add -F note.txt ${{ github.sha }}
    git push origin refs/notes/ci/<namespace>
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Important:**
- Use `if: always()` so notes written even on failure
- Configure git user for commit
- Push notes to specific namespace
- Require `contents: write` permission

## Integration with Analysis Guides

Each analysis guide references these operations as needed:
- **workflows.md**: Uses workflow-metrics namespace
- **docker-cache.md**: Uses cache-metrics namespace
- **e2e-tests.md**: Uses e2e-failures namespace
- **snapshots.md**: Uses snapshot-updates namespace

See individual guides for domain-specific analysis patterns.

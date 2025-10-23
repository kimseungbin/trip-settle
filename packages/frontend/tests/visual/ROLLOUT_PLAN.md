# Visual Regression Test Rollout Plan

This document tracks the phased rollout of visual regression tests to ensure workflow stability.

## Strategy

Visual regression tests are being added incrementally to avoid overwhelming the CI/CD pipeline with failures during initial setup. Each phase validates a specific aspect of the UI before expanding coverage.

## Current Status: Phase 1

### Phase 1: Core Workflow Validation ✅ (Active)
**Goal:** Validate that the snapshot update workflow functions correctly with minimal tests.

**Active Tests:**
- `initial empty state` - Captures baseline empty page state

**Success Criteria:**
- Workflow completes without errors
- Snapshot files are committed correctly
- Baseline snapshots are stable across CI runs

**To Move to Phase 2:**
1. Run update-snapshots workflow
2. Verify no unexpected failures
3. Confirm snapshot files are committed
4. Uncomment Phase 2 tests in `ui-snapshots.spec.ts`

---

### Phase 2: Form Interactions (Pending)
**Goal:** Add basic form and single-item interaction tests.

**Tests to Enable:**
- `expense form UI` - Form element rendering
- `expense list with single item` - Basic CRUD operation

**Steps to Enable:**
1. In `ui-snapshots.spec.ts`, change:
   ```ts
   test.skip('expense form UI', ...)
   ```
   to:
   ```ts
   test('expense form UI', ...)
   ```
2. Do the same for `expense list with single item`
3. Commit changes with: `[update-snapshots]` in commit message
4. Monitor workflow for new failures

**Success Criteria:**
- Both tests pass in CI
- Snapshots are stable

---

### Phase 3: Complex Interactions (Pending)
**Goal:** Add multi-item lists, calculations, and hover states.

**Tests to Enable:**
- `expense list with multiple items`
- `total calculation display`
- `expense list item hover state`
- `remove button visibility`

**Steps to Enable:**
1. Remove `.skip` from all Phase 3 tests
2. Commit with `[update-snapshots]` in message
3. Monitor for failures

**Success Criteria:**
- All interaction tests pass
- Hover states render consistently
- Calculations display correctly

---

### Phase 4: Responsive & Mobile (Pending)
**Goal:** Add mobile viewport and responsive breakpoint coverage.

**Test Suites to Enable:**
- `Visual Regression - Mobile` (entire suite)
- `Visual Regression - Responsive Breakpoints` (entire suite)

**Steps to Enable:**
1. Change `test.describe.skip` to `test.describe` for both suites
2. Commit with `[update-snapshots]`
3. Monitor for viewport-specific failures

**Success Criteria:**
- Mobile tests pass (375×667 viewport)
- All breakpoints render correctly (mobile, tablet, desktop)
- No layout shifts or overflow issues

---

## Rollback Strategy

If any phase introduces too many failures:

1. **Revert to Previous Phase:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Investigate Failures:**
   - Download `snapshot-diff-report` artifact from failed workflow
   - Review visual diffs in Playwright report
   - Identify root cause (CSS issue, timing, flakiness)

3. **Fix and Retry:**
   - Fix identified issues
   - Re-enable tests one at a time if needed
   - Use `test.only()` locally to isolate problematic tests

## Test Execution Summary

| Phase | Active Tests | Browsers | Total Comparisons | Est. Time |
|-------|-------------|----------|-------------------|-----------|
| 1     | 1           | 3        | 3                 | ~30s      |
| 2     | 3           | 3        | 9                 | ~1min     |
| 3     | 7           | 3        | 21                | ~2min     |
| 4     | 13          | 3        | 39                | ~4min     |

## Notes

- **Always update snapshots in CI**, never locally (see CLAUDE.md for rationale)
- Each phase should be stable for at least 2-3 successful CI runs before advancing
- If a test is consistently flaky, isolate it with `test.fixme()` instead of skipping
- Document any test-specific quirks or workarounds in test comments

## Maintenance

Once Phase 4 is complete and stable:
- Remove this file
- Remove phase comments from test file
- Update CLAUDE.md with final test count
- Consider adding visual tests to pre-push workflow

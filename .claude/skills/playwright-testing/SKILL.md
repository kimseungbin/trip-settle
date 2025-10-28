---
name: playwright-testing
description: End-to-end, visual regression, keyboard navigation, and accessibility testing with Playwright for frontend package. Use when writing E2E tests, debugging test failures, updating visual snapshots, or explaining test setup.
---

# Playwright E2E Testing Guide

Operational guide for running, writing, and debugging Playwright tests in Trip Settle.

## Test Structure

**Location**: `packages/frontend/tests/`

### Directories

**E2E Tests** (`tests/e2e/`):
- Purpose: User workflows and interactions
- Examples: expense-workflow.spec.ts (12 tests: CRUD operations, validation), keyboard-navigation.spec.ts (14 tests: Tab, Enter, shortcuts, focus)

**Visual Tests** (`tests/visual/`):
- Purpose: UI screenshot comparisons
- Examples: ui-snapshots.spec.ts (13 tests: Screenshot comparisons)

**Accessibility Tests** (`tests/accessibility/`):
- Purpose: WCAG 2.1 AA compliance
- Examples: a11y.spec.ts (14 tests: WCAG audits, currently test.fixme())
- Note: Accessibility tests marked test.fixme() until UI stabilizes

## Running Tests

### Docker-Based Testing (Recommended)

**When to use**: Default testing, pre-push checks, CI/CD

**Prerequisites**: Docker and Docker Compose installed (included with Docker Desktop)

**Commands**:
- Run tests: `npm run test:e2e:docker`
- Clean up: `npm run test:e2e:docker:clean`

**How it works**: Three Docker services orchestrated by docker-compose.e2e.yml:
- Backend Service: NestJS API with pg-mem database
- Frontend Service: Vite dev server
- Playwright Service: Official Playwright image (mcr.microsoft.com/playwright:v1.56.1-noble)

**Advantages**:
- Zero setup: No 'npx playwright install' needed
- Consistency: Same browser versions on all machines (Mac, Linux, Windows)
- CI/CD parity: Identical environment to GitHub Actions
- Isolation: Tests don't affect local environment
- Orchestration: Automatically starts backend + frontend

**Files**:
- Dockerfile: `packages/frontend/Dockerfile.e2e`
- Compose: `docker-compose.e2e.yml`
- Dockerignore: `.dockerignore`

**Troubleshooting**:
- Localhost connection: Docker uses service names (frontend:5173) - handled automatically
- Slow first build: Downloads ~1.5GB Playwright image, then cached
- Permission errors: Run `sudo chown -R $USER packages/frontend/playwright-report`

### Local Testing (Advanced)

**When to use**: Active test development, debugging, need immediate feedback

**Advantages**:
- Faster iteration: ~30s vs ~2-3min (no container startup)
- IDE integration: Playwright UI mode, inspector, step-through debugging
- Interactive development: Rapid test writing with watch mode

**Setup** (one-time): `npx playwright install --with-deps chromium webkit`

**Commands**:
- Headless: `npm run test:e2e --workspace=frontend`
- UI mode: `npm run test:e2e:ui --workspace=frontend`
- Headed: `npm run test:e2e:headed --workspace=frontend`
- Debug: `npm run test:e2e:debug --workspace=frontend`
- Report: `npm run test:e2e:report --workspace=frontend`
- Update snapshots: `npm run test:e2e:update-snapshots --workspace=frontend`

**Comparison**:
- Setup: Requires `npx playwright install --with-deps`
- Consistency: ⚠️ OS-dependent rendering (fonts, antialiasing)
- Speed: ~30sec (no container overhead)
- IDE integration: ✅ Full (UI mode, inspector, WebStorm)
- CI/CD parity: ⚠️ May differ from CI environment

**Tip**: Use local for active development, switch back to Docker before committing

## Test Examples

### E2E Workflow

Test user workflows and interactions:

```typescript
test('can add expense', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Expense name').fill('Coffee')
    await page.getByPlaceholder('Amount').fill('4.50')
    await page.getByRole('button', { name: 'Add' }).click()

    await expect(page.locator('.expense-name')).toContainText('Coffee')
    await expect(page.locator('.total-amount')).toContainText('4.50')
})
```

### Visual Regression

Screenshot comparison to detect UI changes:

```typescript
test('expense form UI', async ({ page }) => {
    await page.goto('/')
    const form = page.locator('.form-container')

    // Compare to baseline screenshot
    await expect(form).toHaveScreenshot('expense-form.png')
})
```

### Keyboard Navigation

Test keyboard accessibility:

```typescript
test('can submit with Enter key', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Expense name').fill('Test')
    await page.getByPlaceholder('Amount').fill('10.00')
    await page.keyboard.press('Enter')

    await expect(page.locator('.expense-name')).toContainText('Test')
})
```

### Accessibility

WCAG compliance testing with axe-core:

```typescript
test('no accessibility violations', async ({ page }) => {
    await page.goto('/')

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
})
```

## When Tests Fail

Playwright provides rich debugging information:
- Screenshots: Automatically captured on failure
- Videos: Optional recording of test execution
- Traces: Step-by-step replay with DOM snapshots, console logs, network activity
- HTML report: Interactive report with all test results

**View report**: `npm run test:e2e:report --workspace=frontend`

## Visual Regression Workflow

### Remote-Only Visual Testing Philosophy

Visual regression tests are NEVER run locally.

**Rationale**: Running visual tests locally is an anti-pattern due to high flakiness caused by:
- OS rendering differences (macOS vs Linux font hinting, subpixel rendering)
- Docker-on-macOS quirks (host kernel affects rendering even in containers)
- GPU/hardware variations (acceleration, color profiles)
- Timing/network conditions (loading states, animations)

**Solution**: Visual snapshots are ONLY generated, updated, and validated in remote CI environment (GitHub Actions)

### Environment-Based Testing

Project uses TEST_ENV variable to enforce remote-only visual testing:

**Local** (`TEST_ENV=local`, default):
- Behavior: Skips visual regression tests, runs functional E2E tests only
- Who: Local developers

**CI Docker** (`TEST_ENV=ci-docker`):
- Behavior: Runs ALL tests including visual snapshots
- Who: GitHub Actions only

**ECS** (`TEST_ENV=ecs`, future):
- Behavior: Production validation tests
- Who: ECS environment

**What Runs Where**:
- Local developer: Functional E2E ✅, Visual regression ❌, Snapshot updates ❌
- GitHub Actions: Functional E2E ✅, Visual regression ✅, Snapshot updates ✅

### First Run

Creates baseline screenshots in `tests/<test-name>-snapshots/`

### Subsequent Runs

- Pass: UI matches baseline (within threshold)
- Fail: UI differs - test shows visual diff

### Updating Snapshots

How to update visual snapshots when UI changes cause CI visual tests to fail.

#### Option 1: Commit Footer Trigger (Recommended)

1. Add 'Snapshots: update' footer to commit message
2. Push to trigger CI snapshot update
3. Workflow automatically updates snapshots and commits
4. Pull the updated snapshots

Example:
```bash
git commit -m "feat(frontend): Redesign primary button

Changes button color and adds hover animation.

Snapshots: update"
git push
# CI automatically updates snapshots and commits
git pull
```

Note: When pushing multiple commits, workflow checks ALL commits. If ANY commit contains 'Snapshots: update', workflow runs.

#### Option 2: PR Comment Trigger

1. Create PR with your changes
2. Comment on PR: `/update-snapshots`
3. Workflow updates snapshots automatically
4. Review and merge

#### Option 3: Manual Workflow Trigger

1. Push your code changes
2. Go to GitHub Actions → 'Update Visual Snapshots' → Run workflow
3. Workflow updates snapshots and commits to your branch
4. Pull the changes

### Selective Scope Optimization

Optional optimization to speed up snapshot updates when you know specific tests need updating:

**Default** (`Snapshots: update`):
- Behavior: Updates all snapshots (safest)
- Performance: ~2-5 minutes (64 snapshots)

**Visual Only** (`Snapshots: update:visual`):
- Behavior: Update only visual snapshots (tests/visual/)
- When: Only changed CSS/styling, no interaction changes
- Performance: ~30-40 seconds (52 snapshots)

**E2E Only** (`Snapshots: update:e2e`):
- Behavior: Update only e2e snapshots (tests/e2e/)
- When: Only changed keyboard focus behavior
- Performance: ~20-30 seconds (12 snapshots)

**Warning**: Selective scope is an optimization. Use with caution—if unsure, use default 'Snapshots: update' to ensure all affected tests are updated.

### When to Update Snapshots

Visual snapshots capture exact pixel-perfect appearance. Update whenever you intentionally change how something looks.

**Always update after**:

CSS Styling:
- Colors, backgrounds, borders
- Spacing (padding, margin, gap)
- Shadows, gradients, opacity
- Font sizes, weights, or families
- Focus/hover/active state styling

Visual Elements:
- Icons, emojis, badges
- Decorative elements
- Loading spinners, animations
- Visual feedback indicators

Layout Changes:
- Flexbox/grid structure
- Element positioning
- Component sizing
- Responsive breakpoints

Text Content:
- Labels, placeholders, help text
- Error messages
- Button text

**Do NOT update for**:
- Logic/behavior changes (state management, event handlers)
- Test code modifications
- Backend API changes
- Documentation updates
- Configuration changes

### Detection Workflow

**Pre-commit hook**: When committing .svelte or .css files, pre-commit hook displays warning:

```
⚠️  UI Changes Detected
You've modified UI files that may affect visual snapshots:
  📄 packages/frontend/src/components/Button.svelte

If this changes visual appearance, remember to update snapshots:
  • Add "Snapshots: update" footer to commit message, OR
  • Comment /update-snapshots on PR after pushing
```

**CI validation**: If you push without updating snapshots, CI will fail with visual diff errors

**Update process**: Use any of the three methods above (commit footer recommended)

### Best Practices

- Update snapshots in same PR that changes UI (keeps changes atomic)
- Review visual diff artifacts in CI to verify changes are intentional
- If CI visual tests fail unexpectedly, check for unintended style side effects
- Never commit *-darwin.png or platform-specific snapshots (CI will reject them)

### Verifying Changes

1. CI workflow commits snapshot updates with detailed message
2. Review git diff in snapshot files
3. Check uploaded artifacts for visual diffs
4. Ensure only *-linux.png files exist (no *-darwin.png)

### Why This Works

- Consistency: All snapshots generated in identical CI environment
- Reliability: No platform-specific rendering issues
- Audit trail: Automated commits show when/why snapshots changed
- No local setup: Developers don't need Docker/Playwright installed locally
- Golden rule: Visual snapshots are a CI-only concern. Developers write code, CI validates visuals.

### When UI Changes

- Review: `npm run test:e2e:report --workspace=frontend`
- Update baselines: Use one of three update methods above (commit footer recommended)
- Tip: Only update baselines after reviewing diffs and confirming changes are intentional

## Configuration

**File**: `packages/frontend/playwright.config.ts`

**Settings**:
- Browsers: Chromium (desktop + mobile)
- Auto-start server: Vite starts automatically before tests
- Screenshots: Only on failure
- Videos: Retained on failure
- Traces: On first retry
- CI optimized: Retries, single worker, GitHub Actions reporter

## Writing New Tests

### Step 1: Create Test File

Choose appropriate directory:
- `tests/e2e/` - User workflows and interactions
- `tests/visual/` - UI screenshot comparisons
- `tests/accessibility/` - WCAG compliance

### Step 2: Use Descriptive Test Names

Example: `test('complete expense workflow - add, view, remove', async ({ page }) => { ... })`

### Step 3: Follow Project Patterns

Guidelines:
- Use page.getByRole(), page.getByPlaceholder() for accessibility
- Test keyboard shortcuts (Enter, Tab, Cmd+Enter)
- Verify both success and error states
- Check empty states and edge cases

### Step 4: Add Visual Checks for Critical UI

Example: `await expect(page).toHaveScreenshot('critical-feature.png')`

## Best Practices

- Test user behavior, not implementation: Use accessible selectors (getByRole, getByPlaceholder)
- Wait for content: Use expect() with auto-waiting instead of manual waits
- Independent tests: Each test should work in isolation
- Visual tests for UI: Use screenshots to catch layout/CSS changes
- Keyboard tests for accessibility: Verify Tab, Enter, Escape work as expected
- Mobile testing: Test responsive breakpoints with different viewports

## CI/CD Integration

### Recommended: Docker-Based Tests

Docker-based tests for consistency with local development:

```yaml
- name: Run E2E tests in Docker
  run: npm run test:e2e:docker

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: packages/frontend/playwright-report/
```

### Alternative: Local Playwright Installation

If Docker not available in CI:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e --workspace=frontend

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: packages/frontend/playwright-report/
```

**Key points**:
- Docker approach matches local development environment exactly
- Headless browser execution
- Retries on failure (reduces flakiness)
- Artifacts uploaded (screenshots, videos, traces)

## Troubleshooting

### Platform Differences

- **Problem**: Tests fail locally but pass in CI (or vice versa)
- **Cause**: Platform-dependent rendering (fonts, antialiasing)
- **Solution**: Use Docker for both local and CI to ensure identical environments
- **Alternative**: If using local testing, increase visual diff threshold in playwright.config.ts

### Flaky Tests

- **Problem**: Tests pass sometimes, fail other times
- **Causes**:
  - Using manual setTimeout or waitFor instead of auto-waiting
  - Tests not properly isolated (shared test data, no cleanup)
  - Race conditions in application code (async state updates)
- **Solutions**:
  - Use await expect() with auto-waiting
  - Ensure proper test isolation (independent test data, cleanup between tests)
  - Check for race conditions in application code

### Visual Test Failures

- **Problem**: Visual tests fail unexpectedly
- **Steps**:
  1. Review diff in test report: `npm run test:e2e:report --workspace=frontend`
  2. Check if CSS, fonts, or layout intentionally changed
  3. Update baselines if change is expected: `npm run test:e2e:update-snapshots --workspace=frontend`

### Debugging Tips

- Interactive debugging: `npm run test:e2e:ui --workspace=frontend` (local only)
- Step through: `npm run test:e2e:debug --workspace=frontend` (local only)
- Pause execution: Add `await page.pause()` in test code
- Manual screenshots: Use `await page.screenshot({ path: 'debug.png' })` at any point
- Browser console: Run in headed mode to see console output

## Reference

- Playwright docs: https://playwright.dev/docs/intro
- Project test directory: `packages/frontend/tests/`
- Docker compose file: `docker-compose.e2e.yml`
- Dockerfile: `packages/frontend/Dockerfile.e2e`
- Config: `packages/frontend/playwright.config.ts`

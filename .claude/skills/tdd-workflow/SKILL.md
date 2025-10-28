---
name: tdd-workflow
description: Mandatory Test-Driven Development workflow for Trip Settle features. Use when implementing new features, fixing bugs, or modifying existing functionality (except docs/config). Enforces Red-Green-Refactor cycle with unit tests only during TDD, E2E tests in pre-push validation.
---

# TDD Workflow

Test-Driven Development workflow for all feature implementations in Trip Settle.

## When to Use

This workflow applies to:
- All feature implementations (frontend, backend, infrastructure)
- Bug fixes requiring code changes
- Refactoring existing functionality

**Exceptions** (relaxed workflow):
- Documentation-only changes (*.md files)
- Configuration tweaks (tsconfig, prettier, eslint)
- Emergency hotfixes (tests required immediately after)

## Overview

The TDD workflow follows these phases:

1. **Plan** → Break down feature, create task list
2. **Red** → Write failing tests first (UNIT TESTS ONLY)
3. **Green** → Implement minimum code to pass tests
4. **Verify** → Run tests and quality checks (< 30s)
5. **Refactor** → Clean up code (optional)
6. **Commit** → Create descriptive commit

**Separate from TDD**: **Pre-Push Validation** → Run E2E/integration tests before pushing (2-5 min)

## Critical Testing Strategy

⚠️ **CRITICAL**: During TDD Red-Green-Refactor cycles, ONLY write and run UNIT tests.

- **Unit tests**: Fast feedback (< 5 seconds) - run during TDD cycles
- **Integration tests**: Write during Red phase, run during Pre-Push Validation
- **E2E tests**: Write when appropriate, run during Pre-Push Validation

Running E2E tests during TDD cycles takes several minutes and destroys fast feedback.

See CLAUDE.md "Testing Strategy & Test Pyramid" for detailed execution contexts.

## Phase 1: Plan

Break down the feature into clear, testable requirements.

**Actions:**
- Identify affected components (frontend, backend, or both)
- Define success criteria and expected behavior
- Use TodoWrite tool to create and track implementation tasks
- Consider edge cases and error scenarios

**Questions to Answer:**
- What is the user-facing behavior we're implementing?
- Which components/modules will be affected?
- What are the success criteria?
- Are there accessibility requirements (keyboard, screen reader)?

**Output**: Clear task list with testable acceptance criteria

## Phase 2: Red (Write Tests First)

Write failing UNIT tests before any implementation code.

### Test Types for TDD

**Backend Unit Tests** (run during TDD):
- Framework: Jest
- Pattern: `*.spec.ts`
- Purpose: Test individual functions, services, controllers
- Command: `npm run test --workspace=backend`
- Speed: < 5 seconds
- Example: "ExpenseService.calculateTotal() returns correct sum"

**Backend Integration Tests** (write during Red, run during Pre-Push):
- Framework: Jest
- Pattern: `*.integration.spec.ts`
- Purpose: Test database operations, module interactions
- Command: `npm run test --workspace=backend`
- Speed: 10-30 seconds
- Example: "ExpenseController POST /api/expenses creates record in DB"

**Frontend Unit Tests** (run during TDD):
- Framework: Vitest
- Pattern: `*.test.ts`, `*.spec.ts`
- Purpose: Test component logic, utilities, state management
- Command: `npm run test --workspace=frontend`
- Speed: < 5 seconds
- Example: "ExpenseForm validates amount input correctly"

### Test Types for Pre-Push Validation

**Frontend E2E Tests** (write during Red, run before push):
- Framework: Playwright
- Pattern: `tests/e2e/*.spec.ts`
- Purpose: Test user workflows and interactions end-to-end
- Command: `npm run test:e2e:docker`
- Speed: 2-5 minutes
- Example: "User can add, edit, and delete expenses"

**Frontend Visual Tests** (CI-only):
- Framework: Playwright
- Pattern: `tests/visual/*.spec.ts`
- Purpose: Catch unintended UI changes with screenshot comparison
- Command: CI-only (automated)
- Speed: 2-5 minutes

**Frontend Keyboard Tests** (write during Red, run before push):
- Framework: Playwright
- Pattern: `tests/e2e/keyboard-*.spec.ts`
- Purpose: Ensure keyboard accessibility (Tab, Enter, Escape, shortcuts)
- Command: `npm run test:e2e:docker`
- Speed: 2-5 minutes

### Validation

- **Requirement**: UNIT tests MUST fail initially
- **Rationale**: Failing tests prove they're actually testing the new feature
- **Tip**: Run UNIT tests immediately after writing them to verify they fail (< 5s)
- **Critical**: Do NOT run E2E tests to verify failure - they take minutes, not seconds

### Best Practices

- Write UNIT tests for logic, write E2E tests for workflows (run later)
- Test behavior, not implementation details
- Include both happy path and error cases
- Use descriptive test names: 'should validate email format'
- For frontend, use accessible selectors (getByRole, getByPlaceholder)
- Keep TDD cycles fast: unit tests only (< 5s feedback)

## Phase 3: Green (Implement Feature)

Write minimum code to make all tests pass.

### Guidelines

- Follow existing code patterns and architecture
- Ensure type safety (TypeScript strict mode)
- Implement proper error handling
- Maintain accessibility and keyboard support
- Keep it simple - only write code needed to pass tests

### Code Quality

- Use TypeScript types, avoid 'any'
- Follow naming conventions (camelCase for variables, PascalCase for components)
- Add JSDoc comments for complex functions
- Handle edge cases identified in planning phase

### Accessibility Checklist

- Forms submit with Enter key, clear with Escape
- Interactive elements accessible via Tab key
- ARIA labels for screen readers where needed
- Keyboard shortcuts documented in KeyboardHint component

**Tip**: Resist the urge to over-engineer. Write the simplest code that passes tests.

## Phase 4: Verify Tests Pass

Run UNIT tests and quality checks (< 30 seconds total).

⚠️ **CRITICAL**: Only run UNIT tests during Verify phase. E2E tests take minutes and are run during Pre-Push Validation.

### Commands for TDD Cycle

**Backend:**
- Unit tests: `npm run test --workspace=backend`
- Coverage: `npm run test:cov --workspace=backend`

**Frontend:**
- Unit tests: `npm run test --workspace=frontend`
- Type check: `npm run type-check --workspace=frontend`

**Quality:**
- Format: `npm run format`
- Lint: `npm run lint`
- Build: `npm run build`

### Success Criteria

- ✅ All new UNIT tests pass (< 5s)
- ✅ No regressions in existing UNIT tests
- ✅ Code formatting passes (Prettier)
- ✅ Linting passes (ESLint)
- ✅ TypeScript compilation succeeds
- ✅ Build completes without errors

**Performance Target**: < 30 seconds total for all checks

### If Tests Fail

- Review test expectations - are they correct?
- Check implementation logic for bugs
- Verify test setup/teardown is correct
- Use debugger or console.log to trace execution
- For unit tests: Use watch mode for faster iteration

## Phase 5: Refactor (Optional)

Clean up implementation while keeping tests green.

### When to Refactor

- Code duplication can be extracted to shared functions
- Complex conditionals can be simplified
- Performance can be improved without changing behavior
- Names can be more descriptive

### Guidelines

- Keep all tests passing (green) throughout refactoring
- Make one change at a time, verify tests after each
- Extract reusable components/functions/utilities
- Improve readability and maintainability

### Common Refactorings

- Extract method: Pull complex logic into named functions
- Extract component: Pull reusable UI into separate components
- Consolidate conditionals: Simplify complex if/else chains
- Rename variables: Use more descriptive names

**Tip**: Refactoring is optional but encouraged. Skip if code is already clean.

## Phase 6: Commit

Create descriptive commit following project conventions.

### Steps

1. Stage changes: `git add .`
2. Review git-commit-rules skill for format and examples
3. Write commit message following conventional commit format
4. Include what changed and why (not how)
5. Mention tests added in commit body

### Format

- Pattern: `type(scope): Subject line`
- Example: `feat(frontend): Add expense edit functionality`

**Skill**: Use `.claude/skills/git-commit-rules/commit-rules.yaml` for conventions

## Pre-Push Validation (Outside TDD Cycle)

Run comprehensive tests BEFORE pushing to remote (manual, on-demand).

⚠️ **This is NOT part of the TDD Red-Green-Refactor cycle.** Run these tests MANUALLY before `git push` to catch integration issues.

Pre-push validation is EXPENSIVE (2-5 minutes) and should NOT be run during active development.

### When to Run

- Before pushing commits to remote repository
- After completing multiple TDD cycles (multiple commits ready)
- When E2E tests were written but not yet validated
- Before creating a pull request

### Commands

**Backend:**
- Unit tests: `npm run test --workspace=backend`
- Integration tests: `npm run test:e2e --workspace=backend`
- Coverage: `npm run test:cov --workspace=backend`

**Frontend:**
- Unit tests: `npm run test --workspace=frontend`
- E2E tests: `npm run test:e2e:docker`
- Type check: `npm run type-check --workspace=frontend`

**Quality:**
- Format check: `npm run format:check`
- Lint: `npm run lint`
- Build: `npm run build`

### Success Criteria

- ✅ All unit tests pass
- ✅ All integration tests pass (backend)
- ✅ All E2E functional tests pass (frontend)
- ✅ Code formatting is correct
- ✅ No linting errors
- ✅ Build succeeds

### Performance Expectations

- Backend: 30-60 seconds (unit + integration)
- Frontend: 2-5 minutes (unit + E2E via Docker)
- Total: 3-6 minutes for full validation

### Workflow

1. Complete multiple TDD cycles (red-green-refactor-commit)
2. Run pre-push validation commands
3. Fix any issues discovered by E2E or integration tests
4. Run unit tests again to verify fixes (fast)
5. Push to remote: `git push`

**Note**: E2E tests are NOT run in git hooks due to execution time. Developers are responsible for running pre-push validation manually. Visual regression tests are CI-only and never run locally.

## Selective E2E Execution (Speed Optimization)

Run only E2E tests affected by code changes to speed up validation.

### Rationale

- Running ALL E2E tests (7 files × 4 browsers = 28 suites) takes 2-5 minutes
- Running SELECTIVE tests (1-2 files × 1 browser) takes 10-30 seconds

During local development, run only tests related to changed components. Full test suite runs automatically in CI to catch cross-feature regressions.

### Local vs CI Configuration

**Local Development:**
- Browser config: Single browser (webkit/Safari) - configured in playwright.config.ts
- Test selection: Selective - only affected test files
- Speed: 10-30 seconds
- When: Pre-push validation on developer machine

**CI/Docker:**
- Browser config: Full matrix (chromium, webkit, 2 mobile) - configured in playwright.config.ts
- Test selection: All tests
- Speed: 2-5 minutes
- When: Automated on push/PR

### Component-to-Test Mapping

**Expense Features:**
- Components: ExpenseTracker, ExpenseForm, ExpenseList, CurrencySelector
- Test files: expense-workflow.spec.ts, keyboard-navigation.spec.ts
- Command: `npx playwright test expense-workflow keyboard-navigation`

**Onboarding Flow:**
- Components: Onboarding.svelte, lib/router.svelte.ts
- Test files: onboarding.spec.ts, routing.spec.ts
- Command: `npx playwright test onboarding routing`

**DevTools:**
- Components: DevTools, SystemStatus, LocalStorageViewer
- Test files: local-storage-viewer.spec.ts
- Command: `npx playwright test local-storage-viewer`

**Keyboard Hints:**
- Components: KeyboardHint.svelte, lib/keyboardHint.ts
- Test files: keyboard-navigation.spec.ts
- Command: `npx playwright test keyboard-navigation`

**Shared Components:**
- Components: App.svelte, main.ts, config/*
- Recommendation: Run smoke tests (expense-workflow + onboarding) or full suite
- Command: `npx playwright test expense-workflow onboarding`

### Usage Examples

**By File Pattern:**
- `npx playwright test expense` → Matches expense-workflow.spec.ts
- `npx playwright test onboarding routing` → Matches multiple files
- `npx playwright test local-storage` → Matches local-storage-viewer.spec.ts

**By Grep Pattern:**
- `npx playwright test --grep "Expense"` → All tests with "Expense" in describe()
- `npx playwright test --grep "LocalStorage"` → LocalStorageViewer tests
- `npx playwright test --grep "keyboard"` → All keyboard-related tests

**Smoke Tests:**
- Command: `npx playwright test expense-workflow onboarding`
- Coverage: Core user flows (add expense, complete onboarding)
- Speed: 15-30 seconds

### Claude Code Responsibilities

**What Claude Can Do:**
- ✅ Write/update E2E test files when features change
- ✅ Suggest which tests human should run based on changed files
- ✅ Include component-to-test mapping in recommendations
- ✅ Remind human to run E2E tests before pushing

**What Claude Cannot Do:**
- ❌ NEVER run E2E tests (any command with test:e2e, playwright test)
- ❌ NEVER execute npm run test:e2e:docker
- ❌ NEVER execute npx playwright test

**Suggestion Template:**
```
I've updated {component}. Before pushing, you should run:

npx playwright test {suggested-test-files}

This will test only the affected features (takes ~30 seconds locally).
Alternatively, run the full suite: npm run test:e2e:docker (takes 2-5 minutes).
```

### Best Practices

- Run selective tests during pre-push validation for speed
- Let CI run full test suite for comprehensive coverage
- If unsure which tests to run, use smoke tests or full suite
- Update component-to-test mapping as codebase evolves
- Local config uses webkit only (playwright.config.ts isLocalDev flag)

## Examples

### Example 1: Frontend Feature (Expense Edit)

**Scenario**: User requests "Add expense edit functionality"

**Plan:**
- Create TodoWrite list: Research → Write tests → Implement → Verify → Commit
- Identify components: ExpenseList, ExpenseForm, API client
- Success criteria: Edit button, inline edit form, saves to backend

**Red:**
- Write UNIT test in ExpenseList.test.ts: Test edit button renders and calls handler
- Write UNIT test in ExpenseForm.test.ts: Test inline edit mode state management
- Run: `npm run test --workspace=frontend` (< 5s)
- Result: ❌ Tests fail (expected - feature doesn't exist)
- NOTE: Also write E2E test (tests/e2e/edit-expense.spec.ts) but DON'T run it yet

**Green:**
- Add edit button to ExpenseList items
- Create inline edit form in ExpenseForm
- Wire up PUT request to backend API
- Add keyboard shortcuts (Enter to save, Escape to cancel)

**Verify:**
- `npm run test --workspace=frontend` → ✅ Unit tests pass (< 5s)
- `npm run format && npm run lint` → ✅ Quality checks pass
- `npm run build` → ✅ Build succeeds

**Refactor:**
- Extract edit form logic to separate component
- Consolidate save/cancel handlers
- Re-run unit tests → ✅ Still passing

**Commit:**
- `git add .`
- `git commit -m 'feat(frontend): Add expense edit functionality'`

**Pre-Push:**
- Before pushing: `npm run test:e2e:docker` (2-5 min)
- E2E test validates full edit workflow end-to-end
- If E2E fails: Fix issue, run unit tests (fast), then retry E2E
- `git push`

### Example 2: Backend Bug Fix (Duplicate Expenses)

**Scenario**: Users report duplicate expenses created on double-click

**Plan:**
- Root cause: No idempotency check in POST /api/expenses
- Solution: Add unique constraint + service-level validation

**Red:**
- Write UNIT test in expenses.service.spec.ts: Test duplicate detection logic
- Write UNIT test in expenses.controller.spec.ts: Test 409 response
- Run: `npm run test --workspace=backend` (< 5s)
- Result: ❌ Tests fail (expected - validation doesn't exist)
- NOTE: Also write integration test but save it for pre-push validation

**Green:**
- Add unique constraint to ExpenseEntity
- Update service to catch duplicate key error
- Return 409 with helpful error message

**Verify:**
- `npm run test --workspace=backend` → ✅ Unit tests pass (< 5s)
- `npm run format && npm run lint` → ✅ Quality checks pass
- `npm run build` → ✅ Build succeeds

**Commit:**
- `git commit -m 'fix(backend): Prevent duplicate expense creation'`

**Pre-Push:**
- Before pushing: `npm run test:e2e --workspace=backend`
- Integration test validates DB-level constraint enforcement
- `git push`

**Note**: Key differences from old workflow:
- Red/Green/Verify cycles use UNIT tests only (< 5s feedback)
- E2E/Integration tests are written but NOT run during TDD cycles
- E2E/Integration tests run during Pre-Push Validation (manual, before git push)
- This keeps TDD cycles fast while ensuring comprehensive test coverage

## Best Practices

### General

- Small, focused commits - one feature per commit
- Keep tests fast - use mocks/stubs where appropriate
- Test behavior, not implementation - refactor freely without breaking tests
- Write tests you'd want to read 6 months from now

### Frontend Specific

- E2E tests for user workflows, unit tests for component logic
- Visual regression tests catch unintended CSS changes
- Always test keyboard navigation for interactive features
- Use Playwright UI mode (`npm run test:e2e:ui`) for test debugging

### Backend Specific

- Unit tests for business logic, integration tests for DB operations
- Test both success and error paths
- Mock external dependencies (APIs, databases) in unit tests
- Use pg-mem for fast in-memory database tests

## Tools and Commands

### Test Execution

- All tests: `npm test`
- Backend unit: `npm run test --workspace=backend`
- Backend watch: `npm run test:watch --workspace=backend`
- Frontend unit: `npm run test --workspace=frontend`
- Frontend E2E: `npm run test:e2e:docker`
- Frontend E2E UI: `npm run test:e2e:ui --workspace=frontend`

### Quality Checks

- Format: `npm run format`
- Format check: `npm run format:check`
- Lint: `npm run lint`
- Type check: `npm run type-check --workspace=frontend`
- Build: `npm run build`

### Debugging

- Playwright UI: `npm run test:e2e:ui --workspace=frontend`
- Playwright debug: `npm run test:e2e:debug --workspace=frontend`
- Jest watch: `npm run test:watch --workspace=backend`

## Enforcement

Claude Code MUST follow this workflow for all feature implementations.

**Rationale**: TDD ensures:
- Features work as intended before merging
- Regressions are caught immediately
- Code is testable and maintainable
- Documentation through tests
- Confidence to refactor
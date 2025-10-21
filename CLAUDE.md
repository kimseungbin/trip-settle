# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trip Settle is a full-stack TypeScript monorepo for managing trip expense settlements. The project uses npm workspaces to manage three main packages:

- **frontend**: Svelte application with Vite
- **backend**: NestJS REST API
- **infra**: AWS CDK infrastructure as code

## Design Principles

### User Experience First

This project prioritizes exceptional user experience:

- **Keyboard Support**: All interactive features must be fully keyboard accessible
  - Forms should support Enter to submit, Escape to cancel/clear
  - Lists should support arrow key navigation where appropriate
  - Tab order must be logical and intuitive
  - Provide keyboard shortcuts for common actions
- **Accessibility**: Follow ARIA guidelines for screen readers and assistive technologies
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Performance**: Fast, smooth interactions with minimal latency
- **Feedback**: Clear visual and interaction feedback for all user actions

When implementing features, always consider:
1. Can this be done without a mouse?
2. Is the interaction intuitive and discoverable?
3. Does it work well on mobile devices?
4. Is it accessible to users with disabilities?

## Feature Development Workflow (MANDATORY)

**All new features must follow this Test-Driven Development (TDD) workflow:**

### Workflow Steps

1. **Plan**: Break down the feature into clear, testable requirements
   - Identify affected components (frontend, backend, or both)
   - Define success criteria
   - Use TodoWrite tool to create and track tasks

2. **Write Tests First** (Red Phase): Write failing tests before implementation
   - **Backend**: Jest unit tests (`*.spec.ts`) and/or integration tests
   - **Frontend**:
     - Vitest unit tests for components/utilities
     - Playwright E2E tests for user workflows and interactions
     - Visual regression tests if UI changes
     - Keyboard navigation tests for interactive elements
   - Tests must fail initially (proving they test the feature)

3. **Implement Feature** (Green Phase): Write minimum code to pass tests
   - Follow existing code patterns and architecture
   - Ensure type safety and proper error handling
   - Maintain accessibility and keyboard support

4. **Verify Tests Pass**: Run full test suite
   - Backend: `npm run test --workspace=backend`
   - Frontend: `npm run test --workspace=frontend && npm run test:e2e --workspace=frontend`
   - Ensure no regressions in existing tests
   - Run formatting: `npm run format`
   - Run linting: `npm run lint`

5. **Refactor** (Optional): Clean up implementation
   - Improve code quality while keeping tests green
   - Extract reusable components/functions
   - Optimize performance if needed

6. **Commit**: Create descriptive commit following project style
   - Use the `git-commit-rules` skill to generate standardized commit messages
   - Reference the feature and tests added
   - Follow conventional commit format defined in `.claude/skills/git-commit-rules/commit-rules.yaml`

### Exceptions

This workflow may be relaxed only for:
- Documentation-only changes (*.md files)
- Configuration tweaks
- Emergency hotfixes (but tests must be added immediately after)

### Example

```bash
# 1. Plan
# User requests: "Add expense edit functionality"
# Create todos: Research existing code -> Write tests -> Implement -> Verify -> Commit

# 2. Write Tests First
npm run test:e2e --workspace=frontend -- tests/e2e/edit-expense.spec.ts
# ❌ Tests fail (expected - feature doesn't exist)

# 3. Implement Feature
# Add edit button, edit form, update API call, etc.

# 4. Verify Tests Pass
npm run test:e2e --workspace=frontend
npm run test --workspace=frontend
npm run format
# ✅ All tests pass

# 5. Commit (using git-commit-rules skill)
# The skill will generate a message like:
git add .
git commit -m "feat(frontend): Add expense edit functionality

- Add edit button to expense items
- Create inline edit form with keyboard support
- Add Playwright E2E tests for edit workflow
- Ensure Escape cancels edit, Enter saves"
```

**Claude Code must follow this workflow for all feature implementations.**

## Monorepo Structure

```
trip-settle/
├── packages/
│   ├── frontend/     # Svelte + Vite + TypeScript
│   ├── backend/      # NestJS + TypeORM + PostgreSQL
│   └── infra/        # AWS CDK
└── package.json      # Root workspace configuration
```

## Development Commands

### Root Level (run from project root)

```bash
# Install all dependencies
npm install

# Run both frontend and backend in development mode
npm run dev

# Build all packages
npm run build

# Run tests across all packages
npm test

# Lint all packages
npm run lint

# Format code
npm run format
npm run format:check
```

### Frontend (packages/frontend)

```bash
# Development server (http://localhost:5173)
npm run dev --workspace=frontend

# Build for production
npm run build --workspace=frontend

# Preview production build
npm run preview --workspace=frontend

# Run unit tests (Vitest)
npm run test --workspace=frontend
npm run test:ui --workspace=frontend

# Run E2E tests (Playwright)
npm run test:e2e --workspace=frontend
npm run test:e2e:ui --workspace=frontend
npm run test:e2e:headed --workspace=frontend
npm run test:e2e:debug --workspace=frontend
npm run test:e2e:report --workspace=frontend
npm run test:e2e:update-snapshots --workspace=frontend

# Type checking
npm run type-check --workspace=frontend
```

### Backend (packages/backend)

```bash
# Development server with watch mode (http://localhost:3000)
npm run dev --workspace=backend

# Build
npm run build --workspace=backend

# Start production server
npm run start --workspace=backend

# Run tests
npm run test --workspace=backend
npm run test:watch --workspace=backend
npm run test:cov --workspace=backend
npm run test:e2e --workspace=backend
```

### Infrastructure (packages/infra)

```bash
# Build TypeScript
npm run build --workspace=infra

# Synthesize CloudFormation template
npm run synth --workspace=infra

# Show infrastructure diff
npm run diff --workspace=infra

# Deploy to AWS
npm run deploy --workspace=infra

# Destroy infrastructure
npm run destroy --workspace=infra
```

## Architecture

### Frontend (Svelte)

- **Framework**: Svelte 5 with TypeScript
- **Build Tool**: Vite 6
- **Testing**: Vitest 2
- **API Communication**: Proxied to backend via Vite (`/api` → `http://localhost:3000`)
- **Entry Point**: `src/main.ts` mounts `App.svelte` to `#app`
- **State Management**: Uses Svelte 5 runes (`$state`, `$derived`, `$props`, `$bindable`, `$effect`)
- **Component Props**: Uses `$props()` instead of `export let`
- **Event Handlers**: Uses event attributes (`onclick`, `onkeydown`) instead of `on:` directives

### Backend (NestJS)

- **Framework**: NestJS with Express
- **Database**: PostgreSQL with TypeORM
- **ORM**: TypeORM (configured in `app.module.ts`)
- **API Prefix**: `/api` (all routes prefixed)
- **CORS**: Enabled for frontend origin
- **Validation**: Global validation pipe with class-validator
- **Environment**: TypeScript configuration files (no .env files)

Key backend architecture:
- `main.ts`: Bootstrap application, configure CORS, validation, and global prefix
- `app.module.ts`: Root module with TypeORM configuration
  - Uses `dataSourceFactory` to provide pre-initialized pg-mem DataSource in development
  - For production, creates standard PostgreSQL DataSource
- `database.config.ts`: Database configuration factory
  - **Development**: Uses `pg-mem` for in-memory PostgreSQL (zero setup required)
    - Registers required PostgreSQL functions (`version()`, `current_database()`)
    - Creates and initializes DataSource before NestJS module initialization
  - **Production**: Uses real PostgreSQL configured via environment variables
- Auto-synchronize enabled in development (disabled in production)

### Infrastructure (AWS CDK)

- **VPC**: 2 AZs with 1 NAT gateway
- **Database**: RDS PostgreSQL 15 (t3.micro)
  - Private subnets with egress
  - 20GB storage with autoscaling to 100GB
  - Snapshot on deletion
- **Entry Point**: `bin/infra.ts`
- **Stack**: `lib/trip-settle-stack.ts`

## Configuration System

The project uses a TypeScript-based configuration system with **zero .env files**. Configuration is managed through
type-safe TS files.

### Structure

```
config/
├── types.ts                  # Shared types
├── environments/
│   ├── local.ts             # Local development (default values)
│   ├── development.ts       # Dev environment (reads env vars)
│   └── production.ts        # Production (reads env vars)
└── index.ts                 # Exports config based on NODE_ENV

packages/
├── backend/src/config/      # Backend-specific config
├── frontend/src/config/     # Frontend-specific config
└── infra/config/            # Infrastructure-specific config
```

### Environments

- **`local`** (default, no NODE_ENV): Hardcoded safe defaults, zero configuration needed
- **`development`**: Reads from environment variables injected by CI/CD
- **`production`**: Reads from environment variables injected by CI/CD (strict validation)

### Usage

```typescript
// Import config in any package
import { config } from './config'

// Access typed configuration
const port = config.port
const dbConfig = config.database
```

### Adding Config Values

1. Update `config/types.ts` with new fields
2. Add default values to `config/environments/local.ts`
3. Add environment variable mapping to `development.ts` and `production.ts`
4. Use in packages via their local config imports

## Database Configuration

Backend uses TypeORM with PostgreSQL.

### Local Development

**No configuration needed!** The backend uses `pg-mem` for in-memory PostgreSQL in local mode. Simply run
`npm run dev --workspace=backend` and the database will be available immediately with zero setup.

### Development/Production

Configure via environment variables injected by CI/CD (e.g., ECS):

```bash
# Required environment variables
NODE_ENV=development  # or production
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=trip_settle

# Optional (have defaults)
BACKEND_PORT=3000
CORS_ORIGIN=https://your-frontend-url
```

Entity files should follow the pattern `*.entity.ts` and will be auto-loaded by TypeORM.

## Code Quality

### Linting
- ESLint configured per package
- Frontend: Svelte-specific rules
- Backend: NestJS-specific rules
- Infra: TypeScript-only rules

### Formatting
- Prettier with Svelte plugin
- Config: `.prettierrc.yaml` (root level)
- 120 character line width, tabs (width: 4), single quotes, no semicolons, ES5 trailing commas

### Testing
- Frontend: Vitest with jsdom (unit tests), Playwright (E2E tests)
- Backend: Jest with ts-jest
- Infra: Jest with ts-jest
- E2E tests: Playwright for frontend, Jest for backend API

## Adding New Features

### Backend API Endpoints

1. Generate resource: `nest g resource <name>` (run in `packages/backend`)
2. Create DTOs with class-validator decorators
3. Create entity with TypeORM decorators
4. Implement service logic
5. Add tests (`*.spec.ts`)

### Frontend Components

1. Create `.svelte` files in `src/`
2. Use `<script lang="ts">` for TypeScript
3. Proxy API calls to `/api` (auto-proxied to backend)

### Infrastructure Resources

1. Add constructs to `lib/trip-settle-stack.ts`
2. Use CDK L2 constructs when available
3. Run `npm run diff --workspace=infra` before deploying
4. Export important values with `CfnOutput`

## Development Workflow

1. **Install dependencies**: `npm install` (only needed once)
2. **Start backend**: `npm run dev --workspace=backend` (no database setup required!)
3. **Start frontend**: `npm run dev --workspace=frontend`
4. Frontend at `http://localhost:5173`, Backend at `http://localhost:3000`
5. Make changes with hot reload enabled
6. Run tests before committing
7. Format code with `npm run format`

Note: The development environment uses pg-mem for zero-configuration PostgreSQL. No need to install or configure a database locally!

## TypeScript Configuration

- Frontend: ESNext target with bundler module resolution
- Backend: ES2021 target with CommonJS modules
- Infra: ES2020 target with CommonJS modules
- All packages use strict type checking (backend has relaxed settings for NestJS compatibility)

## Testing & CI/CD Readiness

This section tracks the implementation status of tests needed for continuous integration. Tests ensure code quality, prevent regressions, and validate functionality before deployment.

### Backend Tests (NestJS + Jest)

#### Unit Tests
- [ ] AppController tests (`app.controller.spec.ts`)
- [ ] AppService tests (`app.service.spec.ts`)
- [ ] Database configuration tests (`database.config.spec.ts`)

#### Integration Tests
- [ ] TypeORM entity CRUD operations
- [ ] Database connection with pg-mem
- [ ] Environment-specific configuration loading

#### E2E Tests (test/jest-e2e.json)
- [ ] Health check endpoint (`GET /api/health`)
- [ ] Hello endpoint (`GET /api`)
- [ ] CORS configuration validation
- [ ] Global validation pipe behavior

#### Backend Infrastructure Tests
- [ ] Module initialization tests
- [ ] Dependency injection validation

### Frontend Tests (Svelte + Vitest)

#### Component Unit Tests
- [ ] App.svelte component tests
- [ ] ExpenseTracker.svelte component tests
- [ ] ExpenseForm.svelte component tests
- [ ] ExpenseList.svelte component tests
- [ ] CurrencySelector.svelte component tests
- [ ] SystemStatus.svelte component tests
- [ ] KeyboardHint.svelte component tests

#### Integration Tests (Playwright E2E)
- [x] ExpenseTracker with form and list integration
- [x] Currency selection flow
- [x] Expense CRUD operations (add, delete)

#### Accessibility Tests (Playwright + axe-core) - TODO
- [ ] Keyboard navigation (Enter, Escape, Arrow keys)
- [ ] Tab order validation
- [ ] ARIA attributes and roles
- [ ] Screen reader compatibility

**Note**: Accessibility test suite exists but is marked with `test.fixme()` and will be implemented later after the UI is stabilized.

#### User Interaction Tests (Playwright E2E)
- [x] Form submission with Enter key
- [x] Form clearing with Escape key
- [x] Currency selector keyboard navigation
- [x] Mobile touch interactions

### Infrastructure Tests (AWS CDK + Jest)

#### CDK Tests
- [ ] Stack synthesis (CloudFormation generation)
- [ ] VPC configuration validation
- [ ] RDS PostgreSQL configuration
- [ ] Snapshot tests for CloudFormation templates
- [ ] Resource tagging validation

#### Infrastructure Unit Tests
- [ ] TripSettleStack construct tests
- [ ] Database security group rules
- [ ] VPC subnet configuration

### Cross-Cutting Tests

#### Code Quality
- [ ] ESLint validation (all packages)
- [ ] Prettier formatting checks (all packages)
- [ ] TypeScript compilation (all packages)
- [ ] Type-checking (frontend with svelte-check)

#### Build Validation
- [ ] Frontend production build
- [ ] Backend production build
- [ ] Infrastructure CDK synth
- [ ] All workspaces build in CI

#### Security & Dependencies
- [ ] npm audit for vulnerabilities
- [ ] Dependency license compliance
- [ ] No hardcoded secrets in code

### Integration Tests (Frontend + Backend)

#### API Contract Tests
- [ ] Frontend API client tests
- [ ] Backend endpoint availability
- [ ] CORS configuration between frontend and backend
- [ ] API response format validation

#### End-to-End Scenarios
- [ ] Full expense workflow (create, read, update, delete)
- [ ] Multi-currency expense handling
- [ ] System status indicator shows backend connectivity

### CI Pipeline Requirements

#### Pre-Commit Checks
- [ ] Format check passes
- [ ] Lint check passes
- [ ] Type check passes
- [ ] Unit tests pass

#### CI Build Steps
- [ ] Install dependencies
- [ ] Build all packages
- [ ] Run all tests
- [ ] Generate test coverage reports
- [ ] Validate test coverage thresholds

#### Environment-Specific Tests
- [ ] Tests run with NODE_ENV=local
- [ ] Tests run with NODE_ENV=development
- [ ] Tests run with NODE_ENV=production (mocked externals)

### Test Coverage Goals

- Backend: 80% coverage (lines, branches, functions, statements)
- Frontend: 70% coverage (components, utilities)
- Infrastructure: 90% coverage (CDK constructs)

### Running Tests Locally

```bash
# Run all tests across all packages
npm test

# Run tests for specific package
npm run test --workspace=backend
npm run test --workspace=frontend
npm run test --workspace=infra

# Run tests with coverage
npm run test:cov --workspace=backend
npm run test --workspace=frontend -- --coverage

# Run tests in watch mode
npm run test:watch --workspace=backend
npm run test --workspace=frontend -- --watch

# Run E2E tests
npm run test:e2e --workspace=backend
```

## Playwright E2E Testing Guide

The frontend uses **Playwright** for end-to-end, visual regression, keyboard navigation, and accessibility testing. Playwright automates real browsers to test the application exactly as users interact with it.

### Why Playwright?

Playwright catches UI breakage that unit tests miss:
- **Visual Regressions**: Screenshot comparisons detect layout shifts, CSS changes, missing elements
- **Functional Testing**: Verifies forms, buttons, navigation, and user workflows actually work
- **Keyboard Accessibility**: Ensures all features work without a mouse (critical for this project)
- **WCAG Compliance**: Automated accessibility audits catch contrast, ARIA, and semantic HTML issues

### Test Structure

```
packages/frontend/tests/
├── e2e/
│   ├── expense-workflow.spec.ts      # 12 tests: CRUD operations, validation
│   └── keyboard-navigation.spec.ts   # 14 tests: Tab, Enter, shortcuts, focus
├── visual/
│   └── ui-snapshots.spec.ts          # 13 tests: Screenshot comparisons
└── accessibility/
    └── a11y.spec.ts                  # 14 tests: WCAG 2.1 AA compliance (TODO)
```

**Note on Accessibility Tests**: The accessibility test file exists with test.fixme() markers. These tests will be implemented after the UI is stabilized to avoid frequent baseline updates.

### Running Tests

```bash
# Run all E2E tests (headless, for CI)
npm run test:e2e --workspace=frontend

# Interactive UI mode (time-travel debugging, watch mode)
npm run test:e2e:ui --workspace=frontend

# Headed mode (see browser window)
npm run test:e2e:headed --workspace=frontend

# Debug mode (step through tests with Playwright Inspector)
npm run test:e2e:debug --workspace=frontend

# View HTML test report (screenshots, videos, traces)
npm run test:e2e:report --workspace=frontend

# Update visual regression baselines
npm run test:e2e:update-snapshots --workspace=frontend
```

### Test Examples

#### E2E Workflow Test
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

#### Visual Regression Test
```typescript
test('expense form UI', async ({ page }) => {
    await page.goto('/')
    const form = page.locator('.form-container')
    
    // Compare to baseline screenshot
    await expect(form).toHaveScreenshot('expense-form.png')
})
```

#### Keyboard Navigation Test
```typescript
test('can submit with Enter key', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Expense name').fill('Test')
    await page.getByPlaceholder('Amount').fill('10.00')
    await page.keyboard.press('Enter')
    
    await expect(page.locator('.expense-name')).toContainText('Test')
})
```

#### Accessibility Test
```typescript
test('no accessibility violations', async ({ page }) => {
    await page.goto('/')
    
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
})
```

### When Tests Fail

Playwright provides rich debugging information:

1. **Screenshots**: Automatically captured on failure
2. **Videos**: Optional recording of test execution
3. **Traces**: Step-by-step replay with DOM snapshots, console logs, network activity
4. **HTML Report**: Interactive report with all test results

View the report:
```bash
npm run test:e2e:report --workspace=frontend
```

### Visual Regression Workflow

**First run**: Creates baseline screenshots in `tests/<test-name>-snapshots/`

**Subsequent runs**: Compares current UI to baselines
- Pass: UI matches baseline (within threshold)
- Fail: UI differs - test shows visual diff

**When UI intentionally changes**:
```bash
# Review the diff in test report
npm run test:e2e:report --workspace=frontend

# If change is expected, update baselines
npm run test:e2e:update-snapshots --workspace=frontend
```

### Configuration

Located in `packages/frontend/playwright.config.ts`:

- **Browsers**: Chromium (desktop + mobile)
- **Auto-start dev server**: Vite starts automatically before tests
- **Screenshots**: Only on failure
- **Videos**: Retained on failure
- **Traces**: On first retry
- **CI optimized**: Retries, single worker, GitHub Actions reporter

### Writing New Tests

1. Create test file in appropriate directory:
   - `tests/e2e/` - User workflows and interactions
   - `tests/visual/` - UI screenshot comparisons
   - `tests/accessibility/` - WCAG compliance

2. Use descriptive test names:
```typescript
test('complete expense workflow - add, view, remove', async ({ page }) => {
    // Test implementation
})
```

3. Follow project patterns:
   - Use `page.getByRole()`, `page.getByPlaceholder()` for accessibility
   - Test keyboard shortcuts (Enter, Tab, Cmd+Enter)
   - Verify both success and error states
   - Check empty states and edge cases

4. Add visual checks for critical UI:
```typescript
await expect(page).toHaveScreenshot('critical-feature.png')
```

### Best Practices

- **Test user behavior, not implementation**: Use accessible selectors (`getByRole`, `getByPlaceholder`)
- **Wait for content**: Use `expect()` with auto-waiting instead of manual waits
- **Independent tests**: Each test should work in isolation
- **Visual tests for UI**: Use screenshots to catch layout/CSS changes
- **Keyboard tests for accessibility**: Verify Tab, Enter, Escape work as expected
- **Mobile testing**: Test responsive breakpoints with different viewports

### CI/CD Integration

Playwright runs in CI with:
- Headless browser execution
- Retries on failure (reduces flakiness)
- Parallel execution disabled for stability
- Artifacts uploaded (screenshots, videos, traces)

Example GitHub Actions:
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

### Troubleshooting

**Tests fail locally but pass in CI (or vice versa)**:
- Visual tests may be platform-dependent (fonts, rendering)
- Solution: Run tests in Docker with same OS as CI, or increase threshold

**Tests are flaky**:
- Use `await expect()` instead of manual waits
- Ensure test data cleanup between tests
- Check for race conditions in application code

**Visual tests fail unexpectedly**:
- Check if CSS, fonts, or layout changed
- Review diff in test report
- Update baselines if change is intentional

**Debugging tips**:
- Use `test:e2e:debug` to step through tests
- Add `await page.pause()` to pause execution
- Check browser console in headed mode
- Use `page.screenshot()` to capture specific moments

For more information, see [Playwright documentation](https://playwright.dev/docs/intro).

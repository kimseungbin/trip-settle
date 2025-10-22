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

**All new features must follow the Test-Driven Development (TDD) workflow defined in the `tdd-workflow` skill.**

### Quick Reference

The TDD workflow follows these phases:

1. **Plan** → Break down feature, create task list
2. **Red** → Write failing tests first
3. **Green** → Implement minimum code to pass tests
4. **Verify** → Run full test suite and quality checks
5. **Refactor** → Clean up code (optional)
6. **Commit** → Create descriptive commit

### Key Commands

```bash
# Backend tests
npm run test --workspace=backend

# Frontend tests (unit + E2E)
npm run test --workspace=frontend
npm run test:e2e:docker

# Quality checks
npm run format && npm run lint && npm run build
```

### Exceptions

Workflow can be relaxed for:
- Documentation-only changes (*.md files)
- Configuration tweaks
- Emergency hotfixes (tests required immediately after)

### Detailed Guidance

For comprehensive workflow details, examples, and best practices, see:
- **Skill**: `.claude/skills/tdd-workflow/workflow.yaml`
- **Commit conventions**: `.claude/skills/git-commit-rules/commit-rules.yaml`

**Claude Code must follow the TDD workflow skill for all feature implementations.**

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

# Run E2E tests (Playwright) - Recommended: Docker-based (zero setup, consistent)
npm run test:e2e:docker --workspace=frontend          # Full test suite in Docker
npm run test:e2e:docker:clean --workspace=frontend    # Clean up Docker resources

# Alternative: Local E2E tests (requires: npx playwright install --with-deps)
# Use for faster iteration and IDE integration during active development
npm run test:e2e --workspace=frontend                 # Headless mode
npm run test:e2e:ui --workspace=frontend              # Interactive UI mode (debugging)
npm run test:e2e:headed --workspace=frontend          # Show browser window
npm run test:e2e:debug --workspace=frontend           # Playwright Inspector
npm run test:e2e:report --workspace=frontend          # View test report
npm run test:e2e:update-snapshots --workspace=frontend # Update visual baselines

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

## Git Hooks

The project uses custom git hooks stored in the `.githooks/` directory to ensure code quality before commits. These hooks are version-controlled and shared across the team.

### Available Hooks

- **pre-commit**: Runs before each commit to validate:
  - Code formatting (Prettier)
  - Linting (ESLint)
  - Build compilation (all packages)
  - Cleans build artifacts after validation

**Note**: E2E tests are NOT run in pre-commit hooks due to slow execution time (several minutes with Docker). Run E2E tests manually before pushing:

```bash
npm run test:e2e:docker
```

### Setting Up Git Hooks

Git hooks must be enabled manually after cloning the repository. Run these commands once:

```bash
# Configure git to use the .githooks directory
git config core.hooksPath .githooks

# Make all hooks executable (required on Unix-based systems)
chmod +x .githooks/*
```

### Verification

To verify the hooks are configured correctly, check your git config:

```bash
git config core.hooksPath
# Should output: .githooks
```

Try making a test commit - you should see the pre-commit hook output.

### Why Custom Hooks Directory?

By default, git hooks live in `.git/hooks/` which is **not tracked by version control**. Using a custom directory (`.githooks/`) allows us to:

1. **Version control hooks**: All team members get the same hooks
2. **Easy updates**: Hook changes propagate via git pull
3. **No external dependencies**: Works without tools like husky
4. **Explicit opt-in**: Developers consciously enable hooks after understanding what they do

### Disabling Hooks Temporarily

If you need to bypass hooks for a specific commit (e.g., work-in-progress):

```bash
git commit --no-verify -m "WIP: Your message"
```

**Note**: Use `--no-verify` sparingly. It's better to fix issues caught by hooks than to bypass them.

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
npm run test:e2e:docker                  # Recommended: Docker-based
npm run test:e2e --workspace=frontend   # Alternative: Local (requires setup)
npm run test:e2e --workspace=backend    # Backend API E2E tests
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

### Running E2E Tests

#### Docker-Based Testing (Recommended)

**Use Docker for default testing** - it provides zero-setup, consistent environments across all machines and matches CI/CD exactly.

**Prerequisites**: Docker and Docker Compose installed (included with Docker Desktop)

**Commands**:
```bash
# Run full E2E test suite in Docker
npm run test:e2e:docker

# Clean up Docker containers and volumes
npm run test:e2e:docker:clean
```

**How It Works**: Three Docker services orchestrated by `docker-compose.e2e.yml`:
1. **Backend Service**: NestJS API with pg-mem database
2. **Frontend Service**: Vite dev server
3. **Playwright Service**: Official Playwright image with pre-installed browsers

**Why Docker?**
- ✅ **Zero setup**: No `npx playwright install` needed
- ✅ **Consistency**: Same browser versions on all machines (Mac, Linux, Windows)
- ✅ **CI/CD parity**: Identical environment to GitHub Actions
- ✅ **Isolation**: Tests don't affect local environment
- ✅ **Orchestration**: Automatically starts backend + frontend

**Docker Files**:
- `packages/frontend/Dockerfile.e2e`: Playwright runner image (`mcr.microsoft.com/playwright:v1.56.1-noble`)
- `docker-compose.e2e.yml`: Service orchestration
- `.dockerignore`: Build optimization

**Troubleshooting**:
| Issue | Solution |
|-------|----------|
| "Cannot connect to localhost:5173" | Docker uses service names (`frontend:5173`) - handled automatically |
| Slow first build | Downloads ~1.5GB Playwright image, then cached |
| Permission errors on Linux | Run `sudo chown -R $USER packages/frontend/playwright-report` |

#### Local Testing (Advanced)

**Use local testing when you need:**
- ⚡ **Faster iteration**: ~30s vs ~2-3min (no container startup)
- 🛠️ **IDE integration**: Playwright UI mode, inspector, step-through debugging
- 🔍 **Interactive development**: Rapid test writing with watch mode

**Setup Required** (one-time):
```bash
npx playwright install --with-deps chromium webkit
```

**Commands**:
```bash
# Run all tests (headless)
npm run test:e2e --workspace=frontend

# Interactive UI mode (time-travel debugging, watch mode)
npm run test:e2e:ui --workspace=frontend

# Headed mode (see browser window)
npm run test:e2e:headed --workspace=frontend

# Debug mode (Playwright Inspector, step-through)
npm run test:e2e:debug --workspace=frontend

# View HTML test report (screenshots, videos, traces)
npm run test:e2e:report --workspace=frontend

# Update visual regression baselines
npm run test:e2e:update-snapshots --workspace=frontend
```

**Comparison**:
| Aspect | Docker (Recommended) | Local (Advanced) |
|--------|---------------------|------------------|
| **Setup** | Zero (just Docker) | `npx playwright install --with-deps` |
| **Consistency** | ✅ Same on all machines | ⚠️ OS-dependent rendering |
| **Speed** | ~2-3min (includes startup) | ~30sec (no container overhead) |
| **IDE Integration** | ❌ Limited | ✅ Full (UI mode, inspector, WebStorm) |
| **CI/CD Parity** | ✅ Identical environment | ⚠️ May differ (fonts, rendering) |
| **Best For** | Default, pre-push checks | Active development, debugging |

**When to use local**: Actively writing/debugging tests and need immediate feedback. Switch back to Docker before committing.

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

**Recommended**: Use Docker-based tests in CI for consistency with local development:

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

**Alternative**: Local Playwright installation (if Docker not available in CI):

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

**Key Points**:
- Docker approach matches local development environment exactly
- Headless browser execution
- Retries on failure (reduces flakiness)
- Artifacts uploaded (screenshots, videos, traces)

### Troubleshooting

**Tests fail locally but pass in CI (or vice versa)**:
- Most common cause: Platform-dependent rendering (fonts, antialiasing)
- **Solution**: Use Docker for both local and CI to ensure identical environments
- If using local testing: Increase visual diff threshold in `playwright.config.ts`

**Tests are flaky**:
- Use `await expect()` with auto-waiting instead of manual `setTimeout` or `waitFor`
- Ensure proper test isolation (independent test data, cleanup between tests)
- Check for race conditions in application code (e.g., async state updates)

**Visual tests fail unexpectedly**:
- Review diff in test report: `npm run test:e2e:report --workspace=frontend`
- Check if CSS, fonts, or layout intentionally changed
- Update baselines if change is expected: `npm run test:e2e:update-snapshots --workspace=frontend`

**Debugging tips**:
- **Interactive debugging**: `npm run test:e2e:ui --workspace=frontend` (local only)
- **Step-through**: `npm run test:e2e:debug --workspace=frontend` (local only)
- **Pause execution**: Add `await page.pause()` in test code
- **Manual screenshots**: Use `await page.screenshot({ path: 'debug.png' })` at any point
- **Browser console**: Run in headed mode to see console output

For more information, see [Playwright documentation](https://playwright.dev/docs/intro).

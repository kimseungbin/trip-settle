# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# TIER 1: CRITICAL PROCESS (Always Check First)

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

### Key Commands (Claude Code Usage)

```bash
# Backend tests (UNIT TESTS ONLY - fast < 5s)
npm run test --workspace=backend

# Frontend tests (UNIT TESTS ONLY - fast < 5s)
npm run test:unit --workspace=frontend

# Quality checks
npm run format && npm run lint && npm run build
```

**Note for Claude Code**: DO NOT run E2E tests (`test:e2e`, `test:e2e:docker`, `playwright test`). Only human developers run E2E tests as pre-push validation.

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

## Testing Strategy & Test Pyramid

**CRITICAL FOR CLAUDE CODE**: This project uses a strict test pyramid to maintain fast TDD cycles.

### The Golden Rule

**During TDD cycles (Red-Green-Refactor): ONLY run unit tests (< 5 seconds).**

E2E and integration tests take 2-5 minutes and are run BEFORE `git push`, not during active development.

### Execution Contexts Summary

| Context | Tests | Speed | When |
|---------|-------|-------|------|
| **TDD Cycles** | Unit only | < 5s | Active coding |
| **Pre-Push** | Integration + E2E | 2-5m | Before git push |
| **CI/CD** | All (including visual) | 5-10m | Automated |

## E2E Test Execution

**E2E test commands require user approval** (enforced in `.claude/settings.json`).

During TDD cycles, only run unit tests (< 5 seconds). E2E tests take 2-5 minutes and are run before `git push`.

See `.claude/skills/tdd-workflow/workflow.yaml` for complete testing strategy.

## Design Requirements

All features must meet accessibility and UX standards. See README.md "Design Requirements" section for complete details.

**Required for all features:**
- Keyboard accessible (Enter/Escape/Arrow keys)
- ARIA compliant, semantic HTML
- Mobile-first responsive design
- Sub-second interactions with visual feedback

# TIER 2: FREQUENTLY REFERENCED (Active Development)

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

# Run unit tests (Vitest) - Claude Code: USE THIS DURING TDD
npm run test:unit --workspace=frontend
npm run test:unit:ui --workspace=frontend

# ⚠️ E2E TESTS - FOR HUMAN DEVELOPERS ONLY (Claude Code: DO NOT RUN)
# These commands are listed for reference but MUST NOT be executed by Claude Code
# Only human developers run E2E tests as pre-push validation

# Run E2E tests (Playwright) - Recommended: Docker-based (zero setup, consistent)
# npm run test:e2e:docker --workspace=frontend          # Full test suite in Docker
# npm run test:e2e:docker:clean --workspace=frontend    # Clean up Docker resources

# Alternative: Local E2E tests (requires: npx playwright install --with-deps)
# npm run test:e2e --workspace=frontend                 # Headless mode
# npm run test:e2e:ui --workspace=frontend              # Interactive UI mode (debugging)
# npm run test:e2e:headed --workspace=frontend          # Show browser window
# npm run test:e2e:debug --workspace=frontend           # Playwright Inspector
# npm run test:e2e:report --workspace=frontend          # View test report
# npm run test:e2e:update-snapshots --workspace=frontend # Update visual baselines

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

# Run tests (Vitest)
npm run test --workspace=backend         # Run all unit and integration tests
npm run test:watch --workspace=backend   # Watch mode
npm run test:ui --workspace=backend      # Interactive UI mode
npm run test:cov --workspace=backend     # With coverage report

# Note: E2E tests are currently not functional (see Testing & CI/CD Readiness section)
```

**Backend Run Modes:**

- **Development**: `npm run dev --workspace=backend` (watch mode with hot reload)
- **Production**: `npm run build --workspace=backend && npm run start --workspace=backend`

When modifying E2E test Docker configurations (`docker-compose.e2e.yml`, `Dockerfile`):
- Local Docker E2E: Use development mode
- CI E2E: Use production mode

See README.md "Backend Run Modes" section for detailed explanation.

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

### Style Linting (Stylelint)
- **Purpose**: Detect hardcoded colors in CSS and Svelte `<style>` blocks
- **Config**: `packages/frontend/.stylelintrc.json`
- **Rules**: Enforces CSS custom properties (`var(--color-*)`) instead of hardcoded colors
- **Commands**:
  ```bash
  npm run stylelint --workspace=frontend        # Check for violations
  npm run stylelint:fix --workspace=frontend    # Auto-fix where possible
  ```
- **Exceptions**:
  - `theme.css`: Allows all color definitions (source of truth)
  - `DevTools.svelte`: Dev-only component with intentional hardcoded colors
  - `Toast.svelte`: Allows hex fallbacks in `var(--color-*, #fallback)` format
  - `KeyboardHint.svelte`: Allows rgba() for shadow opacity
- **Pre-commit hook**: Automatically checks for hardcoded colors before commit

### Testing
- Frontend: Vitest with happy-dom (unit tests), Playwright (E2E tests)
- Backend: Vitest (unit and integration tests)
- Infra: Vitest (unit tests)
- E2E tests: Playwright for frontend

### Configuration Commonization

**Principle**: Maximize configuration reuse through base/shared configs to reduce duplication and ensure consistency.

**Current hierarchy patterns:**
- **TypeScript**: `tsconfig.base.json` → packages extend with `extends` field
- **ESLint**: Root `eslint.config.js` → packages import and modify array
- **Vitest**: `vitest.config.base.ts` → packages merge with `mergeConfig()` utility
- **Prettier**: Root `.prettierrc.yaml` → single config, no inheritance needed

When adding or modifying configuration files, see `.claude/skills/config-commonization/SKILL.md` for:
- Detailed hierarchy examples and implementation patterns
- Guidelines for creating base configs vs package-specific configs
- Decision criteria and examples

## Git Hooks

Pre-commit hooks validate code quality before commits:
- Code formatting (Prettier)
- Linting (ESLint)
- Build compilation (all packages)
- **Visual snapshot validation** (enforced when UI files changed)

**Location**: `.githooks/` directory (version-controlled)

**Setup** (one-time, after cloning):
```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

**Note**: E2E tests NOT run in hooks (too slow). Run manually before push: `npm run test:e2e:docker`

### Snapshot Handling Enforcement

When committing changes to `.svelte` or `.css` files, add commit message footer:
- **`Snapshots: update`** - UI appearance changed (styling, layout, visual elements)
- **`Snapshots: skip`** - UI files changed but appearance unchanged (refactoring, logic only)

For examples, decision guide, and troubleshooting, see `.claude/skills/git-hooks-setup/SKILL.md`

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

# TIER 3: PROJECT CONTEXT (Understanding Codebase)

## Project Overview

Trip Settle is a full-stack TypeScript monorepo for managing trip expense settlements. The project uses npm workspaces to manage three main packages:

- **frontend**: Svelte application with Vite
- **backend**: NestJS REST API
- **infra**: AWS CDK infrastructure as code

## Monorepo Structure

```
trip-settle/
├── packages/
│   ├── frontend/     # Svelte + Vite + TypeScript
│   ├── backend/      # NestJS + TypeORM + PostgreSQL
│   └── infra/        # AWS CDK
├── .github/actions/  # TypeScript GitHub Actions (workspace members)
│   ├── check-snapshot-trigger/
│   ├── extract-e2e-failures/
│   └── generate-failure-report/
└── package.json      # Root workspace configuration
```

## Architecture

### Frontend (Svelte)

- **Framework**: Svelte 5 with TypeScript
- **Build Tool**: Vite 7
- **Testing**: Vitest 3
- **API Communication**: Proxied to backend via Vite (`/api` → `http://localhost:3000`)
- **Entry Point**: `src/main.ts` mounts `App.svelte` to `#app`
- **State Management**: Uses Svelte 5 runes (`$state`, `$derived`, `$props`, `$bindable`, `$effect`)
- **Component Props**: Uses `$props()` instead of `export let`
- **Event Handlers**: Uses event attributes (`onclick`, `onkeydown`) instead of `on:` directives

### Backend (NestJS)

- **Framework**: NestJS with Express
- **Database**: PostgreSQL with TypeORM
- **ORM**: TypeORM (configured in `app.module.ts`)
- **Testing**: Vitest (unit and integration tests)
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

# TIER 4: SPECIALIZED WORKFLOWS (As-Needed)

## Playwright E2E Testing

The frontend uses Playwright for end-to-end, visual regression, keyboard navigation, and accessibility testing.

### Quick Start

```bash
# Docker-based (recommended - zero setup, consistent)
npm run test:e2e:docker

# Local (advanced - faster iteration, IDE integration)
npm run test:e2e:ui --workspace=frontend
```

### Test Structure

- `tests/e2e/` - User workflows and interactions
- `tests/visual/` - Screenshot comparisons
- `tests/accessibility/` - WCAG compliance (currently test.fixme())

### Failure Analysis

When E2E tests fail, use the `e2e-failure-analysis` skill for quick diagnosis:
- **Skill**: `.claude/skills/e2e-failure-analysis/analysis.yaml`
- **Purpose**: Categorize failures, identify root causes, provide fix recommendations
- **Dependencies**: Uses `git-notes-helper` skill for historical analysis (Phase 2-3 features)
- **Features**:
  - Basic: Parse test results, categorize errors, show artifacts
  - Advanced (Phase 3): Flaky test detection, trend analysis, blame integration, regression detection
- **Usage**: E2E failure metadata is automatically captured in git notes (`refs/notes/ci/e2e-failures`) by CI

### Key Commands

```bash
# Docker testing
npm run test:e2e:docker                              # Run all tests
npm run test:e2e:docker:update-snapshots             # Update visual snapshots (Docker-only)
npm run test:e2e:docker:clean                        # Clean up resources

# Local testing (requires: npx playwright install --with-deps)
npm run test:e2e --workspace=frontend                # Headless
npm run test:e2e:ui --workspace=frontend             # Interactive UI mode
npm run test:e2e:debug --workspace=frontend          # Playwright Inspector
npm run test:e2e:report --workspace=frontend         # View test report
```

### When to Use What

- **Docker**: Default testing, pre-push checks, CI/CD (consistent across all machines)
- **Local**: Active test development, debugging (faster iteration, IDE integration)

### Selective Test Execution (Speed Optimization)

**Problem**: Running all E2E tests (7 files × 4 browsers) takes 2-5 minutes.
**Solution**: Run only tests affected by your changes (1-2 files × 1 browser) in ~30 seconds.

#### Local vs CI Configuration

| Environment | Browsers | Test Selection | Speed | When |
|------------|----------|----------------|-------|------|
| **Local Dev** | webkit only (Safari) | Selective | 10-30s | During development |
| **CI/Docker** | 4 browsers (full matrix) | All tests | 2-5min | Automated on push/PR |

*Browser configuration automatically detected in `playwright.config.ts` based on environment.*

#### Component-to-Test Mapping

**Expense Features:**
```bash
# Changed: ExpenseTracker, ExpenseForm, ExpenseList, CurrencySelector
npx playwright test expense-workflow keyboard-navigation
```

**Onboarding & Routing:**
```bash
# Changed: Onboarding.svelte, lib/router.svelte.ts
npx playwright test onboarding routing
```

**DevTools:**
```bash
# Changed: DevTools, SystemStatus, LocalStorageViewer
npx playwright test local-storage-viewer
```

**Keyboard Hints:**
```bash
# Changed: KeyboardHint.svelte, lib/keyboardHint.ts
npx playwright test keyboard-navigation
```

**Shared/Core Changes:**
```bash
# Changed: App.svelte, main.ts, config/*
# Run smoke tests or full suite
npx playwright test expense-workflow onboarding  # Smoke tests (fastest)
npm run test:e2e:docker                          # Full suite (comprehensive)
```

#### Pattern Matching Examples

**By file name:**
```bash
npx playwright test expense          # Matches expense-workflow.spec.ts
npx playwright test onboarding routing  # Matches multiple files
npx playwright test local-storage    # Matches local-storage-viewer.spec.ts
```

**By test description:**
```bash
npx playwright test --grep "Expense"       # All tests with "Expense" in describe()
npx playwright test --grep "LocalStorage"  # LocalStorageViewer tests
npx playwright test --grep "keyboard"      # All keyboard-related tests
```

#### Best Practices

1. **During Development**: Run selective tests for fast feedback (30 seconds)
2. **Before Push**: Run full suite or selective tests depending on change scope
3. **Let CI Handle**: Full cross-browser validation happens automatically in CI
4. **When Unsure**: Run smoke tests (`expense-workflow + onboarding`) or full suite

**See Also**: `.claude/skills/tdd-workflow/workflow.yaml` → `selective_e2e_execution` section for detailed mapping and examples.

### Detailed Guide

For comprehensive Playwright documentation including test examples, debugging, troubleshooting, CI/CD integration, and best practices, see:
- **Skill**: `.claude/skills/playwright-testing/guide.yaml`
- **Configuration**: `packages/frontend/playwright.config.ts`
- **Docker setup**: `docker-compose.e2e.yml`, `packages/frontend/Dockerfile.e2e`

### Troubleshooting

#### Permission Denied on test-results/playwright-report (macOS)

**Symptom**: When running local E2E tests after Docker tests, you may see:
```
Error: EACCES: permission denied, rmdir '/path/to/test-results'
```

**Root Cause**: Docker containers running as root create test output directories with special macOS extended attributes (quarantine/provenance flags). Even though you own the files, macOS kernel protection prevents deletion without elevated privileges.

**Solution**:
```bash
# Remove protected directories
sudo rm -rf packages/frontend/test-results packages/frontend/playwright-report

# Then run tests normally
npm run test:e2e --workspace=frontend
```

**Prevention**: These directories are already in `.gitignore` and won't be committed. The issue only occurs when switching between Docker tests (run as root) and local tests (run as your user).

**Why Docker Uses Root**: The CI environment (`DOCKER_USER: root`) runs as root to avoid permission issues with Docker volume mounts in GitHub Actions. This is necessary for automated testing but creates the permission issue locally when you switch testing modes.

#### Visual Snapshot Management

Visual snapshots are ONLY updated in CI (GitHub Actions), never locally. Enforced via `TEST_ENV` variable.

**To update snapshots**: Add `Snapshots: update` footer to commit message and push. CI automatically updates and commits snapshots.

**Detailed guide**: See `.claude/skills/playwright-testing/guide.yaml` → `visual_regression_workflow` section for:
- Remote-only philosophy and rationale
- Three update methods (commit footer, PR comment, manual workflow)
- Selective scope optimization (`update:visual`, `update:e2e`)
- When to update snapshots (CSS, layout, visual elements)
- Verification and best practices

## CI/CD Pipeline Optimization

The CI pipeline uses parallel execution (4 jobs) and Docker caching for speed (~7-8 min total).

**Critical Guidelines for Claude Code**:

1. **Preserve parallelization**: Don't add `needs:` dependencies unless truly required
2. **Maintain Dockerfile layer ordering**: Keep layers ordered from stable to volatile (package.json before code)
3. **Update .dockerignore**: Add new generated directories to exclusion list
4. **Test locally first**: Run `npm run test:e2e:docker` before pushing CI changes

**Anti-patterns to avoid**:
- ❌ Adding unnecessary `needs:` dependencies (breaks parallelization)
- ❌ Moving COPY before RUN in Dockerfile (invalidates npm cache)
- ❌ Removing files from .dockerignore without justification
- ❌ Adding more browsers without performance justification
- ❌ Using `--force-recreate` flag (bypasses Docker cache)

**Detailed documentation**: `.claude/skills/ci-pipeline-optimization/SKILL.md`
**Cache analysis**: Use `docker-cache-analysis` skill for performance trends

## AWS CDK Deployment

### First-Time Setup

**IMPORTANT**: AWS CDK requires a one-time bootstrap operation and OIDC configuration for GitHub Actions. This setup is performed manually by humans and only needs to be done once per AWS account/region.

**For detailed first-time setup instructions**, refer to:
- **Human-readable guide**: See README.md section "Setting Up GitHub Actions for Continuous Deployment"
- **Interactive AI guidance**: Use the `cdk-setup` skill (`.claude/skills/cdk-setup/setup-guide.yaml`)

The setup process includes:
1. **CDK Bootstrap** - Creates S3 bucket, ECR repository, IAM roles for deployments
2. **OIDC Provider** - Enables GitHub Actions to authenticate with AWS without stored credentials
3. **IAM Role Configuration** - Creates role with trust policy for this GitHub repository
4. **GitHub Variables** - Stores AWS_ROLE_ARN and AWS_REGION as repository variables

### Deployment Strategy

**Continuous Deployment (Recommended):**
All infrastructure changes deploy automatically via GitHub Actions when pushed to `main`. The workflow file is at `.github/workflows/deploy.yml`.

**Manual Deployment (Optional):**
For testing infrastructure changes locally (requires AWS credentials configured):
```bash
npm run diff --workspace=infra   # Preview changes
npm run deploy --workspace=infra # Deploy to AWS
```

## GitHub Actions as Workspace Members

Custom GitHub Actions are written in TypeScript and integrated as npm workspace members for better monorepo cohesion.

**Structure** (`.github/actions/<action-name>/`):
```
action-name/
├── src/
│   └── main.ts              # TypeScript source
├── dist/
│   └── index.js             # Bundled ESM output (committed with esbuild)
├── action.yml               # Action metadata
├── package.json             # Dependencies & scripts (with "type": "module")
├── tsconfig.json            # TypeScript config
└── README.md                # Documentation
```

**Actions**:
- **check-snapshot-trigger** - Determines if visual snapshot update workflow should run
- **extract-e2e-failures** - Parses Playwright JSON results and categorizes failures
- **generate-failure-report** - Aggregates build errors into markdown reports

**Benefits**:
- ✅ Type safety with full TypeScript interfaces
- ✅ Shared dependencies hoisted to root (saves ~400MB)
- ✅ Unified build/lint/format commands
- ✅ Better error handling with @actions/core
- ✅ Action outputs available to downstream workflow steps
- ✅ Testability with Vitest infrastructure

**Build command**:
```bash
npm run build --workspace=.github/actions/<action-name>
# Or build all actions:
npm run build:actions
```

**Important**: The `dist/` directory must be committed (GitHub Actions requirement). Always rebuild and commit after changing `src/main.ts`.

# TIER 5: TECHNICAL REFERENCE (Lookup)

## TypeScript and Vitest Configuration

The project uses hierarchical configuration systems with shared base configs:

### TypeScript Hierarchy

- **Root base** (`tsconfig.base.json`): Defines common compiler options (module: ESNext, bundler resolution)
- **Backend**: Inherits ESNext modules (relaxed strict mode for NestJS decorators, requires `.js` extensions for ESM)
- **Frontend**: Inherits ESNext modules (Svelte-specific settings)
- **Infra**: Inherits ESNext modules (CDK-specific settings)
- **GitHub Actions**: Inherits ESNext modules (bundled with esbuild for 20-50x faster builds)

All packages use ESM throughout the monorepo. All packages extend `tsconfig.base.json` and override only package-specific settings.

### Vitest Hierarchy

- **Root base** (`vitest.config.base.ts`): Defines common test settings (`globals: true`, common exclusions)
- **Backend**: Merges base with `environment: 'node'`, `include: ['src/**/*.spec.ts']`, coverage config
- **Frontend**: Merges base with `environment: 'happy-dom'`, svelte plugin, Playwright exclusions
- **Infra**: Merges base with `environment: 'node'`, `include: ['**/*.test.ts']`, CDK exclusions

Packages use `mergeConfig()` from vitest/config to combine base with package-specific settings. See "Configuration Commonization" section for detailed hierarchy and best practices.

## CSS & Mobile Responsive Design Best Practices

### Mobile Flexbox Alignment

**Problem**: Multiple sibling flex containers (e.g., list, input row, button row) appearing misaligned on mobile despite being in the same parent.

**Root Causes**:
- Global mobile styles like `button { width: 100% }` affect some buttons but not others
- Flex containers naturally stretch to fit content without explicit width constraints
- Missing `box-sizing: border-box` causes borders to add extra width

**Solution Pattern**:
```css
@media (max-width: 640px) {
  /* Force all sibling sections to same width */
  .section-1,
  .section-2,
  .section-3 {
    width: 100%;
    box-sizing: border-box;
  }

  /* Allow flex children to shrink */
  .flex-child-input {
    min-width: 0; /* Critical for flexbox */
  }

  /* Keep specific buttons compact */
  .specific-button {
    width: auto;
    flex-shrink: 0;
  }
}
```

**Key Principles**:
1. **Explicit width for siblings**: Set `width: 100%` on all sibling containers in mobile responsive rules
2. **Box sizing**: Always use `box-sizing: border-box` to include borders/padding in width
3. **Min-width for flex**: Add `min-width: 0` to flex items that should shrink (default `auto` prevents shrinking)
4. **Specificity matters**: More specific selectors override general rules - need explicit mobile overrides

**When to apply**: Multiple sibling flex containers that should visually align, mobile layouts with full-width buttons, forms with input rows alongside button rows.

## Git Notes for CI Metadata

Git notes store CI/CD metadata alongside commits without modifying commit history.

**Namespaces**:
- `refs/notes/ci/cache-metrics` - Docker build cache efficiency metrics
- `refs/notes/ci/e2e-failures` - Playwright E2E test failure metadata
- `refs/notes/ci/snapshot-updates` - Visual snapshot update workflow execution metadata
- `refs/notes/ci/workflow-metrics` - GitHub Actions job/step timing metrics

See README.md "Why Git Notes for CI Metadata?" for rationale and benefits.

### How Metadata is Captured

CI workflows use a **post-job architecture** to accurately capture workflow execution status.

For implementation details, see `.claude/skills/git-notes-helper/` → "Writing Git Notes in CI" section.

### Helper Skill

**Skill**: `.claude/skills/git-notes-helper/helper.yaml`
- **Purpose**: Provides reusable git notes operations (fetch, parse, compare, historical analysis, writing in CI)
- **Used by**: `docker-cache-analysis`, `e2e-failure-analysis`, `snapshot-update-analysis`, `workflow-metrics-analysis` skills
- **Operations**: Fetch notes, show note content, parse INI fields, compare commits, historical walking, CI post-job pattern

### Usage

```bash
# Fetch notes from remote (not fetched by default)
git fetch origin refs/notes/ci/<namespace>:refs/notes/ci/<namespace>

# Show note for commit
git notes --ref=ci/<namespace> show <commit-hash>

# List all commits with notes
git notes --ref=ci/<namespace> list
```

**See also**:
- Docker cache analysis: `.claude/skills/docker-cache-analysis/`
- E2E failure analysis: `.claude/skills/e2e-failure-analysis/`
- Snapshot update analysis: `.claude/skills/snapshot-update-analysis/`
- Git notes helper: `.claude/skills/git-notes-helper/`

## Testing & CI/CD Readiness

This section tracks the implementation status of tests needed for continuous integration. Tests ensure code quality, prevent regressions, and validate functionality before deployment.

### Backend Tests (NestJS + Vitest)

**Testing Framework**: The backend uses Vitest for unit and integration tests.

#### Unit Tests
- [x] AppService tests (`app.service.spec.ts`)
  - getHello() method tests
  - Basic service functionality

#### Integration Tests
- [x] AppService integration tests (`app.service.integration.spec.ts`)
  - getHealth() with database connection
  - Database error handling
- [ ] TypeORM entity CRUD operations
- [x] Database connection with pg-mem
- [ ] Environment-specific configuration loading

#### E2E Tests
**Note**: E2E tests are currently not functional with Vitest due to decorator metadata limitations. The migration from Jest to Vitest is complete for unit and integration tests.

**Technical Details**: NestJS requires `emitDecoratorMetadata: true` for dependency injection, but Vitest's default esbuild transformer doesn't support this. The recommended solution is using `@swc/core` with `unplugin-swc` (per [NestJS docs](https://docs.nestjs.com/recipes/swc)), but this encounters native binding issues on macOS (`Cannot find module './swc.darwin-arm64.node'`). This is a known limitation of SWC's optional peer dependencies on macOS.

**Alternative Approaches Explored**:
- SWC with unplugin-swc: Failed due to native binding issues
- ts-node with fork pool: Not attempted due to SWC being the official recommendation

**Current State**: Existing E2E test file (`test/app.e2e-spec.ts`) has been migrated to Vitest syntax but is not executable:
- [ ] Health check endpoint (`GET /api/health`)
- [ ] Hello endpoint (`GET /api`)
- [ ] CORS configuration validation
- [ ] Global validation pipe behavior

#### Backend Infrastructure Tests
- [x] Module initialization tests
- [x] Dependency injection validation

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

### Infrastructure Tests (AWS CDK + Vitest)

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trip Settle is a full-stack TypeScript monorepo for managing trip expense settlements. The project uses npm workspaces to manage three main packages:

- **frontend**: Svelte application with Vite
- **backend**: NestJS REST API
- **infra**: AWS CDK infrastructure as code

## Design Principles

Follow these requirements when implementing features:
- **Keyboard accessibility**: All features must work without mouse (Enter/Escape/Arrow keys)
- **Accessibility**: ARIA guidelines, screen reader support
- **Responsive design**: Mobile-first, desktop enhancements
- **Performance**: Fast, smooth interactions with minimal latency
- **User feedback**: Clear visual feedback for all actions

See README.md "Design Philosophy" for detailed rationale.

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

# Run tests
npm run test --workspace=backend
npm run test:watch --workspace=backend
npm run test:cov --workspace=backend
npm run test:e2e --workspace=backend
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
- Frontend: Vitest with happy-dom (unit tests), Playwright (E2E tests)
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

When committing changes to `.svelte` or `.css` files, the pre-commit hook **requires** explicit snapshot handling:

**Required footer (add to commit message):**

1. **`Snapshots: update`** - UI appearance changed
   - Use when: Styling, layout, colors, new visual elements
   - CI will automatically update snapshots after push
   - Example:
     ```
     feat: Redesign button

     Changes the button color to blue and adds hover effect.

     Snapshots: update
     ```

2. **`Snapshots: skip`** - UI files changed but appearance unchanged
   - Use when: Internal refactoring, prop renaming, type changes
   - You confirm no visual changes occurred
   - Example:
     ```
     refactor: Extract component logic

     Moves validation logic to separate function.

     Snapshots: skip
     ```

**Why this matters**: Visual regression tests fail when UI changes aren't reflected in snapshots. Explicit declaration prevents forgotten updates and CI failures.

**Bypass hook** (use sparingly):
```bash
git commit --no-verify -m "WIP: Your message"
```

For setup, verification, and troubleshooting, see `.claude/skills/git-hooks-setup/SKILL.md`

## Git Notes for CI Metadata

Git notes are used to store CI/CD metadata (cache metrics, test failures) alongside commits without modifying commit history.

**Namespaces**:
- `refs/notes/ci/cache-metrics` - Docker build cache efficiency metrics
- `refs/notes/ci/e2e-failures` - Playwright E2E test failure metadata
- `refs/notes/ci/snapshot-updates` - Visual snapshot update workflow execution metadata

**Helper Skill**: `.claude/skills/git-notes-helper/helper.yaml`
- **Purpose**: Provides reusable git notes operations (fetch, parse, compare, historical analysis)
- **Used by**: `docker-cache-analysis`, `e2e-failure-analysis`, `snapshot-update-analysis` skills
- **Operations**: Fetch notes, show note content, parse INI fields, compare commits, historical walking

**Usage**:
```bash
# Fetch notes from remote (not fetched by default)
git fetch origin refs/notes/ci/<namespace>:refs/notes/ci/<namespace>

# Show note for commit
git notes --ref=ci/<namespace> show <commit-hash>

# List all commits with notes
git notes --ref=ci/<namespace> list
```

**Why git notes?**
- No external database needed (metadata stored in git)
- Version-controlled and auditable
- Team-wide visibility (pushed to remote)
- Perfect for CI metadata that doesn't belong in commits

**See also**:
- Docker cache analysis: `.claude/skills/docker-cache-analysis/`
- E2E failure analysis: `.claude/skills/e2e-failure-analysis/`
- Snapshot update analysis: `.claude/skills/snapshot-update-analysis/`
- Git notes helper: `.claude/skills/git-notes-helper/`

## TypeScript Configuration

- Frontend: ESNext target with bundler module resolution
- Backend: ES2021 target with CommonJS modules
- Infra: ES2020 target with CommonJS modules
- All packages use strict type checking (backend has relaxed settings for NestJS compatibility)

## Testing & CI/CD Readiness

This section tracks the implementation status of tests needed for continuous integration. Tests ensure code quality, prevent regressions, and validate functionality before deployment.

### Backend Tests (NestJS + Jest)

**Note**: Backend currently has no tests. CI uses `--passWithNoTests` flag to prevent failures. This is temporary until tests are implemented.

#### Unit Tests
- [ ] AppController tests (`app.controller.spec.ts`)
- 
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

## CI/CD Pipeline Optimization

The CI/CD pipeline has been extensively optimized for speed and efficiency. This section documents the technical architecture, optimization strategies, and performance benchmarks.

### Pipeline Architecture

**Workflow**: `.github/workflows/ci.yml`

The CI pipeline uses a **parallel execution strategy** with 4 independent jobs:

```
┌─────────────────┐
│   Code Quality  │  ~2 min  (formatting, linting, type-checking)
└─────────────────┘

┌─────────────────┐
│      Build      │  ~2 min  (compile all packages)
└─────────────────┘

┌─────────────────┐
│   Unit Tests    │  ~1 min  (Vitest + Jest)
└─────────────────┘

┌─────────────────┐
│   E2E Tests     │  ~5-7 min  (Docker + Playwright)
└─────────────────┘

Total time: ~7-8 minutes (parallel execution)
```

**Key design decision**: E2E tests depend only on `build` job, not `quality`. This allows quality checks to run in parallel with E2E tests, reducing total wall-clock time.

### Performance Optimizations

#### 1. Parallel Job Execution
- **Before**: Sequential execution (quality → build → e2e) = ~12-15 min
- **After**: Parallel execution (quality || build → e2e) = ~7-8 min
- **Savings**: 40-50% reduction in total CI time
- **Implementation**: Removed unnecessary `needs: [quality]` dependency from `e2e-tests` job

#### 2. Docker Build Caching
The pipeline uses two-tier caching for maximum performance:

##### Layer Caching (GitHub Actions Cache Backend)
```yaml
# .github/workflows/ci.yml
- uses: docker/build-push-action@v6
  with:
    cache-from: type=gha,scope=playwright-e2e
    cache-to: type=gha,mode=max,scope=playwright-e2e
```

**Benefits**:
- **Cross-run persistence**: Cache survives between CI runs
- **Automatic metrics**: GitHub Actions generates build summaries with per-layer timing
- **Mode=max**: Exports all intermediate layers, not just final image

##### Base Image Caching (Playwright Docker Image)
```yaml
# Cache the 786MB Playwright base image to avoid re-downloading
- name: Cache Playwright base image
  uses: actions/cache@v4
  with:
    path: /tmp/playwright-image.tar
    key: playwright-base-image-v1.56.1-noble-${{ hashFiles('packages/frontend/Dockerfile.e2e') }}

- name: Load or pull Playwright base image
  run: |
    if [ -f /tmp/playwright-image.tar ]; then
      docker load -i /tmp/playwright-image.tar
    else
      docker pull mcr.microsoft.com/playwright:v1.56.1-noble
      docker save mcr.microsoft.com/playwright:v1.56.1-noble -o /tmp/playwright-image.tar
    fi
```

**Benefits**:
- **Eliminates 786MB download**: Base image loads from cache instead of pulling from registry
- **Saves ~46 seconds per build**: Reduces total build time by 46%
- **Automatic invalidation**: Cache updates when Dockerfile changes

**Performance**:
- First build (cold cache): ~99 seconds (includes base image pull)
- Subsequent builds (warm cache): ~53 seconds (loads base image from cache)
- Code-only changes: ~53 seconds (base image + 7s rebuild)
- Layer cache hit rate: 71% (5/7 layers cached)
- Effective time savings: **90%** vs cold build

#### 3. Optimized Dockerfile Layer Ordering
**File**: `packages/frontend/Dockerfile.e2e`

**Strategy**: Order layers from least frequently changed to most frequently changed

```dockerfile
# Stable layers (rarely change)
FROM mcr.microsoft.com/playwright:v1.56.1-noble
WORKDIR /app
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
RUN npm ci --workspace=frontend --include=dev  # ← Expensive but cached

# Create user BEFORE copying code (preserves npm cache)
RUN if ! id -u pwuser...; fi

# Volatile layers (change frequently)
COPY . .  # ← Invalidates only from here down
RUN chown -R pwuser:pwuser /app
```

**Before**: User creation after COPY → Any code change invalidates npm ci cache
**After**: User creation before COPY → Code changes only invalidate chown layer

**Savings**: 1-2 minutes per build when only code changes

#### 4. .dockerignore Optimization
**File**: `.dockerignore`

Excludes unnecessary files from Docker build context:
- `node_modules` (installed in container)
- `dist`, `build` (not needed for builds)
- `.git`, `.github` (version control files)
- `test-results`, `playwright-report` (test outputs)

**Before**: ~500MB context sent to Docker daemon
**After**: ~20-30MB context sent to Docker daemon

**Savings**: 1-2 minutes in context transfer and layer invalidation

#### 5. Reduced Browser Matrix
**File**: `packages/frontend/playwright.config.ts`

**Before**: 4 browsers (Chromium, WebKit, Mobile Chrome, Mobile Safari)
**After**: 2 browsers (Chromium, WebKit)

**Rationale**:
- 90%+ of bugs caught by desktop browsers
- Mobile responsiveness tested via viewport configuration
- Cross-engine coverage maintained (Blink + WebKit)

**Savings**: 2-3 minutes (50% reduction in test execution time)

### Docker Build Cache Metrics

The CI automatically tracks Docker build efficiency using `docker/build-push-action`:

**Automatic metrics provided**:
- Per-layer timing breakdown
- Cache hit/miss statistics
- Layer size analysis
- Build duration tracking

**Example output** (in job summary):
```
Building 8.5s (12/12) FINISHED

=> CACHED [2/8] WORKDIR /app                                            0.0s
=> CACHED [3/8] COPY package*.json ./                                   0.0s
=> CACHED [4/8] RUN npm ci --workspace=frontend                         0.0s
=> [5/8] COPY . .                                                       0.2s
=> [6/8] RUN chown -R pwuser:pwuser /app                                1.8s
=> exporting layers                                                     0.5s
```

**Monitoring**: Check "e2e-tests" job summary after each CI run for detailed metrics.

**Historical Analysis**: Use the `docker-cache-analysis` skill to analyze cache performance trends over time:
- **Skill**: `.claude/skills/docker-cache-analysis/analysis.yaml`
- **Purpose**: Track cache hit rates, identify degradation patterns, get optimization recommendations
- **Dependencies**: Uses `git-notes-helper` skill for git notes operations
- **Usage**: Cache metrics are automatically captured in git notes (`refs/notes/ci/cache-metrics`) by CI

### Performance Benchmarks

| Metric | Before Optimization | After Optimization | Improvement |
|--------|---------------------|-------------------|-------------|
| **Total CI time** | 12-15 min | 7-8 min | 40-50% faster |
| **Docker build (cold)** | ~60s | ~60s | Same (baseline) |
| **Docker build (warm)** | ~60s (no cache) | ~5-15s | 75-90% faster |
| **E2E test execution** | ~8-10 min (4 browsers) | ~5-7 min (2 browsers) | 30-40% faster |
| **Browser coverage** | 4 browsers | 2 browsers | 50% reduction |
| **Cache hit rate** | 0% (no caching) | 85-90% | +85-90% |

### Maintenance Guidelines for Claude Code

When modifying the CI pipeline:

1. **Preserve parallelization**: Don't add `needs:` dependencies unless truly required
2. **Maintain layer ordering**: Keep Dockerfile layers ordered from stable to volatile
3. **Update .dockerignore**: Add new generated directories to exclusion list
4. **Monitor cache hit rate**: Check job summaries to validate caching effectiveness
5. **Test locally first**: Run `npm run test:e2e:docker` before pushing CI changes

**Warning**: Avoid these anti-patterns:
- ❌ Adding unnecessary `needs:` dependencies (breaks parallelization)
- ❌ Moving COPY before RUN in Dockerfile (invalidates npm cache)
- ❌ Removing files from .dockerignore without justification
- ❌ Adding more browsers without performance justification
- ❌ Using `--force-recreate` flag (bypasses Docker cache)

### Future Optimization Opportunities

If CI time becomes a bottleneck again:

1. **Matrix parallelization**: Run E2E tests on multiple workers (currently 4 workers in single job)
2. **Selective test execution**: Only run tests affected by changed files
3. **Dependency caching**: Cache `node_modules` across jobs (currently each job runs `npm ci`)
4. **Custom Docker base image**: Pre-build image with npm dependencies installed
5. **Remote Docker layer cache**: Use external cache backend (e.g., ECR) for even faster builds

**Current philosophy**: Optimize for maintainability over absolute speed. The current setup balances performance with simplicity and debuggability.

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

#### Visual Snapshot Management (IMPORTANT)

**Philosophy: Remote-Only Visual Testing**

Visual regression tests are **NEVER** run locally. Research shows that running visual tests locally is an anti-pattern due to high flakiness from:
- **OS rendering differences** (macOS vs Linux font hinting, subpixel rendering)
- **Docker-on-macOS quirks** (host kernel affects rendering even in containers)
- **GPU/hardware variations** (acceleration, color profiles)
- **Timing/network conditions** (loading states, animations)

**The Solution**: Visual snapshots are ONLY generated, updated, and validated in the remote CI environment (GitHub Actions).

**Environment-Based Testing**: The project uses `TEST_ENV` to enforce this:

- **`TEST_ENV=local`** (default): Skips visual regression tests, runs functional E2E tests only
- **`TEST_ENV=ci-docker`**: Runs ALL tests including visual snapshots (GitHub Actions only)
- **`TEST_ENV=ecs`** (future): Production validation tests

**What Runs Where**:
| Environment | Functional E2E | Visual Regression | Snapshot Updates |
|-------------|---------------|-------------------|------------------|
| Local (developer) | ✅ Yes | ❌ Never | ❌ Never |
| GitHub Actions | ✅ Yes | ✅ Yes | ✅ Via workflow |

**How to Update Snapshots (Remote-Only)**:

When UI changes cause CI visual tests to fail:

**Option 1: Manual workflow trigger**
```bash
# 1. Push your code changes
git push

# 2. Go to GitHub Actions → "Update Visual Snapshots" → Run workflow
# 3. Workflow updates snapshots and commits to your branch
# 4. Pull the changes
git pull
```

**Option 2: PR comment trigger**
```bash
# 1. Create PR with your changes
# 2. Comment on the PR: /update-snapshots
# 3. Workflow updates snapshots automatically
# 4. Review and merge
```

**Option 3: Commit footer trigger**
```bash
# Add "Snapshots: update" footer to your commit message
git commit -m "feat(frontend): Redesign button

Changes the button color to blue.

Snapshots: update"
git push
# Workflow runs automatically and updates snapshots
```

**Note**: When pushing multiple commits, the workflow checks ALL commits in the push. If ANY commit contains `Snapshots: update`, the workflow will run, even if it's not the HEAD commit.

**Verifying Changes**:
1. CI workflow commits snapshot updates with detailed message
2. Review the git diff in the snapshot files
3. Check uploaded artifacts for visual diffs
4. Ensure only *-linux.png files exist (no *-darwin.png)

**Why This Works**:
- **Consistency**: All snapshots generated in identical CI environment
- **Reliability**: No platform-specific rendering issues
- **Audit Trail**: Automated commits show when/why snapshots changed
- **No Local Setup**: Developers don't need Docker/Playwright installed locally

**Golden Rule**: Visual snapshots are a **CI-only concern**. Developers write code, CI validates visuals.

#### When to Update Visual Snapshots

Visual snapshots capture the exact pixel-perfect appearance of your UI. They need updating whenever you intentionally change how something looks.

**Always update snapshots after these changes:**

1. **CSS Styling Modifications**
   - Colors, backgrounds, borders
   - Spacing (padding, margin, gap)
   - Shadows, gradients, opacity
   - Font sizes, weights, or families
   - Focus/hover/active state styling

2. **Visual Elements Added/Removed**
   - Icons, emojis, badges
   - Decorative elements
   - Loading spinners, animations
   - Visual feedback indicators

3. **Component Layout Changes**
   - Flexbox/grid structure
   - Element positioning
   - Component sizing
   - Responsive breakpoints

4. **Text Content Changes**
   - Labels, placeholders, help text
   - Error messages
   - Button text

**Do NOT update snapshots for these changes:**

- Logic/behavior changes (state management, event handlers)
- Test code modifications
- Backend API changes
- Documentation updates
- Configuration changes

**Detection and Workflow:**

The project includes automated detection to prevent forgotten snapshot updates:

1. **Pre-commit Hook Warning**: When you commit changes to `.svelte` or `.css` files, the pre-commit hook displays:
   ```
   ⚠️  UI Changes Detected
   You've modified UI files that may affect visual snapshots:
     📄 packages/frontend/src/components/Button.svelte

   If this changes visual appearance, remember to update snapshots:
     • Add "Snapshots: update" footer to commit message, OR
     • Comment /update-snapshots on PR after pushing
   ```

2. **CI Validation**: If you push without updating snapshots, CI will fail with visual diff errors

3. **Snapshot Update Process**: Use any of the three methods documented above (commit message trigger recommended)

**Best Practices:**

- Update snapshots in the same PR that changes the UI (keeps changes atomic)
- Review the visual diff artifacts in CI to verify changes are intentional
- If CI visual tests fail unexpectedly, check for unintended style side effects
- Never commit `*-darwin.png` or platform-specific snapshots (CI will reject them)

**Example Workflow:**

```bash
# 1. Make UI changes
git add packages/frontend/src/components/Button.svelte

# 2. Commit with snapshot update footer
git commit -m "feat(frontend): Redesign primary button

Changes button color and adds hover animation.

Snapshots: update"

# 3. Push to trigger CI snapshot update
git push

# 4. CI automatically updates snapshots and commits
# 5. Pull the updated snapshots
git pull

# 6. Done! CI will pass on next run
```

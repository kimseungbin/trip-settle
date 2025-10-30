# Trip Settle

A full-stack TypeScript application for managing trip expense settlements.

## ✨ Highlights

What makes this project interesting:

- 🚀 **10-minute setup**: `npm install && npm run dev` - No database, no Docker, no configuration files
- ⚡ **Sub-second feedback**: HMR in development, 7-minute CI pipeline, instant test results
- 🎯 **Type-safe everything**: TypeScript across frontend, backend, infrastructure, and CI tooling
- 🏗️ **Production-ready**: GitOps deployments, E2E tests, visual regression, accessibility validation
- 📦 **Monorepo done right**: Shared configs, parallel builds, smart caching, 71% Docker cache hit rate

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

**That's it!** No database installation required for local development.

### Run the App

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev
```

**Development servers:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

### Run Tests

```bash
# Unit tests (fast - use during development)
npm run test:unit --workspace=frontend
npm run test --workspace=backend

# E2E tests (comprehensive - run before push)
npm run test:e2e:docker
```

## Tech Stack

- **Frontend**: Svelte 5 + Vite 7 + TypeScript
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Infrastructure**: AWS CDK (TypeScript)
- **Testing**: Vitest (unit), Playwright (E2E, visual regression, accessibility)
- **Development Database**: pg-mem (in-memory PostgreSQL, zero setup)
- **Monorepo**: npm workspaces with shared configs

## Why This Architecture?

### Zero-Configuration Development

No `.env` files, no database installation, no Docker required for local development:

- **TypeScript configs**: Type-safe configuration with IDE autocomplete, no environment variable parsing
- **In-memory database**: `pg-mem` provides full PostgreSQL compatibility in development
- **10-minute onboarding**: New developers productive immediately

[→ Read more about architecture decisions](docs/architecture.md)

### Modern Monorepo

npm workspaces with intelligent dependency management:

- **Shared tooling**: Single TypeScript/ESLint/Prettier version across all packages
- **Smart caching**: CI partial cache hits save 15-20 seconds per run
- **Atomic deployments**: Frontend/backend changes deployed together
- **GitHub Actions as workspace members**: CI tooling gets same benefits as application code

[→ Read more about monorepo architecture](docs/architecture.md#monorepo-architecture)

### Fast CI/CD Pipeline

Parallel execution and aggressive caching:

- **7-8 minute total CI time**: 4 jobs running in parallel (quality, build, unit, E2E)
- **71% Docker cache hit rate**: Optimized Dockerfile layer ordering
- **Git notes for diagnostics**: CI metadata embedded in git history, no external dashboards

[→ Read more about CI/CD optimizations](docs/ci-cd.md)

### Design-First Approach

Every feature meets accessibility and UX standards:

- **Keyboard-first**: All interactions work without a mouse
- **Mobile-first responsive**: Designs start mobile, enhance for desktop
- **Performance as feature**: Sub-second loads, instant user feedback
- **WCAG compliant**: ARIA, semantic HTML, accessibility automated tests

[→ Read more about design philosophy](docs/design-philosophy.md)

## Development

### Backend Run Modes

The backend supports two distinct run modes optimized for different contexts:

#### Development Mode (Watch)

**Command**: `npm run dev --workspace=backend`

**When to use**: Local native development, Docker Compose local development, interactive debugging

**Why**: Fast iteration during active development - code changes automatically trigger recompilation and restart.

#### Production Mode (Build Once)

**Commands**:
```bash
npm run build --workspace=backend
npm run start --workspace=backend
```

**When to use**: CI/CD E2E tests, production deployments (ECS, Lambda, Fargate), Docker E2E test environments

**Why**: Faster startup time, more stable for automated tests, no unnecessary file watching overhead.

### Database Setup

**Development**: No setup required! Uses `pg-mem` for in-memory PostgreSQL.

**Production**: Configure via environment variables:
```bash
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=trip_settle
```

### Git Hooks

Pre-commit hooks validate code quality before commits (formatting, linting, build compilation).

**One-time setup** after cloning:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

**Note**: E2E tests are NOT run in hooks (too slow). Run manually before push: `npm run test:e2e:docker`

For detailed hook setup and troubleshooting, see `.claude/skills/git-hooks-setup/SKILL.md`

## Testing

### Test Strategy

The project uses a strict test pyramid for fast TDD cycles:

- **Unit tests** (< 5s): Vitest for frontend and backend - run during active development
- **E2E tests** (2-5min): Playwright for visual regression, keyboard navigation, accessibility - run before push
- **CI tests** (5-10min): Full suite including all browsers and platforms - automated on push/PR

```bash
# Unit tests (fast - use during development)
npm run test:unit --workspace=frontend
npm run test --workspace=backend

# E2E tests (Docker-based, recommended)
npm run test:e2e:docker

# E2E tests (local, faster iteration when writing tests)
npm run test:e2e:ui --workspace=frontend
```

For comprehensive Playwright testing documentation, see `.claude/skills/playwright-testing/guide.yaml`

## Continuous Integration

### Running CI Checks Locally

Before pushing, run the same checks CI will run:

```bash
# Code quality
npm run format:check && npm run lint && npm run type-check --workspace=frontend

# Build
npm run build

# Tests
npm run test:unit --workspace=frontend
npm run test --workspace=backend
npm run test:e2e:docker
```

### CI Pipeline

4 jobs run in parallel (~7-8 min total):

1. Code Quality (~2 min)
2. Build (~2 min)
3. Unit Tests (~1 min)
4. E2E Tests (~5-7 min)

For CI optimization details and failure troubleshooting, see [CI/CD Documentation](docs/ci-cd.md)

## Deployment

### AWS CDK Setup

**First-time setup** (one-time operation):

1. Bootstrap CDK in AWS CloudShell:
```bash
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/YOUR_REGION
```

2. Set up GitHub Actions OIDC for automated deployments

For detailed deployment instructions, see [Deployment Guide](docs/deployment.md)

### Deploying Changes

**Automatic** (recommended): Push to `main` - GitHub Actions deploys automatically

**Manual** (testing):
```bash
npm run diff --workspace=infra   # Preview changes
npm run deploy --workspace=infra # Deploy to AWS
```


## Project Structure

```
trip-settle/
├── packages/
│   ├── frontend/          # Svelte + Vite + TypeScript
│   │   ├── src/
│   │   ├── tests/         # E2E, visual, accessibility tests
│   │   └── vite.config.ts
│   ├── backend/           # NestJS + TypeORM + PostgreSQL
│   │   ├── src/
│   │   ├── test/          # Unit and integration tests
│   │   └── nest-cli.json
│   └── infra/             # AWS CDK (Infrastructure as Code)
│       ├── bin/
│       └── lib/
├── .github/
│   ├── actions/           # TypeScript GitHub Actions
│   └── workflows/         # CI/CD pipelines
├── docs/                  # Documentation
│   ├── architecture.md    # Technical decisions
│   ├── design-philosophy.md
│   ├── ci-cd.md
│   └── deployment.md
├── CLAUDE.md              # Claude Code instructions
└── README.md              # You are here
```

## Learn More

- **[Architecture & Technical Decisions](docs/architecture.md)** - Monorepo, build tooling, ESM, Docker, zero-config development
- **[Design Philosophy](docs/design-philosophy.md)** - Keyboard-first, mobile-first, performance, accessibility
- **[CI/CD Pipeline](docs/ci-cd.md)** - Optimizations, caching, failure reports, git notes
- **[AWS Deployment](docs/deployment.md)** - CDK bootstrap, OIDC setup, GitHub Actions

## License

MIT

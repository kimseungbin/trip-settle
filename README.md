# Trip Settle

A full-stack TypeScript application for managing trip expense settlements.

## Features

✨ **Zero-configuration development** - No database installation needed
🚀 **Hot reload** - Fast development with Vite and NestJS watch mode
🎯 **Type-safe** - End-to-end TypeScript
🏗️ **Infrastructure as Code** - AWS CDK for deployments
📦 **Monorepo** - Organized with npm workspaces

## Tech Stack

- **Frontend**: Svelte + Vite + TypeScript
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Infrastructure**: AWS CDK
- **Monorepo**: npm workspaces
- **Development Database**: pg-mem (in-memory PostgreSQL, zero configuration)
- **Testing**: Vitest (unit), Playwright (E2E), Jest (backend)

## Design Philosophy

### User Experience First

This project prioritizes exceptional user experience because great applications should be accessible and delightful for everyone.

**Why Keyboard Accessibility Matters**

All interactive features must work without a mouse. This isn't just about power users - it's about inclusion:

- **Accessibility**: Users with motor disabilities rely on keyboard navigation
- **Efficiency**: Power users move faster with keyboard shortcuts
- **Universality**: Works in environments where mice aren't practical (tablets, kiosks)
- **Testing**: Keyboard-first design catches UX issues early

Our keyboard-first principles:
- Forms submit with Enter, clear with Escape
- Tab navigation follows logical, intuitive flow
- Arrow keys navigate lists and selections
- Every interactive element is reachable and usable via keyboard

**Why Responsive Design**

Mobile-first approach with desktop enhancements ensures:
- **Mobile Reality**: Most users browse on phones - design for them first
- **Progressive Enhancement**: Start minimal, add features for larger screens
- **Performance**: Mobile-first forces efficiency and fast load times
- **Future-Proof**: Works across devices from watches to ultra-wide monitors

**Why Performance Matters**

Fast, smooth interactions with minimal latency create trust and satisfaction:
- **User Retention**: Slow apps frustrate users and drive them away
- **Perceived Quality**: Performance directly affects how users judge quality
- **Accessibility**: Fast response helps users with cognitive disabilities
- **Global Reach**: Works well even on slower networks and devices

**Why Clear Feedback**

Visual and interaction feedback for all actions builds confidence:
- **User Confidence**: Users know their actions worked
- **Error Prevention**: Clear states prevent accidental actions
- **Learning**: Feedback teaches users how the app works
- **Trust**: Responsive UI feels reliable and professional

When designing features, ask yourself:
1. Can this be done without a mouse? (keyboard accessibility)
2. Is the interaction intuitive and discoverable? (usability)
3. Does it work well on mobile devices? (responsive design)
4. Is it accessible to users with disabilities? (inclusive design)

### Testing Strategy

**Why Playwright for E2E Testing?**

Playwright catches UI breakage that unit tests miss:
- **Visual Regressions**: Screenshot comparisons detect layout shifts, CSS changes, missing elements
- **Functional Testing**: Verifies forms, buttons, navigation, and user workflows actually work
- **Keyboard Accessibility**: Ensures all features work without a mouse (critical for this project)
- **WCAG Compliance**: Automated accessibility audits catch contrast, ARIA, and semantic HTML issues

**Why Docker for E2E Tests?**

The project uses Docker-based Playwright testing by default for:
- ✅ **Zero setup**: No `npx playwright install` needed
- ✅ **Consistency**: Same browser versions on all machines (Mac, Linux, Windows)
- ✅ **CI/CD parity**: Identical environment to GitHub Actions
- ✅ **Isolation**: Tests don't affect local environment
- ✅ **Orchestration**: Automatically starts backend + frontend services

### Development Workflow

**Why Custom Git Hooks?**

By default, git hooks live in `.git/hooks/` which is **not tracked by version control**. Using a custom directory (`.githooks/`) provides:

1. **Version control hooks**: All team members get the same hooks
2. **Easy updates**: Hook changes propagate via git pull
3. **No external dependencies**: Works without tools like husky
4. **Explicit opt-in**: Developers consciously enable hooks after understanding what they do

### Git Hooks

The project uses pre-commit hooks to validate code quality before commits. These hooks run automatically before each commit to check:

- Code formatting (Prettier)
- Linting (ESLint)
- Build compilation (all packages)

**Note**: E2E tests are NOT run in hooks due to slow execution time. Run them manually before pushing: `npm run test:e2e:docker`

#### Setting Up Git Hooks

After cloning the repository, enable custom hooks (one-time setup):

```bash
# Configure git to use the .githooks directory
git config core.hooksPath .githooks

# Make all hooks executable (required on Unix-based systems)
chmod +x .githooks/*
```

#### Verification

Verify hooks are configured correctly:

```bash
git config core.hooksPath
# Should output: .githooks
```

Try making a test commit - you should see the pre-commit hook output.

#### Bypassing Hooks Temporarily

If you need to bypass hooks for a specific commit (e.g., work-in-progress):

```bash
git commit --no-verify -m "WIP: Your message"
```

**Note**: Use `--no-verify` sparingly. It's better to fix issues caught by hooks than to bypass them.

For detailed troubleshooting and hook internals, see `.claude/skills/git-hooks-setup/SKILL.md`

**Why No .env Files?**

The project uses TypeScript-based configuration for:
- **Type safety**: Configuration errors caught at compile time
- **Better IDE support**: Autocomplete and refactoring
- **Environment clarity**: Explicit local/development/production configs
- **Zero secrets in repo**: Environment-specific values injected by CI/CD

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9
- AWS CLI (for infrastructure deployment, optional)

**Note**: No database installation required for local development!

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start both frontend and backend
npm run dev
```

That's it! The development environment uses **pg-mem** for an in-memory PostgreSQL database with zero configuration.

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API**: http://localhost:3000/api

Or run them separately:
```bash
# Terminal 1 - Backend
npm run dev --workspace=backend

# Terminal 2 - Frontend
npm run dev --workspace=frontend
```

### Backend Run Modes

The backend supports two distinct run modes optimized for different contexts:

#### Development Mode (Watch)

**Command**: `npm run dev --workspace=backend`

**What it does**: TypeScript compilation in watch mode with hot reload. Code changes automatically trigger recompilation and restart.

**When to use**:
- Local native development
- Docker Compose local development (`docker-compose up`)
- Interactive debugging sessions

**Why**: Fast iteration during active development. No need to manually rebuild after each change.

#### Production Mode (Build Once)

**Commands**:
```bash
npm run build --workspace=backend
npm run start --workspace=backend
```

**What it does**: Builds TypeScript once to JavaScript, then runs the compiled code. No file watching.

**When to use**:
- CI/CD E2E tests (GitHub Actions)
- Production deployments (ECS, Lambda, Fargate)
- Docker E2E test environments

**Why**: Faster startup time, more stable for automated tests, no unnecessary file watching overhead in production.

#### Choosing the Right Mode

**For E2E Docker configurations** (`docker-compose.e2e.yml`, `Dockerfile`):
- **Local Docker E2E**: Use development mode for faster iteration when code changes need to be reflected immediately
- **CI E2E**: Use production mode for faster startup and stability in automated testing

### Database Setup

**Development**: No setup required! Uses `pg-mem` for in-memory PostgreSQL.

**Production**: Set environment variables:
```bash
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=trip_settle
```

### API Endpoints

The backend exposes the following endpoints:

- `GET /api` - API root
- `GET /api/health` - Health check endpoint

Test the API:
```bash
curl http://localhost:3000/api
curl http://localhost:3000/api/health
```

### Building

```bash
# Build all packages
npm run build

# Build individual packages
npm run build --workspace=frontend
npm run build --workspace=backend
npm run build --workspace=infra
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests for specific package
npm run test --workspace=frontend  # Vitest (Svelte components)
npm run test --workspace=backend   # Jest (NestJS services)

# Run E2E tests (Docker-based, recommended)
npm run test:e2e:docker

# Run E2E tests locally (faster iteration during development)
npm run test:e2e:ui --workspace=frontend  # Interactive UI mode
```

**E2E Testing Philosophy**: The project uses Docker-based Playwright testing by default to ensure consistency across all development machines and CI/CD. Local testing is available for faster iteration when actively writing tests. See `.claude/skills/playwright-testing/guide.yaml` for comprehensive testing documentation.

### Continuous Integration (CI/CD)

The project uses GitHub Actions to automatically validate code changes. Every push and pull request triggers a comprehensive CI pipeline.

#### What Runs in CI

The CI workflow runs **4 jobs in parallel** for fast feedback:

1. **Code Quality** (~2 min) - Formatting, linting, type-checking
2. **Build** (~2 min) - Compiles all packages (frontend, backend, infra)
3. **Unit Tests** (~1 min) - Fast tests for frontend (Vitest) and backend (Jest)
4. **E2E Tests** (~5-7 min) - End-to-end tests via Docker + Playwright

**Total CI time**: ~7-8 minutes (jobs run in parallel)

#### Running CI Checks Locally

**Before pushing**, run the same checks CI will run to avoid failures:

```bash
# Code quality (formatting, linting, type-checking)
npm run format:check && npm run lint && npm run type-check --workspace=frontend

# Build all packages
npm run build

# Unit tests (fast)
npm run test:unit --workspace=frontend  # Frontend unit tests
npm run test --workspace=backend        # Backend unit tests

# E2E tests (slower, run before push)
npm run test:e2e:docker  # Full E2E test suite with Docker
```

**Pre-commit hooks** automatically run formatting, linting, and build checks. See [Git Hooks](#git-hooks) section.

#### CI Optimizations

The CI pipeline is optimized for speed and efficiency:

- **Parallel execution**: Quality checks run concurrently with builds and tests
- **Docker layer caching**: GitHub Actions cache persists build layers across runs
- **Reduced browser matrix**: Tests run on 2 browsers (Chromium + WebKit) instead of 4
- **Optimized Dockerfile**: Layer ordering preserves npm cache when only code changes

**Performance gains**: 40-50% faster than sequential execution (~12-15 min → 7-8 min)

#### Docker Build Cache Metrics

CI automatically tracks Docker build efficiency with detailed metrics:

- **Cache hit rate**: Percentage of layers reused vs. rebuilt
- **Per-layer timing**: Identifies slow build steps
- **Build duration**: Tracks performance improvements over time

View metrics in the "e2e-tests" job summary after each CI run.

#### What to Do When CI Fails

1. **Check the job summary** - Click on the failed job to see details
2. **Download artifacts** - Failed builds/tests generate downloadable reports
3. **Run checks locally** - Reproduce the failure with local commands above
4. **See CI Failure Reports section below** for troubleshooting guidance

### CI Failure Reports

When GitHub Actions workflows fail, downloadable reports are automatically generated to help diagnose issues. These reports are optimized for both human developers and AI assistants like Claude Code.

#### Available Reports

**Build Failures** (`ci-failure-report.md`):
- Aggregates TypeScript compilation errors
- Groups errors by file with line numbers
- Includes error codes and messages
- Available as a downloadable artifact

**E2E Test Failures** (Playwright reports):
- HTML test report with screenshots
- Test results with stack traces
- Visual diff images for failed tests

#### How to Access Reports

1. **GitHub Actions UI**:
   - Go to the failed workflow run
   - Scroll to bottom → "Artifacts" section
   - Download `ci-failure-report` (build errors) or `playwright-report` (E2E failures)

2. **Job Summary**:
   - The CI failure report is also displayed in the workflow job summary
   - Click on the "All Checks Passed" job to view inline

#### Using Reports with Claude Code

These reports are designed to be Claude Code-friendly:

```bash
# 1. Download the ci-failure-report.md artifact from GitHub Actions
# 2. In Claude Code, share the report:
"Here's my CI failure report, can you help me fix it?"
# 3. Attach the ci-failure-report.md file

# Claude Code will analyze the errors and suggest fixes
```

#### What Gets Captured

The CI workflow captures failure information using several techniques:

- **Build logs**: Uses `tee` command to capture output while displaying it real-time
  ```bash
  npm run build 2>&1 | tee build-log.txt
  ```
  - `2>&1` redirects stderr to stdout (combines all output)
  - `tee` writes to both file and terminal simultaneously
  - Logs are uploaded as artifacts on failure

- **Test reports**: Playwright automatically generates HTML reports
- **Summary generation**: Node.js script parses logs and creates structured markdown

#### Technical Details

**How `tee` Works**:
The `tee` command is like a T-shaped pipe fitting - it duplicates input to multiple destinations:
- Writes output to a file (`build-log.txt`)
- Also prints to stdout (visible in GitHub Actions UI)
- This ensures you get both real-time logs AND saved artifacts

**Failure Report Script**: `.github/scripts/generate-failure-report.js`
- Parses TypeScript errors using regex patterns
- Groups errors by file for easy navigation
- Includes git context (commit SHA, branch, run URL)
- Runs only when failures are detected

### Deploying Infrastructure

#### First-Time Setup: Bootstrap AWS CDK (One-Time Operation)

Before deploying any infrastructure, you must bootstrap AWS CDK. This is a one-time operation per AWS account/region.

**Using AWS CloudShell (Recommended - No Local Credentials Needed):**

1. Log into AWS Console
2. Open CloudShell (terminal icon in top navigation bar)
3. Select your target region (e.g., `ap-northeast-2`)
4. Get your AWS account ID and region:

```bash
# Get account ID
aws sts get-caller-identity --query Account --output text

# Get current region
aws configure get region
```

5. Bootstrap CDK with your account ID and region:

```bash
# Replace with your account ID and desired region
npx cdk bootstrap aws://YOUR_ACCOUNT_ID/YOUR_REGION

# Example:
# npx cdk bootstrap aws://433751222689/ap-northeast-2
```

6. Verify bootstrap succeeded:

```bash
aws cloudformation describe-stacks --stack-name CDKToolkit
```

You should see the CDKToolkit stack with `StackStatus: CREATE_COMPLETE`.

**What does bootstrap do?**
- Creates S3 bucket for CloudFormation templates
- Creates ECR repository for Docker images
- Creates IAM roles for deployments
- One-time operation per account/region combination

#### Setting Up GitHub Actions for Continuous Deployment

To enable automatic deployments when you push to `main`, set up GitHub Actions OIDC (no AWS credentials stored in GitHub!):

> **💡 Need help?** If you're using [Claude Code](https://claude.com/claude-code), you can ask Claude to guide you through this setup process interactively. Simply say: *"Help me set up AWS CDK deployment using the cdk-setup skill"*. Claude will invoke the skill automatically and walk you through each step with explanations.

**1. Create OIDC Provider in AWS CloudShell:**

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

**What is the thumbprint?** It's the SHA-1 fingerprint of GitHub's root certificate authority. AWS uses this to verify GitHub's TLS certificate when validating OIDC tokens. This value is public and stable. If you get an error that the provider already exists, skip this step.

**2. Create IAM Role for GitHub Actions:**

```bash
# Create trust policy file
cat > trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/trip-settle:*"
        }
      }
    }
  ]
}
EOF

# Replace YOUR_ACCOUNT_ID and YOUR_GITHUB_USERNAME in the file above

# Create the role
aws iam create-role \
  --role-name GitHubActionsCDKDeployRole \
  --assume-role-policy-document file://trust-policy.json

# Attach permissions (use AdministratorAccess for initial setup)
aws iam attach-role-policy \
  --role-name GitHubActionsCDKDeployRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Get the role ARN (save this for GitHub secrets)
aws iam get-role --role-name GitHubActionsCDKDeployRole --query 'Role.Arn' --output text
```

**3. Add GitHub Repository Variables:**

Go to your GitHub repository → Settings → Secrets and variables → Actions → Variables tab → **Repository variables** section, and add:
- `AWS_ROLE_ARN`: The role ARN from step 2 (e.g., `arn:aws:iam::433751222689:role/GitHubActionsCDKDeployRole`)
- `AWS_REGION`: Your AWS region (e.g., `ap-northeast-2`)

**Notes**:
- Use **Variables** (not Secrets) for the role ARN since it's a public identifier, not a credential. This makes debugging easier as the ARN will be visible in workflow logs.
- Use **Repository variables** (not Environment variables) since this project uses a single AWS account for all environments. If you plan to use separate AWS accounts per environment (e.g., staging, production), use Environment variables instead to configure different role ARNs per environment.

**Security Note**: For production, replace `AdministratorAccess` with a least-privilege policy containing only the permissions needed for your infrastructure (CloudFormation, S3, EC2, RDS, etc.).

#### Deploying Changes

After setup, deployments happen automatically via GitHub Actions when you push to `main`. No local AWS credentials needed!

For manual deployment (requires AWS credentials):
```bash
# Preview changes
npm run diff --workspace=infra

# Deploy to AWS
npm run deploy --workspace=infra
```

## Project Structure

```
trip-settle/
├── packages/
│   ├── frontend/          # Svelte application
│   │   ├── src/
│   │   └── vite.config.ts
│   ├── backend/           # NestJS API
│   │   ├── src/
│   │   └── nest-cli.json
│   └── infra/             # AWS CDK
│       ├── bin/
│       └── lib/
├── CLAUDE.md              # Claude Code documentation
└── package.json           # Root workspace config
```

## License

MIT

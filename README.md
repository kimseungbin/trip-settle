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

This project prioritizes exceptional user experience with a focus on:

- **Keyboard Accessibility**: All interactive features work without a mouse
  - Forms submit with Enter, clear with Escape
  - Tab navigation follows logical flow
  - Keyboard shortcuts for common actions
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Performance**: Fast, smooth interactions with minimal latency
- **Clear Feedback**: Visual and interaction feedback for all user actions

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

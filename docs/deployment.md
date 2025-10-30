# AWS Deployment Guide

This document explains how to deploy Trip Settle infrastructure to AWS using AWS CDK (Cloud Development Kit).

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Setting Up GitHub Actions for Continuous Deployment](#setting-up-github-actions-for-continuous-deployment)
- [Deploying Changes](#deploying-changes)
- [Infrastructure Details](#infrastructure-details)

## Overview

Trip Settle uses **AWS CDK** for infrastructure as code, enabling:

- **Type-safe infrastructure**: Define AWS resources with full IDE support
- **Compile-time validation**: Catch misconfigurations before deployment
- **Reusable constructs**: Abstract common patterns (VPC, RDS, CDN) into components
- **GitOps deployment**: Infrastructure changes deploy automatically on push to `main`

**OIDC authentication** for GitHub Actions (no stored AWS credentials):

- **Short-lived tokens**: GitHub generates temporary credentials via OIDC
- **No secret rotation**: No AWS access keys stored in GitHub Secrets
- **Audit trail**: CloudTrail logs show exactly what GitHub Actions deployed

## Prerequisites

- AWS account with appropriate permissions
- Node.js >= 20.19.0 (Node 24 recommended)
- npm >= 9 (npm 11+ recommended)
- AWS CLI (for manual deployments only)

## First-Time Setup

### Bootstrap AWS CDK (One-Time Operation)

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

## Setting Up GitHub Actions for Continuous Deployment

To enable automatic deployments when you push to `main`, set up GitHub Actions OIDC (no AWS credentials stored in GitHub!):

> **💡 Need help?** If you're using [Claude Code](https://claude.com/claude-code), you can ask Claude to guide you through this setup process interactively. Simply say: _"Help me set up AWS CDK deployment using the cdk-setup skill"_. Claude will invoke the skill automatically and walk you through each step with explanations.

### Step 1: Create OIDC Provider in AWS CloudShell

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

**What is the thumbprint?** It's the SHA-1 fingerprint of GitHub's root certificate authority. AWS uses this to verify GitHub's TLS certificate when validating OIDC tokens. This value is public and stable. If you get an error that the provider already exists, skip this step.

### Step 2: Create IAM Role for GitHub Actions

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

### Step 3: Add GitHub Repository Variables

Go to your GitHub repository → Settings → Secrets and variables → Actions → Variables tab → **Repository variables** section, and add:

- `AWS_ROLE_ARN`: The role ARN from step 2 (e.g., `arn:aws:iam::433751222689:role/GitHubActionsCDKDeployRole`)
- `AWS_REGION`: Your AWS region (e.g., `ap-northeast-2`)

**Notes**:

- Use **Variables** (not Secrets) for the role ARN since it's a public identifier, not a credential. This makes debugging easier as the ARN will be visible in workflow logs.
- Use **Repository variables** (not Environment variables) since this project uses a single AWS account for all environments. If you plan to use separate AWS accounts per environment (e.g., staging, production), use Environment variables instead to configure different role ARNs per environment.

**Security Note**: For production, replace `AdministratorAccess` with a least-privilege policy containing only the permissions needed for your infrastructure (CloudFormation, S3, EC2, RDS, etc.).

## Deploying Changes

### Continuous Deployment (Recommended)

After setup, deployments happen automatically via GitHub Actions when you push to `main`. No local AWS credentials needed!

The workflow file is at `.github/workflows/deploy.yml`.

### Manual Deployment (Optional)

For testing infrastructure changes locally (requires AWS credentials configured):

```bash
# Preview changes
npm run diff --workspace=infra

# Deploy to AWS
npm run deploy --workspace=infra

# Destroy infrastructure (careful!)
npm run destroy --workspace=infra
```

## Infrastructure Details

The infrastructure stack includes:

### VPC Configuration

- **2 Availability Zones** for high availability
- **1 NAT Gateway** for egress traffic from private subnets
- Public and private subnets

### Database (RDS PostgreSQL)

- **PostgreSQL 15** on **t3.micro** instance
- **Private subnets** with egress-only access
- **20GB storage** with autoscaling to 100GB
- **Snapshot on deletion** to prevent data loss
- Automated backups enabled

### Entry Point

- **CDK Entry Point**: `packages/infra/bin/infra.ts`
- **Stack Definition**: `packages/infra/lib/trip-settle-stack.ts`

### Viewing Infrastructure

```bash
# Generate CloudFormation template
npm run synth --workspace=infra

# View infrastructure diff
npm run diff --workspace=infra
```

The synthesized CloudFormation template will be in `packages/infra/cdk.out/`.

## Troubleshooting

### Bootstrap Fails

If `cdk bootstrap` fails:

1. Verify AWS credentials: `aws sts get-caller-identity`
2. Check permissions: IAM user needs CloudFormation, S3, and IAM permissions
3. Verify region: `aws configure get region`

### OIDC Provider Already Exists

If you see "EntityAlreadyExists" when creating OIDC provider, skip Step 1 - the provider is already configured.

### Deployment Fails

1. **Check workflow logs**: GitHub Actions → Failed workflow → Job logs
2. **Verify variables**: Settings → Secrets and variables → Actions → Variables
3. **Test role assumption**: Use `aws sts assume-role-with-web-identity` locally
4. **Check CDK diff**: Run `npm run diff --workspace=infra` to preview changes

### Need Help?

If you're using Claude Code, invoke the `cdk-setup` skill for interactive guidance:

```
"Help me set up AWS CDK deployment using the cdk-setup skill"
```

The skill will guide you through:
- CDK bootstrap
- OIDC provider setup
- IAM role creation
- GitHub variables configuration
- Troubleshooting common issues

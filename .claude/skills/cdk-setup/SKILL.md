---
name: cdk-setup
description: Guide for first-time AWS CDK setup including bootstrap, OIDC provider, and GitHub Actions configuration. Use when helping developers set up CDK deployment infrastructure for the first time, troubleshooting deployment issues, or explaining OIDC authentication.
---

# AWS CDK Setup Guide

This is a one-time setup process that enables continuous deployment via GitHub Actions using OIDC authentication (no stored credentials).

## Prerequisites

- AWS account created
- GitHub repository for the project
- Access to AWS Console (specifically AWS CloudShell)

## Setup Process Overview

This setup involves three main steps:
1. **Bootstrap AWS CDK** - One-time operation to create CDK infrastructure
2. **Configure OIDC Provider** - Allow GitHub Actions to authenticate with AWS
3. **Set Up GitHub Repository Variables** - Store public identifiers for workflow

## Step 1: Bootstrap AWS CDK

**Why**: CDK bootstrap creates the necessary AWS infrastructure (S3 bucket, ECR repository, IAM roles) that CDK needs to deploy CloudFormation stacks.

**How**: Use AWS CloudShell to run bootstrap command without local AWS credentials.

**Commands** (run in AWS CloudShell):

```bash
# Get your AWS account ID and region
aws sts get-caller-identity --query Account --output text
aws configure get region

# Bootstrap CDK (replace ACCOUNT_ID and REGION with actual values)
npx cdk bootstrap aws://ACCOUNT_ID/REGION

# Example:
# npx cdk bootstrap aws://433751222689/ap-northeast-2

# Verify bootstrap completed successfully
aws cloudformation describe-stacks --stack-name CDKToolkit
```

**Note**: CloudShell doesn't allow global npm installs, so use `npx cdk` instead of `npm install -g aws-cdk`.

**What it creates**:
- S3 bucket for CloudFormation templates (CDKToolkit-*)
- ECR repository for Docker images
- IAM roles for deployment operations
- SSM parameters for configuration

## Step 2: Configure OIDC Provider for GitHub Actions

**Why**: OIDC (OpenID Connect) allows GitHub Actions to authenticate with AWS without storing long-lived credentials. GitHub generates short-lived tokens that AWS validates.

**How**: Create OIDC provider and IAM role with trust policy for your GitHub repository.

### 2a. Create OIDC Provider

**Command** (run in AWS CloudShell):

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

**About the thumbprint**: The value `6938fd4d98bab03faadb97b34396831e3780aea1` is the SHA-1 fingerprint of GitHub's root certificate authority. AWS uses this to verify GitHub's TLS certificate when validating OIDC tokens. This value is public and stable across all GitHub Actions setups.

**Note**: If you get an error that the provider already exists, you can skip this step.

### 2b. Create IAM Role for GitHub Actions

**Command** (run in AWS CloudShell):

```bash
# Create trust policy document
cat > trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:GITHUB_USER/REPO_NAME:*"
        }
      }
    }
  ]
}
EOF

# IMPORTANT: Edit trust-policy.json to replace:
# - ACCOUNT_ID with your AWS account ID
# - GITHUB_USER with your GitHub username
# - REPO_NAME with your repository name (e.g., trip-settle)

# Create the IAM role
aws iam create-role \
  --role-name GitHubActionsCDKDeployRole \
  --assume-role-policy-document file://trust-policy.json

# Attach permissions (AdministratorAccess for development)
aws iam attach-role-policy \
  --role-name GitHubActionsCDKDeployRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Get the role ARN (save this for GitHub configuration)
aws iam get-role \
  --role-name GitHubActionsCDKDeployRole \
  --query 'Role.Arn' \
  --output text
```

**Security Note**: `AdministratorAccess` is used here for simplicity. In production, replace with a least-privilege policy containing only:
- `cloudformation:*` - For stack operations
- `s3:*` - For CDKToolkit bucket access
- `iam:PassRole` - For passing roles to resources
- Specific permissions for resources being deployed (EC2, RDS, VPC, etc.)

## Step 3: Configure GitHub Repository Variables

**Why**: The GitHub Actions workflow needs to know which AWS role to assume and which region to deploy to.

**How**: Add repository variables (not secrets, since these are public identifiers).

**Steps**:
1. Go to your GitHub repository
2. Navigate to: Settings → Secrets and variables → Actions → **Variables** tab
3. In the **Repository variables** section, add:
   - Variable name: `AWS_ROLE_ARN`
   - Value: The role ARN from Step 2b (e.g., `arn:aws:iam::433751222689:role/GitHubActionsCDKDeployRole`)
4. Add second variable:
   - Variable name: `AWS_REGION`
   - Value: Your AWS region (e.g., `ap-northeast-2`)

**Why Variables instead of Secrets?**
- The role ARN is a public identifier, not a credential
- Variables are visible in workflow logs, making debugging easier
- Secrets would be masked unnecessarily

**Why Repository Variables instead of Environment Variables?**
- Use **Repository variables** when using a single AWS account for all environments (recommended for small projects)
- Use **Environment variables** when using separate AWS accounts per environment (e.g., dev account, staging account, production account)

## Verification

After completing all steps, verify the setup:

1. **Check CDK Bootstrap**:
   ```bash
   aws cloudformation describe-stacks --stack-name CDKToolkit --query 'Stacks[0].StackStatus'
   ```
   Should output: `CREATE_COMPLETE`

2. **Check OIDC Provider**:
   ```bash
   aws iam list-open-id-connect-providers
   ```
   Should show: `arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com`

3. **Check IAM Role**:
   ```bash
   aws iam get-role --role-name GitHubActionsCDKDeployRole --query 'Role.Arn'
   ```
   Should output the role ARN

4. **Check GitHub Variables**:
   - Visit: https://github.com/YOUR_USER/YOUR_REPO/settings/variables/actions
   - Verify `AWS_ROLE_ARN` and `AWS_REGION` are set

## Next Steps

After completing this setup:
1. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy CDK infrastructure on pushes to `main`
2. No AWS credentials need to be stored in GitHub Secrets
3. Each deployment creates a temporary session using OIDC authentication
4. Infrastructure changes in `packages/infra/**` will trigger deployments

## Troubleshooting

**Bootstrap fails with permission error**:
- Ensure CloudShell session has active credentials: `aws sts get-caller-identity`
- Your IAM user/role needs permissions to create S3 buckets, IAM roles, and CloudFormation stacks

**OIDC provider already exists**:
- This is fine! Skip the create-open-id-connect-provider command
- Multiple repositories can share the same OIDC provider

**GitHub Actions workflow fails with "AssumeRoleWithWebIdentity" error**:
- Verify `AWS_ROLE_ARN` variable is set correctly in GitHub
- Check trust policy has correct GitHub repository path
- Ensure OIDC provider exists: `aws iam list-open-id-connect-providers`

**CDK deploy fails with "Need to perform AWS calls for account XXXX, but no credentials configured"**:
- This happens locally, not in GitHub Actions
- For local deploys, configure AWS CLI: `aws configure`
- For CI/CD deploys, ensure OIDC setup is complete

## Human Guidance

When providing this guidance to humans:
1. Emphasize this is a **one-time setup** - not needed for daily development
2. Explain CloudShell is the easiest path (no local AWS CLI setup needed)
3. Walk through each command step-by-step, explaining what it does
4. Show them how to verify each step completed successfully
5. Remind them to save the role ARN before closing CloudShell
6. Point them to `.github/workflows/deploy.yml` to see how OIDC is used

## For Claude Code

When this skill is invoked by Claude Code:
- Provide step-by-step guidance interactively
- Explain the "why" behind each step
- Offer to show relevant code sections (trust policy, workflow file)
- Help troubleshoot any errors that occur
- Verify each step completed successfully before moving to next step

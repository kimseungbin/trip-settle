# Docker-Based E2E Testing

This document explains how to run Playwright E2E tests using Docker to avoid local browser installation issues.

## Problem

Playwright E2E tests require browser binaries (Chromium, WebKit, Firefox) to be installed locally:
- Missing browsers cause all tests to fail immediately
- Browser installation requires `npx playwright install --with-deps` (~1.5GB download)
- System dependencies vary across platforms (macOS, Linux, Windows)
- Browser version mismatches between local and CI environments

## Solution

Use Docker with the official Playwright image (`mcr.microsoft.com/playwright:v1.56.1-noble`) that includes:
- Pre-installed browsers (Chromium, WebKit, Firefox)
- All system dependencies (fonts, media codecs, etc.)
- Consistent environment across all machines and CI/CD

## Quick Start

```bash
# Run E2E tests in Docker (from project root)
npm run test:e2e:docker

# Clean up containers and volumes after testing
npm run test:e2e:docker:clean
```

## Architecture

The Docker setup uses three services orchestrated by `docker-compose.e2e.yml`:

```
┌─────────────────────────────────────────┐
│  Docker Network: trip-settle-e2e        │
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   Backend    │  │   Frontend   │    │
│  │  (Node 24)   │  │  (Node 24)   │    │
│  │ NestJS + DB  │  │  Vite + Svelte│   │
│  │ Port: 3000   │  │  Port: 5173   │   │
│  └──────┬───────┘  └──────┬───────┘    │
│         │                 │             │
│         └────────┬────────┘             │
│                  │                      │
│         ┌────────▼───────────┐          │
│         │   Playwright       │          │
│         │   Test Runner      │          │
│         │ (Official Image)   │          │
│         │ Runs E2E Tests     │          │
│         └────────────────────┘          │
│                                         │
└─────────────────────────────────────────┘
         │
         ▼
  Test Reports (mounted to host)
  - playwright-report/
  - test-results/
```

### Service Details

1. **Backend Service** (`backend`)
   - Image: `node:24-alpine`
   - Runs: `npm run dev --workspace=backend`
   - Uses pg-mem for in-memory PostgreSQL
   - Health check: `http://localhost:3000/api/health`

2. **Frontend Service** (`frontend`)
   - Image: `node:24-alpine`
   - Runs: `npm run dev --workspace=frontend`
   - Depends on: Backend (waits for health check)
   - Health check: `http://localhost:5173`

3. **Playwright Service** (`playwright`)
   - Image: Built from `packages/frontend/Dockerfile.e2e`
   - Base: `mcr.microsoft.com/playwright:v1.56.1-noble`
   - Depends on: Backend + Frontend (waits for both)
   - Runs: `npm run test:e2e --workspace=frontend`
   - Mounts test reports to host filesystem

## Files

### `packages/frontend/Dockerfile.e2e`

Builds the Playwright test runner image:
- Based on official Playwright Docker image with pre-installed browsers
- Creates non-root user for security (Chromium sandbox requirement)
- Installs npm dependencies
- Sets CI=true environment variable

### `docker-compose.e2e.yml`

Orchestrates the three services:
- Defines service dependencies and health checks
- Mounts code and test reports
- Configures network for service-to-service communication
- Sets security options for Chromium (`ipc: host`, `seccomp:unconfined`)

### `.dockerignore`

Optimizes Docker build performance by excluding:
- `node_modules` (installed in container)
- Build outputs (`dist`, `build`)
- Test reports (`playwright-report`, `test-results`)
- IDE files (`.vscode`, `.idea`)

## Usage

### Run Tests

```bash
# From project root
npm run test:e2e:docker

# From frontend package
cd packages/frontend
npm run test:e2e:docker
```

This command:
1. Builds the Playwright Docker image (if not cached)
2. Starts backend service and waits for health check
3. Starts frontend service and waits for health check
4. Runs Playwright tests in the Playwright container
5. Stops and removes containers when tests complete

### View Test Reports

After tests run, reports are available on your host machine:

```bash
# View HTML report
npm run test:e2e:report --workspace=frontend

# Or open directly
open packages/frontend/playwright-report/index.html
```

### Clean Up

Remove containers, volumes, and cached images:

```bash
# Remove containers and volumes
npm run test:e2e:docker:clean

# Also remove built images (frees disk space)
docker rmi $(docker images -q mcr.microsoft.com/playwright)
```

## Environment Variables

The Docker setup automatically configures:

- `CI=true` - Enables CI mode (retries, single worker)
- `NODE_ENV=local` - Uses local config (pg-mem database)
- `PLAYWRIGHT_BASE_URL=http://frontend:5173` - Tests connect to frontend service

## Troubleshooting

### Tests fail with "Cannot connect to http://localhost:5173"

**Cause**: Playwright is trying to connect to `localhost` instead of the Docker service name.

**Solution**: The docker-compose configuration should handle this automatically. If issues persist, check that `PLAYWRIGHT_BASE_URL` is set correctly in the docker-compose file.

### Build is very slow

**Cause**: First build downloads Playwright image (~1.5GB) and installs dependencies.

**Solution**:
- Subsequent builds use Docker layer caching and are much faster
- Ensure you have a stable internet connection for the initial download
- Use `.dockerignore` to exclude unnecessary files (already configured)

### Permission errors in test reports

**Cause**: Docker runs as root by default, creating files owned by root.

**Solution** (Linux only):
```bash
sudo chown -R $USER packages/frontend/playwright-report
sudo chown -R $USER packages/frontend/test-results
```

On macOS/Windows with Docker Desktop, this is handled automatically.

### "No tests found" error

**Cause**: Test files not mounted correctly or wrong working directory.

**Solution**:
- Ensure you're running from project root
- Verify volumes are mounted correctly in docker-compose.e2e.yml
- Check that `packages/frontend/tests/` directory exists

### Services don't start

**Cause**: Port conflicts or Docker daemon not running.

**Solution**:
```bash
# Check if ports are available
lsof -i :3000
lsof -i :5173

# Start Docker daemon
# macOS: Open Docker Desktop
# Linux: sudo systemctl start docker

# Check Docker is running
docker ps
```

## Advantages of Docker Testing

### ✅ Consistent Environment
- Same browser versions across all machines
- Same OS (Ubuntu 24.04) as CI/CD
- No "works on my machine" issues

### ✅ No Local Setup
- No need to install Playwright browsers
- No system dependencies to manage
- Clean, isolated test runs

### ✅ CI/CD Ready
- Identical environment in CI and locally
- Easy to integrate with GitHub Actions, GitLab CI, etc.
- Reproducible test results

### ✅ Multi-Browser Support
- Chromium, WebKit (Safari), Firefox included
- Mobile viewports (Mobile Chrome, Mobile Safari)
- All pre-configured and ready to use

## CI/CD Integration

For GitHub Actions, use the same Docker approach:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run E2E tests in Docker
        run: npm run test:e2e:docker

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: packages/frontend/playwright-report/
```

## Comparison: Local vs Docker

| Aspect | Local Testing | Docker Testing |
|--------|---------------|----------------|
| **Setup** | `npx playwright install --with-deps` (~1.5GB) | `docker pull` (~1.5GB, one-time) |
| **Browser Updates** | Manual `npx playwright install` | Update Dockerfile version |
| **Consistency** | Varies by OS/machine | Identical everywhere |
| **Isolation** | Affects local environment | Fully isolated |
| **CI Parity** | May differ from CI | Matches CI exactly |
| **Speed** | Faster startup | Slower first build, then fast |

## Best Practices

1. **Use Docker for CI/CD**: Always use Docker in CI pipelines for consistency
2. **Use Docker for teams**: Ensures all developers have identical test environments
3. **Cache wisely**: Don't delete Docker images unless disk space is critical
4. **Mount reports**: Always mount test reports to host for easy viewing
5. **Version pinning**: Pin Playwright version in Dockerfile to match package.json

## Additional Resources

- [Playwright Docker Documentation](https://playwright.dev/docs/docker)
- [Official Playwright Docker Images](https://hub.docker.com/r/microsoft/playwright)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
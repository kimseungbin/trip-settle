# Multi-stage Dockerfile for Trip Settle monorepo
# Supports both backend (NestJS) and frontend (Svelte + Vite) with shared base layers
#
# Usage:
#   Backend:  docker build --target backend-dev -t trip-settle-backend .
#   Frontend: docker build --target frontend-dev -t trip-settle-frontend .

# ==================================================
# Stage: base
# Shared foundation for all services
# ==================================================
FROM node:24-alpine AS base

# Install system dependencies (shared across all services)
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy workspace root package files and TypeScript config
COPY package*.json ./
COPY tsconfig.base.json ./

# Install root dependencies once (shared by all workspaces)
# These include: typescript, eslint, prettier, etc.
# Cached unless root package.json changes
RUN npm ci --ignore-scripts --omit=optional

# ==================================================
# Stage: config-build
# Build shared configuration (used by backend)
# ==================================================
FROM base AS config-build

# Copy shared config source
COPY config ./config

# Build config TypeScript to ESM
WORKDIR /app/config
RUN npm run build

# ==================================================
# Stage: backend-deps
# Install backend dependencies
# ==================================================
FROM base AS backend-deps

# Copy backend package files
COPY packages/backend/package*.json ./packages/backend/

# Install backend-specific dependencies (root deps already installed in base)
# Cached unless backend package.json changes
RUN npm ci --workspace=backend --include=dev

# ==================================================
# Stage: backend-dev
# Backend development runtime
# ==================================================
FROM backend-deps AS backend-dev

# Copy pre-built config from config-build stage
COPY --from=config-build /app/config ./config

# Copy backend source code
COPY packages/backend ./packages/backend

# Set working directory to backend
WORKDIR /app/packages/backend

# Expose NestJS port
EXPOSE 3000

# Use dumb-init to handle signals properly (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Default command: run in development mode with hot reload
CMD ["npm", "run", "dev"]

# ==================================================
# Stage: backend-e2e
# Backend for E2E testing (build once, no watch)
# ==================================================
FROM backend-deps AS backend-e2e

# Copy pre-built config from config-build stage
COPY --from=config-build /app/config ./config

# Copy backend source code
COPY packages/backend ./packages/backend

# Set working directory to backend
WORKDIR /app/packages/backend

# Build TypeScript once (no watch mode needed for E2E tests)
RUN npm run build

# Expose NestJS port
EXPOSE 3000

# Use dumb-init to handle signals properly (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Run compiled JavaScript (production mode, no watch)
CMD ["npm", "run", "start"]

# ==================================================
# Stage: frontend-deps
# Install frontend dependencies
# ==================================================
FROM base AS frontend-deps

# Copy frontend package files
COPY packages/frontend/package*.json ./packages/frontend/

# Install frontend-specific dependencies (root deps already installed in base)
# Cached unless frontend package.json changes
RUN npm ci --workspace=frontend --include=dev

# ==================================================
# Stage: frontend-dev
# Frontend development runtime
# ==================================================
FROM frontend-deps AS frontend-dev

# Copy shared config
COPY config ./config

# Copy frontend source code
COPY packages/frontend ./packages/frontend

# Set working directory to frontend
WORKDIR /app/packages/frontend

# Expose Vite dev server port
EXPOSE 5173

# Use dumb-init to handle signals properly (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Default command: run Vite dev server with host exposed for Docker
CMD ["npm", "run", "dev", "--", "--host"]

# ==================================================
# Future stages can be added here:
# - backend-prod: Production backend build
# - frontend-prod: Production frontend build (nginx)
# - e2e-tests: E2E test runner
# ==================================================
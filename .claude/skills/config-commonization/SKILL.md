---
name: config-commonization
description: |
  Guidelines for managing configuration files across the monorepo.
  Use when adding or modifying TypeScript, ESLint, Prettier, Stylelint, Vitest, or other config files.
  Helps maximize reuse through base/shared configs and avoid duplication.
---

# Configuration Commonization

## Core Principle

**Always maximize configuration reuse through base/shared configs to reduce duplication and ensure consistency.**

When you encounter configuration files or need to add new ones, follow the hierarchy patterns and guidelines in this skill.

## TypeScript Configuration Hierarchy

The monorepo uses a hierarchical TypeScript configuration system:

```
tsconfig.base.json (root)
├── packages/backend/tsconfig.json
│   └── module: ESNext, moduleResolution: bundler
├── packages/infra/tsconfig.json
│   └── module: ESNext, moduleResolution: bundler
├── packages/frontend/tsconfig.node.json (ONLY THIS ONE extends root base)
│   └── module: ESNext, moduleResolution: bundler
└── .github/actions/tsconfig.base.json
    ├── check-snapshot-trigger/tsconfig.json
    ├── extract-e2e-failures/tsconfig.json
    └── generate-failure-report/tsconfig.json
        └── Inherits module: ESNext from root (ESM with esbuild bundler)
```

**Key points**:
- `tsconfig.base.json` defines shared compiler options (module: ESNext, strict mode, etc.)
- Package-specific configs extend the base and override only what's unique
- GitHub Actions share `.github/actions/tsconfig.base.json` to eliminate duplication
- **ESM for Actions**: All GitHub Actions use ESM (module: ESNext) bundled with esbuild for consistency with the monorepo. This provides 20-50x faster builds compared to the previous @vercel/ncc + CommonJS approach, while maintaining compatibility with GitHub Actions' Node.js 24 runtime.

**Frontend has TWO TypeScript configs** (not a duplication issue):
- `packages/frontend/tsconfig.json` - **Extends `@tsconfig/svelte`** (framework-specific, NOT part of monorepo commonization)
- `packages/frontend/tsconfig.node.json` - **Extends root `tsconfig.base.json`** (follows monorepo commonization pattern for build tooling)

## ESLint Configuration

ESLint configs should follow similar patterns:
- **Root config**: Define shared rules in root `.eslintrc.js` or `eslint.config.js`
- **Package overrides**: Extend root config and add package-specific rules (e.g., Svelte rules for frontend)
- **Avoid duplication**: Don't repeat rules that apply to all TypeScript files

**Example pattern**:
- Root: `.github/actions/eslint.config.base.mjs` (shared base for all GitHub Actions)
- Actions: Each action's `eslint.config.mjs` imports and extends the base

## Prettier Configuration

- **Single source**: `.prettierrc.yaml` at root level applies to all packages
- **No overrides needed**: Prettier formatting should be consistent across the monorepo
- All packages inherit: 120 char width, tabs (width: 4), single quotes, no semicolons

## Stylelint Configuration

- Frontend-specific: `packages/frontend/.stylelintrc.json`
- Other packages don't need stylelint (no CSS)

## Vitest Configuration Hierarchy

The monorepo uses `mergeConfig()` utility from `vitest/config` to merge base and package-specific configurations:

```
vitest.config.base.ts (root)
├── packages/backend/vitest.config.ts
│   └── mergeConfig(baseConfig, { test: { environment: 'node', ... } })
├── packages/frontend/vitest.config.ts
│   └── mergeConfig(baseConfig, { plugins: [svelte()], test: { environment: 'happy-dom', ... } })
└── packages/infra/vitest.config.ts
    └── mergeConfig(baseConfig, { test: { environment: 'node', ... } })
```

**Key points**:
- `vitest.config.base.ts` defines shared test settings (globals: true, common exclusions)
- Package configs import `mergeConfig()` utility and merge base with package-specific overrides
- Base exclusions apply to all packages (node_modules, dist, build, cdk.out)
- Package-specific exclusions added only where needed (e.g., frontend excludes e2e/, visual/, accessibility/)

**Example**:
```typescript
// vitest.config.base.ts (root)
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.{idea,git,cache,output,temp}/**',
			'**/build/**',
			'**/cdk.out/**',
		],
	},
})

// packages/backend/vitest.config.ts
import { mergeConfig } from 'vitest/config'
import baseConfig from '../../vitest.config.base'

export default mergeConfig(baseConfig, {
	test: {
		environment: 'node',
		include: ['src/**/*.spec.ts'],
		exclude: [
			'**/test/**', // Backend-specific exclusion
		],
	},
})
```

## General Guidelines for Claude Code

When adding or modifying configurations:

1. **Check for existing base configs** before creating package-specific configs
2. **Identify commonalities** across packages and extract to shared base
3. **Use extends** instead of copy-pasting configuration
4. **Document hierarchy** in comments when creating new base configs
5. **Minimize overrides** - only override settings that are truly package-specific

## Decision Criteria

### Good Candidates for Base Configs

Extract to shared base configuration when:
- TypeScript compiler options (strict mode, module resolution, target)
- ESLint rules for TypeScript files
- Prettier formatting rules
- Vitest/Jest shared test configuration
- Bundler configuration (Vite, Webpack, esbuild)

### When to Create Separate Configs

Keep separate package-specific configs when:
- Framework-specific settings (e.g., Svelte config for frontend only)
- Runtime-specific settings (e.g., Node.js vs browser environments)
- Package-specific linting rules (e.g., NestJS decorators in backend)

## Workflow

When you need to add or modify a configuration file:

1. **Search for existing base configs** in the monorepo (root level, `.github/actions/`, etc.)
2. **Check if multiple packages need similar settings** - if yes, create/update base config
3. **Use extends/import pattern** to inherit from base config
4. **Document the hierarchy** with comments in the config file
5. **Test that the config works** by running relevant commands (lint, build, test)
6. **Update CLAUDE.md** if you create a new base config pattern that future work should follow

## Examples

### Example 1: Adding ESLint Config to New Package

**Bad** (duplication):
```javascript
// packages/new-package/eslint.config.mjs
export default {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}
```

**Good** (reuse):
```javascript
// packages/new-package/eslint.config.mjs
import baseConfig from '../../eslint.config.base.mjs'

export default baseConfig
// Or with overrides:
export default [
  ...baseConfig,
  {
    rules: {
      // Package-specific overrides only
    }
  }
]
```

### Example 2: Creating New Base Config

If you notice 3+ packages have identical config:

1. Create base config at appropriate level (root, or shared directory)
2. Name it clearly: `tsconfig.base.json`, `eslint.config.base.mjs`, etc.
3. Add documentation comment explaining hierarchy
4. Update all packages to extend the base
5. Commit with message explaining the refactoring

## References

- Root TypeScript config: `tsconfig.base.json`
- GitHub Actions TypeScript base: `.github/actions/tsconfig.base.json`
- GitHub Actions ESLint base: `.github/actions/eslint.config.base.mjs`
- Root Prettier config: `.prettierrc.yaml`
- Root Vitest config: `vitest.config.base.ts`
- Frontend Stylelint config: `packages/frontend/.stylelintrc.json`

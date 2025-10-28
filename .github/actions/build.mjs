#!/usr/bin/env node
/**
 * @file Build script for GitHub Actions
 * Usage: node ../../build.mjs
 * Runs from individual action directory
 */

import { build } from 'esbuild'
import { builtinModules } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Node.js built-in modules that should not be bundled
const nodeBuiltins = builtinModules.flatMap((mod) => [mod, `node:${mod}`])

// Determine which action we're building based on current working directory
const cwd = process.cwd()
const actionName = cwd.split('/').pop()

console.log(`Building ${actionName}...`)

try {
	await build({
		entryPoints: ['src/main.ts'],
		bundle: true,
		platform: 'node',
		target: 'node24',
		format: 'esm',
		outfile: 'dist/index.js',
		sourcemap: true,
		// Mark all dependencies and Node.js built-ins as external
		// This prevents bundling and allows GitHub Actions runtime to resolve them
		packages: 'external',
	})

	console.log(`✓ Built ${actionName} successfully`)
} catch (error) {
	console.error(`✗ Build failed for ${actionName}:`, error)
	process.exit(1)
}

import { defineConfig } from 'vitest/config'

/**
 * Base Vitest configuration shared across all packages
 *
 * Package-specific configs extend this base with mergeConfig()
 */
export default defineConfig({
	test: {
		// Enable global test APIs (describe, it, expect, etc.)
		globals: true,

		// Common exclusions across all packages
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.{idea,git,cache,output,temp}/**',
			'**/build/**',
			'**/cdk.out/**',
		],
	},
})

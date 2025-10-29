import { mergeConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import baseConfig from '../../vitest.config.base'

export default mergeConfig(baseConfig, {
	plugins: [svelte()],
	test: {
		environment: 'happy-dom',
		// Only match Vitest test files (exclude Playwright *.spec.ts files)
		include: ['**/*.test.ts'],
		exclude: [
			'**/e2e/**', // Exclude Playwright E2E tests (frontend-specific)
			'**/visual/**', // Exclude Playwright visual tests (frontend-specific)
			'**/accessibility/**', // Exclude Playwright a11y tests (frontend-specific)
		],
	},
})

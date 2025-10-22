import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	plugins: [svelte()],
	test: {
		globals: true,
		environment: 'happy-dom',
		// Only match Vitest test files (exclude Playwright *.spec.ts files)
		include: ['**/*.test.ts'],
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/e2e/**', // Exclude Playwright E2E tests
			'**/visual/**', // Exclude Playwright visual tests
			'**/accessibility/**', // Exclude Playwright a11y tests
			'**/.{idea,git,cache,output,temp}/**',
		],
	},
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		// Match both unit tests (*.spec.ts) and integration tests (*.integration.spec.ts)
		// E2E tests excluded due to NestJS decorator metadata requirements
		include: ['src/**/*.spec.ts'],
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/test/**', // E2E tests directory
			'**/.{idea,git,cache,output,temp}/**',
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			reportsDirectory: './coverage',
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.spec.ts', 'src/**/*.integration.spec.ts', 'src/main.ts'],
		},
	},
})

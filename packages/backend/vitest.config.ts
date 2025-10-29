import { mergeConfig } from 'vitest/config'
import baseConfig from '../../vitest.config.base'

export default mergeConfig(baseConfig, {
	test: {
		environment: 'node',
		// Match both unit tests (*.spec.ts) and integration tests (*.integration.spec.ts)
		// E2E tests excluded due to NestJS decorator metadata requirements
		include: ['src/**/*.spec.ts'],
		exclude: [
			'**/test/**', // E2E tests directory (backend-specific)
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

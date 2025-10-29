import { mergeConfig } from 'vitest/config'
import baseConfig from '../../vitest.config.base'

export default mergeConfig(baseConfig, {
	test: {
		environment: 'node',
		include: ['**/*.test.ts'],
		exclude: [
			'cdk.out/**', // CDK output directory (infra-specific)
		],
	},
})

import baseConfig from '../eslint.config.base.mjs'

/**
 * ESLint configuration for check-snapshot-trigger action
 * Extends the shared base configuration with temporary overrides
 *
 * TODO: Fix type safety issues and remove these overrides
 * Currently disables strict type-checking rules due to legacy code
 */
export default [
	...baseConfig,
	{
		rules: {
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/require-await': 'off',
		},
	},
]

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * Shared ESLint base configuration for all packages in the monorepo.
 * Provides common TypeScript + ESLint recommended rules and settings.
 *
 * Package-specific configs extend this and add their own customizations.
 */
export default [
	// Common ignores
	{
		ignores: ['node_modules/', 'eslint.config.mjs'],
	},
	// Base recommended configs
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	// Common language options
	{
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
			parser: tseslint.parser,
		},
		rules: {
			// Shared rule overrides
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
]

import baseConfig from '../../eslint.config.base.mjs'
import globals from 'globals'

export default [
	// Extend base config
	...baseConfig,
	// Backend-specific ignores
	{
		ignores: ['dist/', 'vitest.config.ts', 'src/shared-config/**/*.js', 'src/shared-config/**/*.d.ts'],
	},
	// Backend-specific configuration (NestJS)
	{
		languageOptions: {
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.node,
			},
		},
		rules: {
			// NestJS-specific rule overrides
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
		},
	},
]

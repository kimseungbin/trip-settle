import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
	{
		ignores: ['cdk.out/', 'node_modules/', '**/*.js', '**/*.d.ts', 'eslint.config.mjs'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: 'module',
			parser: tseslint.parser,
			parserOptions: {
				project: true,
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				module: 'readonly',
				require: 'readonly',
				exports: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
]

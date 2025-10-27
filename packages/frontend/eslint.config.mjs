import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import sveltePlugin from 'eslint-plugin-svelte'
import globals from 'globals'

export default [
	{
		ignores: ['dist/', 'node_modules/', 'playwright-report/', 'test-results/', 'eslint.config.mjs'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...sveltePlugin.configs['flat/recommended'],
	{
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.es2017,
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.svelte'],
			},
			globals: {
				// Svelte 5 runes
				$state: 'readonly',
				$derived: 'readonly',
				$effect: 'readonly',
				$props: 'readonly',
				$bindable: 'readonly',
				$inspect: 'readonly',
			},
		},
	},
]

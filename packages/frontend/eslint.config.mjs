import baseConfig from '../../eslint.config.base.mjs'
import sveltePlugin from 'eslint-plugin-svelte'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
	// Extend base config
	...baseConfig,
	// Frontend-specific ignores
	{
		ignores: ['dist/', 'playwright-report/', 'test-results/'],
	},
	// Svelte plugin configs
	...sveltePlugin.configs['flat/recommended'],
	// Frontend-specific language options
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.es2017,
				...globals.node,
			},
		},
	},
	// Svelte file-specific configuration
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

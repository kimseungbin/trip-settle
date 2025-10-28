import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * Shared ESLint configuration for GitHub Actions
 * Individual actions extend this config in their eslint.config.mjs
 */
export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
				allowDefaultProject: ['*.mjs'],
			},
		},
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
	{
		ignores: ['dist/**', 'lib/**', 'node_modules/**', '__tests__/**', 'eslint.config.mjs'],
	}
)

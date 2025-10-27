import baseConfig from '../../eslint.config.base.mjs'

export default [
	// Extend base config
	...baseConfig,
	// Infra-specific ignores
	{
		ignores: ['cdk.out/', '**/*.js', '**/*.d.ts'],
	},
	// Infra-specific configuration (AWS CDK)
	{
		languageOptions: {
			parserOptions: {
				project: true,
			},
			globals: {
				// Node.js globals (manually defined for CDK)
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
	},
]

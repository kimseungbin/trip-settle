/**
 * @file Main configuration entry point
 * Loads the appropriate config based on NODE_ENV
 */

import type { AppConfig, Environment } from './types.js'

const getEnvironment = (): Environment => {
	const env = process.env.NODE_ENV as Environment | undefined

	if (!env || env === 'local') {
		return 'local'
	}

	if (env === 'development' || env === 'production') {
		return env
	}

	console.warn(`Unknown NODE_ENV: ${env}, defaulting to 'local'`)
	return 'local'
}

const loadConfig = async (): Promise<AppConfig> => {
	const environment = getEnvironment()

	// Use dynamic imports to only load the selected environment config
	// This prevents other environments from executing their validation code
	switch (environment) {
		case 'local': {
			const { localConfig } = await import('./environments/local.js')
			return localConfig
		}
		case 'development': {
			const { developmentConfig } = await import('./environments/development.js')
			return developmentConfig
		}
		case 'production': {
			const { productionConfig } = await import('./environments/production.js')
			return productionConfig
		}
	}
}

// Top-level await (requires ES2022+)
export const config = await loadConfig()

export type { AppConfig, Environment, BackendConfig, FrontendConfig, DatabaseConfig, InfraConfig } from './types.js'

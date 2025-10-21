/**
 * @file Main configuration entry point
 * Loads the appropriate config based on NODE_ENV
 */

import type { AppConfig, Environment } from './types'

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

const loadConfig = (): AppConfig => {
	const environment = getEnvironment()

	// Use dynamic require to only load the selected environment config
	// This prevents other environments from executing their validation code
	switch (environment) {
		case 'local': {
			const { localConfig } = require('./environments/local')
			return localConfig
		}
		case 'development': {
			const { developmentConfig } = require('./environments/development')
			return developmentConfig
		}
		case 'production': {
			const { productionConfig } = require('./environments/production')
			return productionConfig
		}
	}
}

export const config = loadConfig()

export type { AppConfig, Environment, BackendConfig, FrontendConfig, DatabaseConfig, InfraConfig } from './types'

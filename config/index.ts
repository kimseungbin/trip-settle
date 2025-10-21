/**
 * @file Main configuration entry point
 * Loads the appropriate config based on NODE_ENV
 */

import type { AppConfig, Environment } from './types'
import { localConfig } from './environments/local'
import { developmentConfig } from './environments/development'
import { productionConfig } from './environments/production'

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

	switch (environment) {
		case 'local':
			return localConfig
		case 'development':
			return developmentConfig
		case 'production':
			return productionConfig
	}
}

export const config = loadConfig()

export type { AppConfig, Environment, BackendConfig, FrontendConfig, DatabaseConfig, InfraConfig } from './types'

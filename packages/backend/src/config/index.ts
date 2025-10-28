/**
 * @file Backend-specific configuration
 * Re-exports relevant config from backend's shared config
 */

import { config as sharedConfig } from '../shared-config/index.js'

export const config = {
	environment: sharedConfig.environment,
	port: sharedConfig.backend.port,
	corsOrigin: sharedConfig.backend.corsOrigin,
	database: sharedConfig.database,
}

export type BackendConfig = typeof config

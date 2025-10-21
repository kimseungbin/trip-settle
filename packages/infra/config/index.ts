/**
 * @file Infrastructure-specific configuration
 * Re-exports relevant config from shared config
 */

import { config as sharedConfig } from '../../../config'

export const config = {
	environment: sharedConfig.environment,
	infra: sharedConfig.infra,
	database: sharedConfig.database,
}

export type InfraConfig = typeof config

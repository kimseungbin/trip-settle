/**
 * @file Frontend-specific configuration
 * Re-exports relevant config from shared config
 */

import { config as sharedConfig } from '../../../../config'

export const config = {
	environment: sharedConfig.environment,
	url: sharedConfig.frontend.url,
	apiUrl: sharedConfig.frontend.apiUrl,
	port: sharedConfig.frontend.port,
}

export type FrontendConfig = typeof config

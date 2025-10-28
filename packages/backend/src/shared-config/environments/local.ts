/**
 * @file Local development environment configuration
 * No environment variables needed - everything has safe defaults
 */

import type { AppConfig } from '../types.js'
import { PORTS, LOCAL_URLS } from '../../../../../constants.js'

export const localConfig: AppConfig = {
	environment: 'local',

	backend: {
		port: PORTS.backend,
		corsOrigin: LOCAL_URLS.frontend,
	},

	frontend: {
		url: LOCAL_URLS.frontend,
		apiUrl: LOCAL_URLS.api,
		port: PORTS.frontend,
	},

	database: {
		type: 'pg-mem',
		synchronize: true,
	},

	infra: {
		region: 'us-east-1',
		vpcCidr: '10.0.0.0/16',
		natGateways: 1,
		maxAzs: 2,
	},
}

/**
 * @file Local development environment configuration
 * No environment variables needed - everything has safe defaults
 */

import type { AppConfig } from '../types'

export const localConfig: AppConfig = {
	environment: 'local',

	backend: {
		port: 3000,
		corsOrigin: 'http://localhost:5173',
	},

	frontend: {
		url: 'http://localhost:5173',
		apiUrl: 'http://localhost:3000/api',
		port: 5173,
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

/**
 * @file Production environment configuration
 * Reads from environment variables injected by CI/CD
 * All critical values are required
 */

import type { AppConfig } from '../types'

const getRequiredEnv = (key: string): string => {
	const value = process.env[key]
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`)
	}
	return value
}

export const productionConfig: AppConfig = {
	environment: 'production',

	backend: {
		port: parseInt(getRequiredEnv('BACKEND_PORT')),
		corsOrigin: getRequiredEnv('CORS_ORIGIN'),
	},

	frontend: {
		url: getRequiredEnv('FRONTEND_URL'),
		apiUrl: getRequiredEnv('API_URL'),
		port: parseInt(getRequiredEnv('FRONTEND_PORT')),
	},

	database: {
		type: 'postgres',
		host: getRequiredEnv('DB_HOST'),
		port: parseInt(getRequiredEnv('DB_PORT')),
		username: getRequiredEnv('DB_USERNAME'),
		password: getRequiredEnv('DB_PASSWORD'),
		database: getRequiredEnv('DB_NAME'),
		synchronize: false,
	},

	infra: {
		region: getRequiredEnv('AWS_REGION'),
		vpcCidr: getRequiredEnv('VPC_CIDR'),
		natGateways: parseInt(getRequiredEnv('NAT_GATEWAYS')),
		maxAzs: parseInt(getRequiredEnv('MAX_AZS')),
	},
}

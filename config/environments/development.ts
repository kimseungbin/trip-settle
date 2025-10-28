/**
 * @file Development environment configuration
 * Reads from environment variables injected by CI/CD
 */

import type { AppConfig } from '../types.js'

const getRequiredEnv = (key: string): string => {
	const value = process.env[key]
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`)
	}
	return value
}

const getEnv = (key: string, defaultValue: string): string => {
	return process.env[key] || defaultValue
}

export const developmentConfig: AppConfig = {
	environment: 'development',

	backend: {
		port: parseInt(getEnv('BACKEND_PORT', '3000')),
		corsOrigin: getEnv('CORS_ORIGIN', '*'),
	},

	frontend: {
		url: getRequiredEnv('FRONTEND_URL'),
		apiUrl: getRequiredEnv('API_URL'),
		port: parseInt(getEnv('FRONTEND_PORT', '5173')),
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
		region: getEnv('AWS_REGION', 'us-east-1'),
		vpcCidr: getEnv('VPC_CIDR', '10.0.0.0/16'),
		natGateways: parseInt(getEnv('NAT_GATEWAYS', '1')),
		maxAzs: parseInt(getEnv('MAX_AZS', '2')),
	},
}

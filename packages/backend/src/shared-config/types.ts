/**
 * @file Shared configuration types for the monorepo
 */

export type Environment = 'local' | 'development' | 'production'

export interface DatabaseConfig {
	type: 'pg-mem' | 'postgres'
	host?: string
	port?: number
	username?: string
	password?: string
	database?: string
	synchronize?: boolean
}

export interface BackendConfig {
	port: number
	corsOrigin: string
}

export interface FrontendConfig {
	url: string
	apiUrl: string
	port: number
}

export interface InfraConfig {
	region: string
	vpcCidr: string
	natGateways: number
	maxAzs: number
}

export interface AppConfig {
	environment: Environment
	backend: BackendConfig
	frontend: FrontendConfig
	database: DatabaseConfig
	infra: InfraConfig
}

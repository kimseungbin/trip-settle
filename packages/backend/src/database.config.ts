import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { DataType, newDb } from 'pg-mem'
import { config } from './config/index.js'

let memoryDataSource: DataSource | null = null

export async function getDataSource(): Promise<DataSource | null> {
	if (config.database.type === 'pg-mem' && !memoryDataSource) {
		// Use pg-mem for in-memory PostgreSQL in local development
		const db = newDb()

		// Register missing PostgreSQL functions that TypeORM needs
		db.public.registerFunction({
			name: 'version',
			returns: DataType.text,
			implementation: () => 'PostgreSQL 15.0 (pg-mem)',
		})

		db.public.registerFunction({
			name: 'current_database',
			returns: DataType.text,
			implementation: () => 'trip_settle',
		})

		// Adapt the pg-mem database to work with TypeORM
		memoryDataSource = await db.adapters.createTypeormDataSource({
			type: 'postgres',
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: config.database.synchronize ?? true,
		})

		await memoryDataSource.initialize()
	}

	return memoryDataSource
}

export async function getDatabaseConfig(): Promise<TypeOrmModuleOptions> {
	if (config.database.type === 'pg-mem') {
		const dataSource = await getDataSource()
		return {
			...dataSource.options,
		} as TypeOrmModuleOptions
	}

	// PostgreSQL configuration for development/production
	return {
		type: 'postgres',
		host: config.database.host,
		port: config.database.port,
		username: config.database.username,
		password: config.database.password,
		database: config.database.database,
		entities: [__dirname + '/**/*.entity{.ts,.js}'],
		synchronize: config.database.synchronize ?? false,
	}
}

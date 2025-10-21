import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { DataType, newDb } from 'pg-mem'

let memoryDataSource: DataSource | null = null

export async function getDataSource(): Promise<DataSource | null> {
	const isDevelopment = process.env.NODE_ENV !== 'production'

	if (isDevelopment && !memoryDataSource) {
		// Use pg-mem for in-memory PostgreSQL in development
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
			synchronize: true,
		})

		await memoryDataSource.initialize()
	}

	return memoryDataSource
}

export async function getDatabaseConfig(): Promise<TypeOrmModuleOptions> {
	const isDevelopment = process.env.NODE_ENV !== 'production'

	if (isDevelopment) {
		const dataSource = await getDataSource()
		return {
			...dataSource.options,
		} as TypeOrmModuleOptions
	}

	// Production PostgreSQL configuration
	return {
		type: 'postgres',
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT || '5432'),
		username: process.env.DB_USERNAME || 'postgres',
		password: process.env.DB_PASSWORD || 'postgres',
		database: process.env.DB_NAME || 'trip_settle',
		entities: [__dirname + '/**/*.entity{.ts,.js}'],
		synchronize: false, // Should be false in production
	}
}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { getDatabaseConfig, getDataSource } from './database.config'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			useFactory: getDatabaseConfig,
			dataSourceFactory: async options => {
				// For pg-mem, use the pre-initialized DataSource
				const existingDataSource = await getDataSource()
				if (existingDataSource) {
					return existingDataSource
				}
				// For production PostgreSQL, create new DataSource
				const { DataSource } = await import('typeorm')
				const dataSource = new DataSource(options)
				await dataSource.initialize()
				return dataSource
			},
		}),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

import { Module, OnApplicationShutdown } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TripsModule } from '@trips/trips.module'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { ConfigModule } from '@nestjs/config'
import appConfig, { validationSchema } from '@src/configs/app.config'

@Module({
	imports: [
		ConfigModule.forRoot({
			cache: true,
			isGlobal: true,
			load: [appConfig],
			validationSchema,
		}),
		MongooseModule.forRootAsync({
			useFactory: async () => {
				try {
					const mongoMemoryServer = await AppModule.getMongoMemoryServer()
					return {
						uri: mongoMemoryServer.getUri(),
					}
				} catch (error) {
					console.error('Failed to create MongoMemoryServer:', error)
					throw error
				}
			},
		}),
		TripsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements OnApplicationShutdown {
	private static mongoMemoryServer: MongoMemoryServer

	static async getMongoMemoryServer(): Promise<MongoMemoryServer> {
		if (!this.mongoMemoryServer) {
			this.mongoMemoryServer = await MongoMemoryServer.create()
		}
		return this.mongoMemoryServer
	}

	async onApplicationShutdown() {
		await AppModule.mongoMemoryServer?.stop()
	}
}

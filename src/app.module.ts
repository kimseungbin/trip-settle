import { Module, OnApplicationShutdown } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TripsModule } from './trips/trips.module'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoMemoryServer: MongoMemoryServer

@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: async () => {
				try {
					mongoMemoryServer = await MongoMemoryServer.create()
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
	async onApplicationShutdown() {
		await mongoMemoryServer?.stop()
	}
}

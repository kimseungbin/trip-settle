import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TripsModule } from './trips/trips.module'
import { MongooseModule } from '@nestjs/mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: async () => {
				const server = await MongoMemoryServer.create()
				return {
					uri: server.getUri(),
				}
			},
		}),
		TripsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

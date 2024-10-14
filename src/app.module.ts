import { Module } from '@nestjs/common'
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
				mongoMemoryServer = await MongoMemoryServer.create()
				return {
					uri: mongoMemoryServer.getUri(),
				}
			},
		}),
		TripsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

export async function closeMongooseConnection() {
	if (mongoMemoryServer) await mongoMemoryServer.stop()
}

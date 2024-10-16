import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TripsModule } from '../src/trips/trips.module'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongooseModule } from '@nestjs/mongoose'
import { connection } from 'mongoose'

describe('Trips', () => {
	let app: INestApplication
	let mongod: MongoMemoryServer

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()

		const module = await Test.createTestingModule({
			imports: [TripsModule, MongooseModule.forRoot(mongod.getUri())],
		}).compile()

		app = module.createNestApplication()
		await app.init()
	})

	afterAll(async () => {
		await connection.close()
		await mongod.stop()
		await app.close()
	})

	it.todo('POST /trips')
	it.todo('GET /trips/:id')
	it.todo('PATCH /trips/:id')
	it.todo('DELETE /trips/:id')
})

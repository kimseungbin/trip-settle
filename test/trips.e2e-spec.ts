import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TripsModule } from '../src/trips/trips.module'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongooseModule } from '@nestjs/mongoose'
import mongoose, { connection, Types } from 'mongoose'
import { CreateTripDto } from '../src/trips/dto/create-trip.dto'
import * as request from 'supertest'

describe('Trips', () => {
	let app: INestApplication
	let mongod: MongoMemoryServer

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()

		mongoose.set('debug', true)

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

	describe('POST /trips', () => {
		it('should create a new trip', async () => {
			const createTripDto: CreateTripDto = {
				participants: ['Alice', 'Bob'],
			}

			const response = await request(app.getHttpServer()).post('/trips').send(createTripDto).expect(201)
			const locationHeader = response.header['location']
			expect(locationHeader).toMatch(/^\/trips\/[a-zA-Z0-9-_]+$/)

			const tripId = locationHeader.split('/').pop()
			const _id = new Types.ObjectId(Buffer.from(tripId, 'base64url').toString('hex'))

			const tripInDb = await connection.collection('trips').findOne({ _id })

			expect(tripInDb).not.toBeNull()
			expect(tripInDb.participants).toEqual(createTripDto.participants)
		})
	})
	it.todo('GET /trips/:id')
	it.todo('PATCH /trips/:id')
	it.todo('DELETE /trips/:id')
})

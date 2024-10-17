import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TripsModule } from '../src/trips/trips.module'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongooseModule } from '@nestjs/mongoose'
import mongoose, { connection } from 'mongoose'
import { CreateTripDto } from '../src/trips/dto/create-trip.dto'
import * as request from 'supertest'
import { TripsService } from '../src/trips/trips.service'
import { Reflector } from '@nestjs/core'

describe('Trips', () => {
	let app: INestApplication
	let mongod: MongoMemoryServer
	let tripsService: TripsService

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create()

		mongoose.set('debug', true)

		const module = await Test.createTestingModule({
			imports: [TripsModule, MongooseModule.forRoot(mongod.getUri())],
		}).compile()

		app = module.createNestApplication()
		app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
		await app.init()

		tripsService = module.get<TripsService>(TripsService)
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

			const findTripDto = await tripsService.find(tripId)

			expect(findTripDto).not.toBeNull()
			expect(findTripDto.participants).toEqual(createTripDto.participants)
		})
	})
	describe('GET /trips/:id', () => {
		it('should return a trip', async () => {
			const createTripDto: CreateTripDto = {
				participants: ['Alice', 'Bob'],
			}

			const { id } = await tripsService.create(createTripDto)

			const response = await request(app.getHttpServer()).get(`/trips/${id}`).expect(200)
			expect(response.body).toEqual({ ...createTripDto, id, expenses: [] })
		})
	})
	it.todo('PATCH /trips/:id')
	describe('DELETE /trips/:id', () => {
		it('should delete a trip', async () => {
			const createTripDto: CreateTripDto = {
				participants: ['Alice', 'Bob'],
			}

			const { id } = await tripsService.create(createTripDto)

			const response = await request(app.getHttpServer()).delete(`/trips/${id}`).expect(204)
			const locationHeader = response.header['location']
			expect(locationHeader).toEqual('/')
		})
	})
})

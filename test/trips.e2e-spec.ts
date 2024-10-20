import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TripsModule } from '@trips/trips.module'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongooseModule } from '@nestjs/mongoose'
import mongoose, { connection, Types } from 'mongoose'
import { CreateTripDto } from '@trips/dto/create-trip.dto'
import * as request from 'supertest'
import { TripsService } from '@trips/trips.service'
import { Reflector } from '@nestjs/core'
import { UpdateTripDto } from '@trips/dto/update-trip.dto'
import { CreateExpenseDto } from '@trips/dto/create-expense.dto'

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
		app.useGlobalPipes(new ValidationPipe())
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
				title: 'Summer Vacation',
				description: 'A trip to the beach with friends.',
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
		const testCases = [
			{
				createTripDto: { description: 'Test', participants: ['Alice', 'Bob'] },
				missingProperty: 'title',
				errorMessage: 'Title is required.',
			},
			{
				createTripDto: { title: 'Test', description: 'Test.' },
				missingProperty: 'participants',
				errorMessage: 'Participants is required.',
			},
		]

		test.each(testCases)(
			'should return 400 when $missingProperty is missing',
			async ({ createTripDto, errorMessage }) => {
				const response = await request(app.getHttpServer()).post('/trips').send(createTripDto).expect(400)
				expect(response.body.message).toEqual(expect.arrayContaining([errorMessage]))
			},
		)
	})
	describe('GET /trips/:id', () => {
		it('should return a trip', async () => {
			const createTripDto: CreateTripDto = {
				title: 'Summer Vacation',
				description: 'A trip to the beach with friends.',
				participants: ['Alice', 'Bob'],
			}

			const { id } = await tripsService.create(createTripDto)

			const response = await request(app.getHttpServer()).get(`/trips/${id}`).expect(200)
			expect(response.body).toEqual({ ...createTripDto, id, expenses: [] })
		})
		it('should return 404 for non-existent trip', async () => {
			const nonExistentId = Buffer.from(new Types.ObjectId().toHexString(), 'hex').toString('base64url')

			await request(app.getHttpServer()).get(`/trips/${nonExistentId}`).expect(404)
		})
		it('should properly serialize the response (exclude _id)', async () => {
			const createTripDto: CreateTripDto = {
				title: 'Summer Vacation',
				description: 'A trip to the beach with friends.',
				participants: ['Alice', 'Bob'],
			}

			const { id } = await tripsService.create(createTripDto)

			const response = await request(app.getHttpServer()).get(`/trips/${id}`).expect(200)

			expect(response.body).not.toHaveProperty('_id')
		})
	})
	describe('PATCH /trips/:id', () => {
		it('should update a trip', async () => {
			const createTripDto: CreateTripDto = {
				title: 'Summer Vacation',
				description: 'A trip to the beach with friends.',
				participants: ['Alice', 'Bob'],
			}

			const updateTripDto: UpdateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			const { id } = await tripsService.create(createTripDto)

			const response = await request(app.getHttpServer()).patch(`/trips/${id}`).send(updateTripDto).expect(204)
			const locationHeader = response.header['location']
			expect(locationHeader).toMatch(/^\/trips\/[a-zA-Z0-9-_]+$/)
		})
		it('should return 404 for non-existent trip', async () => {
			const nonExistentId = Buffer.from(new Types.ObjectId().toHexString(), 'hex').toString('base64url')

			await request(app.getHttpServer()).patch(`/trips/${nonExistentId}`).expect(404)
		})
	})
	describe('DELETE /trips/:id', () => {
		it('should delete a trip', async () => {
			const createTripDto: CreateTripDto = {
				title: 'Summer Vacation',
				description: 'A trip to the beach with friends.',
				participants: ['Alice', 'Bob'],
			}

			const { id } = await tripsService.create(createTripDto)

			await request(app.getHttpServer()).delete(`/trips/${id}`).expect(204)
		})
		it('should return 404 for non-existent trip', async () => {
			const nonExistentId = Buffer.from(new Types.ObjectId().toHexString(), 'hex').toString('base64url')

			await request(app.getHttpServer()).delete(`/trips/${nonExistentId}`).expect(404)
		})
	})
	describe('POST /trips/:id/expenses', () => {
		it('should create a new expense', async () => {
			const createTripDto: CreateTripDto = {
				title: 'Summer Vacation',
				description: 'A trip of the beach with friends.',
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			const { id } = await tripsService.create(createTripDto)

			const createExpenseDto: CreateExpenseDto = {
				amount: 270,
				currency: 'USD',
				description: 'Dinner with friends',
				participants: ['Alice', 'Bob', 'Charlie'],
				payer: 'Charlie',
			}

			const response = await request(app.getHttpServer())
				.post(`/trips/${id}/expenses`)
				.send(createExpenseDto)
				.expect(201)
		})
	})
	describe('PUT /trips/:id/expense/:id', () => {
		it.todo('should update an expense')
	})
	describe('DELETE /trips/:id/expenses/:id', () => {
		it.todo('should delete an expense')
	})
})

import { randomBytes } from 'crypto'
import { Test, TestingModule } from '@nestjs/testing'
import { TripsController } from './trips.controller'
import { TripsService } from './trips.service'
import { FindTripDto } from './dto/find-trip.dto'
import { NotFoundException } from '@nestjs/common'
import { ExpenseDto } from './dto/expense.dto'
import { CreateTripDto } from './dto/create-trip.dto'
import { Response } from 'express'
import { UpdateTripDto } from './dto/update-trip.dto'

const mockTripsService = {
	create: jest.fn(),
	find: jest.fn(),
	update: jest.fn(),
	remove: jest.fn(),
}

describe('TripsController', () => {
	let controller: TripsController
	let service: TripsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TripsController],
			providers: [
				{
					provide: TripsService,
					useValue: mockTripsService,
				},
			],
		}).compile()

		controller = module.get<TripsController>(TripsController)
		service = module.get<TripsService>(TripsService)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})

	describe('find', () => {
		it('should return a trip with a given ID', async () => {
			const base64TripId = randomBytes(16).toString('base64url')
			const participants = ['Alice', 'Bob', 'Charlie']
			const expenses: ExpenseDto[] = [
				{
					amount: 100,
					currency: 'USD',
					description: 'Dinner at a restaurant',
					note: 'Shared meal',
					participants: ['Alice', 'Bob'],
					payer: 'Alice',
				},
				{
					amount: 50,
					currency: 'USD',
					description: 'Taxi ride',
					note: 'Airport transfer',
					participants: ['Bob', 'Charlie'],
					payer: 'Bob',
				},

				{
					amount: 75,
					currency: 'EUR',
					description: 'Museum tickets',
					note: 'Entrance fees',
					participants: ['Alice', 'Charlie'],
					payer: 'Bob',
				},
			]

			const expectedTrip: FindTripDto = { id: base64TripId, participants, expenses }

			mockTripsService.find.mockReturnValue(expectedTrip)

			expect(await controller.find(base64TripId)).toEqual(expectedTrip)
			expect(service.find).toHaveBeenCalledWith(base64TripId)
		})

		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			const base64TripId = randomBytes(16).toString('base64url')

			mockTripsService.find.mockReturnValue(null)

			await expect(controller.find(base64TripId)).rejects.toThrowError(NotFoundException)

			expect(service.find).toHaveBeenCalledWith(base64TripId)
		})
	})

	describe('create', () => {
		it('should create a new trip with participants and return a Location header', async () => {
			const createTripDto: CreateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			const newTrip = { id: 'newBase64TripId', participants: ['Alice', 'Bob', 'Charlie'], expenses: [] }
			mockTripsService.create.mockReturnValue(newTrip)

			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				location: jest.fn().mockReturnThis(),
				send: jest.fn(),
			} as unknown as Response

			await controller.create(createTripDto, mockResponse)

			expect(mockResponse.status).toHaveBeenCalledWith(201)
			expect(mockResponse.location).toHaveBeenCalledWith(`/trips/${newTrip.id}`)
			expect(mockResponse.send).toHaveBeenCalled()

			expect(service.create).toHaveBeenCalledWith(createTripDto)
		})
	})

	describe('update', () => {
		it('should update participants to an existing trip.', async () => {
			const base64TripId = randomBytes(16).toString('base64url')
			const updateTripDto: UpdateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}
			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				location: jest.fn().mockReturnThis(),
				send: jest.fn(),
			} as unknown as Response

			mockTripsService.find.mockReturnValue(updateTripDto)

			await controller.update(base64TripId, updateTripDto, mockResponse)

			expect(mockResponse.status).toHaveBeenCalledWith(204)
			expect(mockResponse.location).toHaveBeenCalledWith(`/trips/${base64TripId}`)
			expect(mockResponse.send).toHaveBeenCalled()

			expect(mockTripsService.find).toHaveBeenCalledWith(base64TripId)
			expect(mockTripsService.update).toHaveBeenCalledWith(base64TripId, updateTripDto)
		})

		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			const base64TripId = randomBytes(16).toString('base64url')
			const updateTripDto: UpdateTripDto = {
				participants: ['Alice'],
			}
			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				location: jest.fn().mockReturnThis(),
				send: jest.fn(),
			} as unknown as Response

			mockTripsService.find.mockReturnValue(null)

			await expect(controller.update(base64TripId, updateTripDto, mockResponse)).rejects.toThrowError(
				NotFoundException,
			)

			expect(mockTripsService.find).toHaveBeenCalledWith(base64TripId)
		})
	})

	describe('delete', () => {
		it('should delete a trip with the given ID', async () => {
			const base64TripId = randomBytes(16).toString('base64url')
			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				location: jest.fn().mockReturnThis(),
				send: jest.fn(),
			} as unknown as Response

			mockTripsService.remove.mockReturnValue(true)

			await controller.remove(base64TripId, mockResponse)

			expect(mockResponse.status).toHaveBeenCalledWith(204)
			expect(mockResponse.location).toHaveBeenCalledWith('/trips')
			expect(mockResponse.send).toHaveBeenCalled()

			expect(mockTripsService.remove).toHaveBeenCalledWith(base64TripId)
		})

		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			const base64TripId = randomBytes(16).toString('base64url')
			const mockResponse = {
				status: jest.fn().mockReturnThis(),
				location: jest.fn().mockReturnThis(),
				send: jest.fn(),
			} as unknown as Response

			mockTripsService.remove.mockReturnValue(false)

			await expect(controller.remove(base64TripId, mockResponse)).rejects.toThrowError(NotFoundException)

			expect(mockTripsService.remove).toHaveBeenCalledWith(base64TripId)
		})
	})
})

import { Test, TestingModule } from '@nestjs/testing'
import { TripsService } from './trips.service'
import { randomBytes } from 'crypto'
import { NotFoundException } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { Trip } from './schemas/trip.schema'
import { getModelToken } from '@nestjs/mongoose'

const mockTripModel = {
	findById: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	update: jest.fn(),
	remove: jest.fn(),
}

describe('TripsService', () => {
	let service: TripsService
	let base64TripId: string

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TripsService,
				{
					provide: getModelToken(Trip.name),
					useValue: mockTripModel,
				},
			],
		}).compile()

		jest.clearAllMocks()

		service = module.get<TripsService>(TripsService)
		base64TripId = randomBytes(16).toString('base64url')
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('create', () => {
		it('should create and return a new trip entity with base64url id', async () => {
			const createTripDto: CreateTripDto = {
				participants: ['Alice', 'Bob'],
			}
			const tripEntity: Trip = {
				id: base64TripId,
				participants: ['Alice', 'Bob'],
				expenses: [],
			}

			mockTripModel.create.mockResolvedValue(tripEntity)

			const trip = await service.create(createTripDto)

			expect(trip).toEqual(tripEntity)
			expect(mockTripModel.create).toHaveBeenCalledWith(createTripDto)
		})
	})

	describe('find', () => {
		it('should return the trip object with a given ID', async () => {
			const tripEntity: Trip = {
				id: base64TripId,
				participants: ['Alice', 'Bob'],
				expenses: [],
			}

			mockTripModel.findById.mockResolvedValue(tripEntity)

			const trip = await service.find(base64TripId)

			expect(trip).toEqual(tripEntity)
			expect(mockTripModel.findById).toHaveBeenCalledWith(base64TripId)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			mockTripModel.findById.mockResolvedValue(null)

			await expect(service.find(base64TripId)).rejects.toBeInstanceOf(NotFoundException)
			expect(mockTripModel.findById).toHaveBeenCalledWith(base64TripId)
		})
	})
	describe('update', () => {
		it('should update participants to an existing trip', async () => {
			const updateTripDto: UpdateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}
			const tripEntity: Trip = {
				id: base64TripId,
				participants: ['Alice', 'Bob'],
				expenses: [],
			}
			const updatedTripEntity: Trip = {
				...tripEntity,
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			mockTripModel.findById.mockResolvedValue(tripEntity)
			mockTripModel.update.mockResolvedValue(updatedTripEntity)

			await service.update(base64TripId, updateTripDto)

			expect(mockTripModel.update).toHaveBeenCalledWith(base64TripId, updateTripDto)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			const updateTripDto: UpdateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			mockTripModel.findById.mockResolvedValue(null)

			await expect(service.update(base64TripId, updateTripDto)).rejects.toBeInstanceOf(NotFoundException)
		})
	})
	describe('delete', () => {
		it('should delete an existing trip', async () => {
			const trip: Trip = {
				id: base64TripId,
				participants: ['Alice', 'Bob'],
				expenses: [],
			}

			mockTripModel.findById.mockResolvedValue(trip)

			await service.remove(base64TripId)

			expect(mockTripModel.remove).toHaveBeenCalledWith(base64TripId)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			mockTripModel.findById.mockResolvedValue(null)

			await expect(service.remove(base64TripId)).rejects.toBeInstanceOf(NotFoundException)
			expect(mockTripModel.findById).toHaveBeenCalledWith(base64TripId)
		})
	})
})

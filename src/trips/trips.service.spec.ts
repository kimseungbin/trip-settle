import { Test, TestingModule } from '@nestjs/testing'
import { TripsService } from './trips.service'
import { NotFoundException } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { Trip } from './schemas/trip.schema'
import { getModelToken } from '@nestjs/mongoose'
import { Types } from 'mongoose'

const mockTripModel = {
	findById: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	findByIdAndUpdate: jest.fn(),
	findByIdAndDelete: jest.fn(),
}

describe('TripsService', () => {
	let service: TripsService
	let base64TripId: string
	let objectId: Types.ObjectId

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
		objectId = new Types.ObjectId()
		base64TripId = Buffer.from(objectId.toHexString(), 'hex').toString('base64url')
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
				_id: objectId,
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
				_id: objectId,
				participants: ['Alice', 'Bob'],
				expenses: [],
			}

			mockTripModel.findById.mockResolvedValue(tripEntity)

			const trip = await service.find(base64TripId)

			expect(trip).toEqual(tripEntity)
			expect(mockTripModel.findById).toHaveBeenCalledWith(objectId)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			mockTripModel.findById.mockResolvedValue(null)

			await expect(service.find(base64TripId)).rejects.toBeInstanceOf(NotFoundException)
			expect(mockTripModel.findById).toHaveBeenCalledWith(objectId)
		})
	})
	describe('update', () => {
		it('should update participants to an existing trip', async () => {
			const updateTripDto: UpdateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}
			const tripEntity: Trip = {
				_id: objectId,
				participants: ['Alice', 'Bob'],
				expenses: [],
			}
			const updatedTripEntity: Trip = {
				...tripEntity,
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			mockTripModel.findByIdAndUpdate.mockResolvedValue(updatedTripEntity)

			await service.update(base64TripId, updateTripDto)

			expect(mockTripModel.findByIdAndUpdate).toHaveBeenCalledWith(objectId, updateTripDto)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			const updateTripDto: UpdateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			mockTripModel.findByIdAndUpdate.mockResolvedValue(null)

			await expect(service.update(base64TripId, updateTripDto)).rejects.toBeInstanceOf(NotFoundException)
		})
	})
	describe('delete', () => {
		it('should delete an existing trip', async () => {
			const trip: Trip = {
				_id: objectId,
				participants: ['Alice', 'Bob'],
				expenses: [],
			}

			mockTripModel.findByIdAndDelete.mockResolvedValue(trip)

			await service.remove(base64TripId)

			expect(mockTripModel.findByIdAndDelete).toHaveBeenCalledWith(objectId)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			mockTripModel.findByIdAndDelete.mockResolvedValue(null)

			await expect(service.remove(base64TripId)).rejects.toBeInstanceOf(NotFoundException)
			expect(mockTripModel.findByIdAndDelete).toHaveBeenCalledWith(objectId)
		})
	})
})

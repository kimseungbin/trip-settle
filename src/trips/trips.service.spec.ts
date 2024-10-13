import { Test, TestingModule } from '@nestjs/testing'
import { TripsService } from './trips.service'
import { randomBytes } from 'crypto'
import { NotFoundException } from '@nestjs/common'
import { Trip } from './entities/trip.entity'
import { CreateTripDto } from './dto/create-trip.dto'

const mockTripsRepository = {
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
}

describe('TripsService', () => {
	let service: TripsService
	let base64TripId: string

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TripsService,
				{
					provide: 'TripsRepository',
					useValue: mockTripsRepository,
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

			mockTripsRepository.create.mockReturnValue(tripEntity)
			mockTripsRepository.create.mockResolvedValue(tripEntity)

			const trip = await service.create(createTripDto)

			expect(trip).toEqual(tripEntity)

			expect(mockTripsRepository.create).toHaveBeenCalledWith(createTripDto)
		})
	})

	describe('find', () => {
		it('should return the trip object with a given ID', async () => {
			const tripEntity: Trip = {
				id: base64TripId,
				participants: ['Alice', 'Bob'],
				expenses: [],
			}

			mockTripsRepository.findOne.mockResolvedValue(tripEntity)

			const trip = await service.find(base64TripId)

			expect(trip).toEqual(tripEntity)
			expect(mockTripsRepository.findOne).toHaveBeenCalledWith(base64TripId)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			mockTripsRepository.findOne.mockResolvedValue(null)

			await expect(service.find(base64TripId)).rejects.toBeInstanceOf(NotFoundException)
			expect(mockTripsRepository.findOne).toHaveBeenCalledWith(base64TripId)
		})
	})
	describe('update', () => {})
	describe('delete', () => {})
})

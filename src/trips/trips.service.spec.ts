import { Test, TestingModule } from '@nestjs/testing'
import { TripsService } from './trips.service'
import { randomBytes } from 'crypto'

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

	describe('find', () => {
		it('should return the trip object', async () => {
			const expectedTrip = {}
			mockTripsRepository.findOne.mockResolvedValue(expectedTrip)

			const trip = await service.find(base64TripId)

			expect(trip).toEqual(expectedTrip)
			expect(mockTripsRepository.findOne).toHaveBeenCalledWith(base64TripId)
		})
	})
	describe('update', () => {})
	describe('delete', () => {})
})

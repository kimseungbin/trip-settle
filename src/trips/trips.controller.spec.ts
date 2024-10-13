import { randomBytes } from 'crypto'
import { Test, TestingModule } from '@nestjs/testing'
import { TripsController } from './trips.controller'
import { TripsService } from './trips.service'
import { FindTripDto } from './dto/find-trip.dto'
import { NotFoundException } from '@nestjs/common'
import { ExpenseDto } from './dto/expense.dto'

const mockTripsService = {
	find: jest.fn(),
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
})

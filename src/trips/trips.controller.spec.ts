import { randomBytes } from 'crypto'
import { Test, TestingModule } from '@nestjs/testing'
import { TripsController } from './trips.controller'
import { TripsService } from './trips.service'

const mockTripsService = {
	find: jest.fn().mockReturnValue({}),
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
			expect(await controller.find(base64TripId)).toEqual({})
			expect(service.find).toHaveBeenCalled()
		})
	})
})

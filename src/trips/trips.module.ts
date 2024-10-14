import { Module } from '@nestjs/common'
import { TripsService } from './trips.service'
import { TripsController } from './trips.controller'

const mockTripsRepository = {
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	update: jest.fn(),
	remove: jest.fn(),
}

@Module({
	controllers: [TripsController],
	providers: [TripsService, { provide: 'TripsRepository', useValue: mockTripsRepository }],
})
export class TripsModule {}

import 'reflect-metadata'
import { FindTripDto } from './find-trip.dto'
import { plainToInstance } from 'class-transformer'

describe('FindTripDto Serialization', () => {
	it('should serialize only exposed properties', () => {
		const trip = {
			id: '123',
			participants: ['Alice'],
			expenses: [],
			additionalInfo: 'hidden',
		}

		const dto = plainToInstance(FindTripDto, trip)

		const json = JSON.parse(JSON.stringify(dto))

		expect(json).toEqual({
			id: '123',
			participants: ['Alice'],
			expenses: [],
		})
	})
})

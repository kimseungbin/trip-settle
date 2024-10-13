import { Inject, Injectable } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'

@Injectable()
export class TripsService {
	constructor(@Inject('TripsRepository') private readonly tripsRepository: any) {}

	create(createTripDto: CreateTripDto) {
		return 'This action adds a new trip'
	}

	async find(id: string) {
		const trip = await this.tripsRepository.findOne(id)

		return trip
	}

	update(id: number, updateTripDto: UpdateTripDto) {
		return `This action updates a #${id} trip`
	}

	remove(id: number) {
		return `This action removes a #${id} trip`
	}
}

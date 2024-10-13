import { Injectable } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'

@Injectable()
export class TripsService {
	create(createTripDto: CreateTripDto) {
		return 'This action adds a new trip'
	}

	find(id: string) {
		return {}
	}

	update(id: number, updateTripDto: UpdateTripDto) {
		return `This action updates a #${id} trip`
	}

	remove(id: number) {
		return `This action removes a #${id} trip`
	}
}

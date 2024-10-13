import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'

@Injectable()
export class TripsService {
	constructor(@Inject('TripsRepository') private readonly tripsRepository: any) {}

	create(createTripDto: CreateTripDto) {
		return this.tripsRepository.create(createTripDto)
	}

	async find(id: string) {
		const trip = await this.tripsRepository.findOne(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		return trip
	}

	async update(id: string, updateTripDto: UpdateTripDto): Promise<void> {
		const trip = await this.tripsRepository.findOne(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		await this.tripsRepository.update(id, updateTripDto)
	}

	async remove(id: string): Promise<void> {
		await this.tripsRepository.remove(id)
	}
}

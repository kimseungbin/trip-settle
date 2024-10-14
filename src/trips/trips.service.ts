import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { Trip } from './entities/trip.entity'

@Injectable()
export class TripsService {
	constructor(@Inject('TripsRepository') private readonly tripsRepository: any) {}

	create(createTripDto: CreateTripDto) {
		return this.tripsRepository.create(createTripDto)
	}

	async find(id: string): Promise<Trip> {
		return this.getTripById(id)
	}

	async update(id: string, updateTripDto: UpdateTripDto): Promise<void> {
		await this.getTripById(id)

		await this.tripsRepository.update(id, updateTripDto)
	}

	async remove(id: string): Promise<void> {
		await this.getTripById(id)

		await this.tripsRepository.remove(id)
	}

	private async getTripById(id: string): Promise<Trip> {
		const trip = await this.tripsRepository.findOne(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		return trip
	}
}

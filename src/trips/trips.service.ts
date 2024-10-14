import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Trip, TripDocument } from './schemas/trip.schema'

@Injectable()
export class TripsService {
	constructor(@InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>) {}

	create(createTripDto: CreateTripDto) {
		return this.tripModel.create(createTripDto)
	}

	async find(id: string): Promise<Trip> {
		const trip = await this.tripModel.findById(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		return trip
	}

	async update(id: string, updateTripDto: UpdateTripDto): Promise<void> {
		const trip = await this.tripModel.findByIdAndUpdate(id, updateTripDto)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)
	}

	async remove(id: string): Promise<void> {
		const trip = await this.tripModel.findByIdAndDelete(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)
	}
}

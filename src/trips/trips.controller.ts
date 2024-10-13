import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { FindTripDto } from './dto/find-trip.dto'

@Controller('trips')
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@Post()
	create(@Body() createTripDto: CreateTripDto) {
		return this.tripsService.create(createTripDto)
	}

	@Get(':id')
	async find(@Param('id') id: string): Promise<FindTripDto> {
		const trip = this.tripsService.find(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		return trip
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
		return this.tripsService.update(+id, updateTripDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.tripsService.remove(+id)
	}
}

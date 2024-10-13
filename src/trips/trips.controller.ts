import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'

@Controller('trips')
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@Post()
	create(@Body() createTripDto: CreateTripDto) {
		return this.tripsService.create(createTripDto)
	}

	@Get(':id')
	find() {
		return this.tripsService.find()
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

import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Res } from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { FindTripDto } from './dto/find-trip.dto'
import { Response } from 'express'

@Controller('trips')
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@Post()
	async create(@Body() createTripDto: CreateTripDto, @Res() res: Response): Promise<void> {
		const trip = await this.tripsService.create(createTripDto)
		res.status(201).location(`/trips/${trip.id}`).send()
	}

	@Get(':id')
	async find(@Param('id') id: string): Promise<FindTripDto> {
		const trip = this.tripsService.find(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		return trip
	}

	@Patch(':id')
	async update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto, @Res() res: Response): Promise<void> {
		const trip = await this.tripsService.find(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		await this.tripsService.update(id, updateTripDto)

		res.status(204).location(`/trips/${id}`).send()
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.tripsService.remove(+id)
	}
}

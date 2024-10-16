import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Res } from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { FindTripDto } from './dto/find-trip.dto'
import { Response } from 'express'

@Controller('trips')
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@Post()
	async create(@Body() createTripDto: CreateTripDto, @Res({ passthrough: true }) res: Response): Promise<void> {
		const trip = await this.tripsService.create(createTripDto)
		res.location(`/trips/${trip.id}`)
	}

	@Get(':id')
	async find(@Param('id') id: string): Promise<FindTripDto> {
		return this.getTripOrFail(id)
	}

	@Patch(':id')
	@HttpCode(204)
	async update(
		@Param('id') id: string,
		@Body() updateTripDto: UpdateTripDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		await this.getTripOrFail(id)

		await this.tripsService.update(id, updateTripDto)

		res.location(`/trips/${id}`)
	}

	@Delete(':id')
	@HttpCode(204)
	async remove(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<void> {
		await this.getTripOrFail(id)

		await this.tripsService.remove(id)

		res.location('/trips')
	}

	private async getTripOrFail(id: string): Promise<FindTripDto> {
		const trip = await this.tripsService.find(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		return trip
	}
}

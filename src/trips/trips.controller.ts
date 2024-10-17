import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Res } from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { FindTripDto } from './dto/find-trip.dto'
import { Response } from 'express'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('trips')
@ApiTags('Trips')
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new trip', description: 'Create a new trip with the provided participants.' })
	async create(@Body() createTripDto: CreateTripDto, @Res({ passthrough: true }) res: Response): Promise<void> {
		const trip = await this.tripsService.create(createTripDto)
		res.location(`/trips/${trip.id}`)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve a trip', description: 'Gets the details of a trip by its ID.' })
	async find(@Param('id') id: string): Promise<FindTripDto> {
		return this.getTripOrFail(id)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a trip', description: 'Updates an existing tip with new details.' })
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
	@ApiOperation({ summary: 'Delete a trip', description: 'Deletes a trip by its ID.' })
	@HttpCode(204)
	async remove(@Param('id') id: string): Promise<void> {
		await this.getTripOrFail(id)

		await this.tripsService.remove(id)
	}

	private async getTripOrFail(id: string): Promise<FindTripDto> {
		const trip = await this.tripsService.find(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		return trip
	}
}

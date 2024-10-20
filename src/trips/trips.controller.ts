import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Res } from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { FindTripDto } from './dto/find-trip.dto'
import { Response } from 'express'
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger'
import { CreateExpenseDto } from '@trips/dto/create-expense.dto'

@Controller('trips')
@ApiTags('Trips')
export class TripsController {
	constructor(private readonly tripsService: TripsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new trip', description: 'Create a new trip with the provided participants.' })
	@ApiCreatedResponse({
		description: 'Trip successfully created.',
		headers: {
			Location: {
				description: 'URL of the created trip',
				schema: { type: 'string' },
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Invalid input' })
	async create(@Body() createTripDto: CreateTripDto, @Res({ passthrough: true }) res: Response): Promise<void> {
		const trip = await this.tripsService.create(createTripDto)
		res.location(`/trips/${trip.id}`)
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve a trip', description: 'Gets the details of a trip by its ID.' })
	@ApiOkResponse({ description: 'Trip successfully retrieved.', type: FindTripDto })
	@ApiNotFoundResponse({ description: 'Trip not found' })
	async find(@Param('id') id: string): Promise<FindTripDto> {
		return this.getTripOrFail(id)
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a trip', description: 'Updates an existing tip with new details.' })
	@ApiNoContentResponse({
		description: 'Trip successfully updated.',
		headers: { Location: { description: 'URL of the updated trip', schema: { type: 'string' } } },
	})
	@ApiNotFoundResponse({ description: 'Trip not found' })
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
	@ApiNoContentResponse({ description: 'Trip successfully deleted.' })
	@ApiNotFoundResponse({ description: 'Trip not found' })
	@HttpCode(204)
	async remove(@Param('id') id: string): Promise<void> {
		await this.getTripOrFail(id)

		await this.tripsService.remove(id)
	}

	@Post(':id/expenses')
	@ApiOperation({ summary: 'Create an expense', description: 'Creates an expense for a trip.' })
	@ApiCreatedResponse({
		description: 'Expense successfully created.',
	})
	@ApiNotFoundResponse({ description: 'Trip not found' })
	@ApiBadRequestResponse({ description: 'Invalid input' })
	async addExpense(@Param('id') id: string, @Body() createExpenseDto: CreateExpenseDto): Promise<void> {
		await this.getTripOrFail(id)

		await this.tripsService.addExpense(id, createExpenseDto)
	}

	private async getTripOrFail(id: string): Promise<FindTripDto> {
		const trip = await this.tripsService.find(id)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		return trip
	}
}

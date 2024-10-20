import { ArrayNotEmpty, ArrayUnique, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTripDto {
	@IsNotEmpty({ message: 'Title is required.' })
	@ApiProperty({
		description: 'The title of the trip',
		minLength: 1,
		example: 'Summer Vacation',
	})
	title: string

	@IsOptional()
	@IsString()
	@ApiProperty({
		description: 'The description of the trip',
		example: 'A trip to the beach with friends.',
	})
	description?: string
	/**
	 * The list of participants involved in the trip.
	 * Participants are required and must be an array of non-empty strings, and must be unique.
	 * Example: ['Alice', 'Bob', 'Charlie']
	 */
	@IsNotEmpty({ message: 'Participants is required.' })
	@IsArray()
	@ArrayNotEmpty({ message: 'Participants are required and cannot be empty.' })
	@IsString({ each: true, message: 'Each participant must be string.' })
	@ArrayUnique({ message: 'Participants must contain unique values.' })
	@ApiProperty({
		description: 'Participants of the trip',
		minLength: 1,
		example: ['Alice', 'Bob', 'Charlie'],
		uniqueItems: true,
	})
	participants: string[]
}

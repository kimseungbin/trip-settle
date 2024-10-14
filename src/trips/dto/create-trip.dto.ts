import { ArrayNotEmpty, ArrayUnique, IsArray, IsString } from 'class-validator'

export class CreateTripDto {
	/**
	 * The list of participants involved in the trip.
	 * Participants are required and must be an array of non-empty strings, and must be unique.
	 * Example: ['Alice', 'Bob', 'Charlie']
	 */
	@IsArray()
	@ArrayNotEmpty({ message: 'Participants are required and cannot be empty.' })
	@IsString({ each: true, message: 'Each participant must be string.' })
	@ArrayUnique({ message: 'Participants must contain unique values.' })
	participants: string[]
}

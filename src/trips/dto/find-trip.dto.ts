import { ExpenseDto } from './expense.dto'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import { Exclude, Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

@Exclude()
export class FindTripDto {
	/**
	 * Unique Base64URL format ID of the trip.
	 */
	@Expose()
	@IsString()
	// todo add example, min, and max length after adding a test checking the id property's length
	@ApiProperty({
		description: 'Unique Base64URL format ID of the trip',
	})
	id: string

	/**
	 * Array of all participants in the trip.
	 */
	@Expose()
	@IsArray()
	@IsString({ each: true })
	@ApiProperty({
		description: 'Array of all participants in the trip',
		minLength: 1,
		example: ['Alice', 'Bob', 'Charlie'],
		uniqueItems: true,
	})
	participants: string[]

	/**
	 * Array of expenses associated with the trip.
	 */
	@Expose()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ExpenseDto)
	@ApiProperty({
		description: 'Array of expenses associated with the trip',
		type: [ExpenseDto],
	})
	expenses: ExpenseDto[]

	/**
	 * Creates an instance of FindTripDto.
	 * @param {Partial<FindTripDto>} partial - Partial object to initiate the DTO.
	 */
	constructor(partial: Partial<FindTripDto>) {
		Object.assign(this, partial)
	}
}

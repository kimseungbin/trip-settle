import { ExpenseDto } from './expense.dto'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class FindTripDto {
	/**
	 * Unique Base64URL format ID of the trip.
	 */
	@IsString()
	id: string

	/**
	 * Array of all participants in the trip.
	 */
	@IsArray()
	@IsString({ each: true })
	participants: string[]

	/**
	 * Array of expenses associated with the trip.
	 */
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ExpenseDto)
	expenses: ExpenseDto[]

	constructor(partial: Partial<FindTripDto>) {
		Object.assign(this, partial)
	}
}

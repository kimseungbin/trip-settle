import { ExpenseDto } from './expense.dto'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import { Exclude, Expose, Type } from 'class-transformer'

@Exclude()
export class FindTripDto {
	/**
	 * Unique Base64URL format ID of the trip.
	 */
	@Expose()
	@IsString()
	id: string

	/**
	 * Array of all participants in the trip.
	 */
	@Expose()
	@IsArray()
	@IsString({ each: true })
	participants: string[]

	/**
	 * Array of expenses associated with the trip.
	 */
	@Expose()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ExpenseDto)
	expenses: ExpenseDto[]

	/**
	 * Creates an instance of FindTripDto.
	 * @param {Partial<FindTripDto>} partial - Partial object to initiate the DTO.
	 */
	constructor(partial: Partial<FindTripDto>) {
		Object.assign(this, partial)
	}
}

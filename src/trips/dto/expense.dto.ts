import {
	ArrayMinSize,
	IsArray,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	Length,
	Matches,
	MaxLength,
	Validate,
} from 'class-validator'
import {
	AreParticipantsInTripParticipantsConstraint,
	IsPayerInTripParticipantsConstraint,
} from '../validators/expense.validators'
import { FindTripDto } from './find-trip.dto'

export class ExpenseDto {
	/**
	 * The amount of money spent for this particular expense.
	 * Example: 180 (in specified currency)
	 */
	@IsNumber()
	@IsPositive({ message: 'Amount must be a positive number.' })
	amount: number

	/**
	 * The currency in which the expense is recorded, following the ISO 4217 standard.
	 * This must be a 3-character alphabetic code.
	 * Example: "USD" for US dollars, "KRW" for Korean won.
	 * Cf.https://en.wikipedia.org/wiki/ISO_4217
	 */
	@IsString()
	@Length(3, 3, { message: 'Currency must be a 3-character ISO 4217 code.' })
	@Matches(/^[A-Z]{3}$/, { message: 'Currency must be uppercase alphabetic characters only.' })
	currency: string

	/**
	 * A short description of what the expense was for.
	 * Example: "Dinner at a restaurant" or "Taxi to the hotel"
	 */
	@IsString()
	@Length(1, 255, { message: 'Description must be between 1 and 255 characters long.' })
	description: string

	/**
	 * An optional detailed note providing more information about the expense.
	 * Example: "10% tip included"
	 */
	@IsString()
	@IsOptional()
	@MaxLength(1000, { message: 'Note must not exceed 1000 characters.' })
	note?: string

	/**
	 * A list of participants involved in the expense, who will divide the cost.
	 * Example: ["Alice", "Bob", "Charlie"]
	 */
	@IsArray()
	@ArrayMinSize(1, { message: 'At least one participant is required.' })
	@IsString({ each: true, message: 'Each participant must be a string' })
	@Validate(AreParticipantsInTripParticipantsConstraint)
	participants: string[]

	/**
	 * The person who paid for the expense.
	 * Example: "Alice"
	 */
	@IsString()
	@Validate(IsPayerInTripParticipantsConstraint)
	payer: string

	/**
	 * The list of trip-level participants for validation purposes.
	 */
	@IsArray()
	@IsOptional()
	@IsString({ each: true })
	tripParticipants?: string[]

	constructor(partial: Partial<FindTripDto>) {
		Object.assign(this, partial)
	}
}

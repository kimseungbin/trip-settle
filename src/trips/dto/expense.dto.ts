import {
	ArrayMinSize,
	ArrayUnique,
	IsArray,
	IsEnum,
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
import { ApiProperty } from '@nestjs/swagger'

/**
 * Represents the method of payment used for an expense.
 * Used to track whether expenses were paid in cash or by card.
 */
export enum PaymentMethod {
	CASH = 'cash',
	CARD = 'card',
}

export class ExpenseDto {
	/**
	 * The amount of money spent for this particular expense.
	 * Example: 180 (in specified currency)
	 */
	@IsNumber()
	@IsPositive({ message: 'Amount must be a positive number.' })
	@ApiProperty({
		description: 'The amount of money spent for this particular expense',
		minimum: 0,
		exclusiveMinimum: true,
		example: 50.0,
	})
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
	@ApiProperty({
		description: 'The currency in which the expense is recorded, following the ISO 4217 standard',
		minLength: 3,
		maxLength: 3,
		pattern: '^[A-Z]{3}$',
		example: 'USD',
	})
	currency: string

	/**
	 * A short description of what the expense was for.
	 * Example: "Dinner at a restaurant" or "Taxi to the hotel"
	 */
	@IsString()
	@Length(1, 255, { message: 'Description must be between 1 and 255 characters long.' })
	@ApiProperty({
		description: 'A short description of what the expense was for',
		minLength: 1,
		maxLength: 255,
		example: 'Dinner at a restaurant.',
	})
	description: string

	/**
	 * An optional detailed note providing more information about the expense.
	 * Example: "10% tip included"
	 */
	@IsString()
	@IsOptional()
	@MaxLength(1000, { message: 'Note must not exceed 1000 characters.' })
	@ApiProperty({
		description: 'An optional detailed note providing more information about the expense',
		maxLength: 1000,
		example: '10% tip included.',
	})
	note?: string

	/**
	 * A list of participants involved in the expense, who will divide the cost.
	 * Example: ["Alice", "Bob", "Charlie"]
	 */
	@IsArray()
	@ArrayMinSize(1, { message: 'At least one participant is required.' })
	@ArrayUnique({ message: 'Each participant must be unique.' })
	@IsString({ each: true, message: 'Each participant must be a string' })
	@Validate(AreParticipantsInTripParticipantsConstraint)
	@ApiProperty({
		description: 'A list of participants involved in the expense, who will divide the cost',
		minItems: 1,
		uniqueItems: true,
		example: ['Alice', 'Bob', 'Charlie'],
	})
	participants: string[]

	/**
	 * The person who paid for the expense.
	 * Example: "Alice"
	 */
	@IsString()
	@Length(1, 255, { message: 'Payer must be between 1 and 255 characters long.' })
	@Validate(IsPayerInTripParticipantsConstraint)
	@ApiProperty({
		description: 'The person who paid for the expense',
		minLength: 1,
		maxLength: 255,
		example: 'Alice',
	})
	payer: string

	/**
	 * The method of payment used for this expense.
	 * Example: "cash" or "card"
	 */
	@IsOptional()
	@IsString()
	@IsEnum(PaymentMethod, { message: 'Payment method must be either `cash` or `card`.' })
	@ApiProperty({
		description: 'The method of payment used for this expense',
		enum: PaymentMethod,
		example: 'cash',
		required: false,
	})
	paymentMethod?: string

	/**
	 * The list of trip-level participants for validation purposes.
	 */
	@IsArray()
	@IsOptional()
	@IsString({ each: true })
	tripParticipants?: string[]

	constructor(partial: Partial<ExpenseDto>) {
		Object.assign(this, partial)
	}
}

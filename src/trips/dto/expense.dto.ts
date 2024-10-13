import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator'

export class ExpenseDto {
	/**
	 * The amount of money spend for this particular expense.
	 * Example: 180 (in specified currency)
	 */
	@IsNumber()
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
	description: string

	/**
	 * An optional detailed note providing more information about the expense.
	 * Example: "10% tip included"
	 */
	@IsString()
	@IsOptional()
	note?: string

	/**
	 * A list of participants involved in the expense, who will divide the cost.
	 * Example: ["Alice", "Bob", "Charlie"]
	 */
	@IsArray()
	@ArrayNotEmpty()
	participants: string[]

	/**
	 * The person who paid for the expense.
	 * Example: "Alice"
	 */
	@IsString()
	payer: string
}

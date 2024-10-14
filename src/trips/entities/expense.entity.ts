export class ExpenseEntity {
	amount: number // The amount of the expense
	currency: string // Currency code (ISO 4217)
	description: string // A short description of the expense
	note?: string // Optional note about the expense
	participants: string[] // Participants who shared the expense
	payer: string // The person who paid for the expense

	constructor(partial: Partial<ExpenseEntity>) {
		Object.assign(this, partial)
	}
}

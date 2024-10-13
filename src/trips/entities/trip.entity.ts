import { ExpenseEntity } from './expense.entity'

export class Trip {
	id: string // The base64url encoded ID (used in service and controller layers)
	participants: string[] // Array of participants
	expenses: ExpenseEntity[] // Array of expenses associated with the trip

	constructor(partial: Partial<Trip>) {
		Object.assign(this, partial)
	}
}

import { ExpenseDto } from './expense.dto'

export class FindTripDto {
	id: string

	participants: string[]

	expenses: ExpenseDto[]
}

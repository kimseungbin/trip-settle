import { ExpenseDto } from './expense.dto'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class FindTripDto {
	@IsString()
	id: string

	@IsArray()
	@IsString({ each: true })
	participants: string[]

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ExpenseDto)
	expenses: ExpenseDto[]
}

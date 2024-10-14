import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class Expense {
	@Prop({ required: true })
	amount: number

	@Prop({ required: true })
	currency: string

	@Prop({ required: true })
	description: string

	@Prop({ required: false })
	note: string

	@Prop({ required: true, type: [String] })
	participants: string[]

	@Prop({ required: true })
	payer: string
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense)

import { Prop, Schema } from '@nestjs/mongoose'
import { Types } from 'mongoose'

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

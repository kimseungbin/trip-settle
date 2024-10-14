import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TripDocument = Trip & Document

@Schema()
export class Trip {
	@Prop({ required: true, type: [String] })
	participants: string[]

	@Prop({ type: [Types.ObjectId], ref: 'Expense' })
	expenses: Types.ObjectId[]
}

export const TripSchema = SchemaFactory.createForClass(Trip)

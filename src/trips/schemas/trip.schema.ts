import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, ObjectId, Types } from 'mongoose'

export type TripDocument = Trip & Document

@Schema()
export class Trip {
	_id: ObjectId

	@Prop({ required: true, type: [String] })
	participants: string[]

	@Prop({ type: [Types.ObjectId], ref: 'Expense' })
	expenses: Types.ObjectId[]
}

const TripSchema = SchemaFactory.createForClass(Trip)

// Add a virtual property for `id` that converts the `_id` to Base64URL string
TripSchema.virtual('id').get(function (this: TripDocument) {
	return Buffer.from(this._id.toString(), 'hex').toString('base64url')
})

TripSchema.set('toJSON', { virtuals: true })
TripSchema.set('toObject', { virtuals: true })

export { TripSchema }

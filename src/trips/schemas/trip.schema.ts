import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type TripDocument = HydratedDocument<Trip>

@Schema()
export class Trip {
	@Prop({ required: true, type: [String] })
	participants: string[]

	@Prop({ type: [Types.ObjectId], ref: 'Expense' })
	expenses: Types.ObjectId[]
}

const TripSchema = SchemaFactory.createForClass(Trip)

TripSchema.set('id', false)

// Add a virtual property for `id` that converts the `_id` to Base64URL string
TripSchema.virtual('id').get(function (this: TripDocument) {
	return Buffer.from(this._id.id).toString('base64url')
})

TripSchema.set('toJSON', { virtuals: true })
TripSchema.set('toObject', { virtuals: true })

export { TripSchema }

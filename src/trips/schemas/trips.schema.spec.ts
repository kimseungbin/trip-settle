import { Trip, TripDocument, TripSchema } from './trip.schema'
import { model, Model } from 'mongoose'

describe('TripSchema', () => {
	let tripModel: Model<TripDocument>
	let tripDocument: TripDocument

	beforeEach(() => {
		tripModel = model<TripDocument>('Trip', TripSchema)

		tripDocument = new tripModel()
		tripDocument.participants = ['Alice', 'Bob']
	})

	it('should generate the virtual id property as Base64URL string', () => {
		const expectedId = Buffer.from(tripDocument._id.id).toString('base64url')

		expect(tripDocument.id).toBe(expectedId)
	})
})

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Trip } from './schemas/trip.schema'
import { FindTripDto } from './dto/find-trip.dto'
import { ExpenseDto } from './dto/expense.dto'
import { Expense } from './schemas/expense.schema'

@Injectable()
export class TripsService {
	constructor(@InjectModel(Trip.name) private readonly tripModel: Model<Trip>) {}

	create(createTripDto: CreateTripDto) {
		return this.tripModel.create(createTripDto)
	}

	/**
	 * Finds a trip by its ID, populates its expenses, and returns a DTO object.
	 *
	 * @param {string} id - The base64-encoded ID of the trip to find.
	 * @return {Promise<FindTripDto>} A promise that resolves to a FindTripDto object containing the trip details and expenses.
	 * @throws {NotFoundException} If no trip with the given ID is found.
	 */
	async find(id: string): Promise<FindTripDto> {
		const trip = await this.tripModel.findById(this.convertBase64ToObjectId(id)).populate('expenses').exec()
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)

		const populatedExpenses = trip.expenses as unknown as Expense[]

		return new FindTripDto({
			...trip.toObject(),
			expenses: populatedExpenses.map(e => new ExpenseDto({ ...e })),
		})
	}

	async update(id: string, updateTripDto: UpdateTripDto): Promise<void> {
		const trip = await this.tripModel.findByIdAndUpdate(this.convertBase64ToObjectId(id), updateTripDto)
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)
	}

	async remove(id: string): Promise<void> {
		const trip = await this.tripModel.findByIdAndDelete(this.convertBase64ToObjectId(id))
		if (!trip) throw new NotFoundException(`Trip with ID ${id} not found`)
	}

	private convertBase64ToObjectId(id: string) {
		try {
			const hexId = Buffer.from(id, 'base64url').toString('hex')
			return new Types.ObjectId(hexId)
		} catch (e) {
			console.error(e)
			throw new BadRequestException(`Invalid ID format: ${id}`)
		}
	}
}

import { Test, TestingModule } from '@nestjs/testing'
import { TripsService } from './trips.service'
import { NotFoundException } from '@nestjs/common'
import { CreateTripDto } from './dto/create-trip.dto'
import { UpdateTripDto } from './dto/update-trip.dto'
import { Trip } from './schemas/trip.schema'
import { getModelToken } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { CreateExpenseDto } from '@trips/dto/create-expense.dto'
import { Expense } from '@trips/schemas/expense.schema'

const mockTripModel = {
	findById: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	findByIdAndUpdate: jest.fn(),
	findByIdAndDelete: jest.fn(),
}

const mockExpenseModel = {
	create: jest.fn(),
}

function assertTrip(trip: Trip, createTripDto: CreateTripDto) {
	expect(trip.title).toBe(createTripDto.title)
	expect(trip.description).toBe(createTripDto.description)
	expect(trip.participants).toEqual(createTripDto.participants)
	expect(trip.expenses).toEqual([])
}

describe('TripsService', () => {
	let service: TripsService
	let base64TripId: string
	let objectId: Types.ObjectId

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TripsService,
				{
					provide: getModelToken(Trip.name),
					useValue: mockTripModel,
				},
				{
					provide: getModelToken(Expense.name),
					useValue: mockExpenseModel,
				},
			],
		}).compile()

		jest.clearAllMocks()

		service = module.get<TripsService>(TripsService)
		objectId = new Types.ObjectId()
		base64TripId = Buffer.from(objectId.toHexString(), 'hex').toString('base64url')
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	const tripDocument: Trip = {
		title: 'Summer Vacation',
		description: 'A trip to the beach with friends.',
		participants: ['Alice', 'Bob'],
		expenses: [],
	}

	describe('create', () => {
		const createTripDto: CreateTripDto = {
			title: 'Summer Vacation',
			description: 'A trip to the beach with friends.',
			participants: ['Alice', 'Bob'],
		}

		it('should create and return a new trip', async () => {
			mockTripModel.create.mockReturnValue(tripDocument)

			const trip = await service.create(createTripDto)

			expect(trip).toEqual(tripDocument)
			expect(mockTripModel.create).toHaveBeenCalledWith(createTripDto)
			assertTrip(trip, createTripDto)
		})
	})

	describe('find', () => {
		it('should return the trip object with a given ID', async () => {
			const tripDocument = {
				title: 'Summer Vacation',
				description: 'A trip to the beach with friends',
				participants: ['Alice', 'Bob'],
				expenses: [],
				toObject: jest.fn().mockReturnThis(),
			} as Trip

			mockTripModel.findById.mockImplementation(() => ({
				populate: () => ({ exec: jest.fn().mockReturnValue(tripDocument) }),
			}))

			const trip = await service.find(base64TripId)

			expect(trip).toEqual(tripDocument)
			expect(mockTripModel.findById).toHaveBeenCalledWith(objectId)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			mockTripModel.findById.mockImplementation(() => ({
				populate: () => ({ exec: jest.fn().mockReturnValue(null) }),
			}))

			await expect(service.find(base64TripId)).rejects.toBeInstanceOf(NotFoundException)
			expect(mockTripModel.findById).toHaveBeenCalledWith(objectId)
		})
	})
	describe('update', () => {
		it('should update participants to an existing trip', async () => {
			const updateTripDto: UpdateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			const updatedTripEntity: Trip = {
				...tripDocument,
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			mockTripModel.findByIdAndUpdate.mockResolvedValue(updatedTripEntity)

			await service.update(base64TripId, updateTripDto)

			expect(mockTripModel.findByIdAndUpdate).toHaveBeenCalledWith(objectId, updateTripDto)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			const updateTripDto: UpdateTripDto = {
				participants: ['Alice', 'Bob', 'Charlie'],
			}

			mockTripModel.findByIdAndUpdate.mockResolvedValue(null)

			await expect(service.update(base64TripId, updateTripDto)).rejects.toBeInstanceOf(NotFoundException)
		})
	})
	describe('delete', () => {
		it('should delete an existing trip', async () => {
			mockTripModel.findByIdAndDelete.mockResolvedValue(tripDocument)

			await service.remove(base64TripId)

			expect(mockTripModel.findByIdAndDelete).toHaveBeenCalledWith(objectId)
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			mockTripModel.findByIdAndDelete.mockResolvedValue(null)

			await expect(service.remove(base64TripId)).rejects.toBeInstanceOf(NotFoundException)
			expect(mockTripModel.findByIdAndDelete).toHaveBeenCalledWith(objectId)
		})
	})
	describe('addExpense', () => {
		const createExpenseDto: CreateExpenseDto = {
			amount: 72,
			participants: ['Alice', 'Bob', 'Charlie'],
			payer: 'Alice',
			description: 'Dinner at a restaurant',
			currency: 'USD',
		}

		let mockTrip: any
		let mockExpense: any

		beforeEach(() => {
			mockTrip = {
				expenses: [],
				save: jest.fn(),
			}
			mockExpense = { _id: objectId }

			mockTripModel.findById.mockResolvedValue(mockTrip)
			mockExpenseModel.create.mockResolvedValue(mockExpense)
		})

		it('should create a new expense to the trip', async () => {
			await service.addExpense(base64TripId, createExpenseDto)

			expect(mockTripModel.findById).toHaveBeenCalledWith(objectId)
			expect(mockExpenseModel.create).toHaveBeenCalledWith(createExpenseDto)
			expect(mockTrip.expenses).toContain(mockExpense._id)
			expect(mockTrip.save).toHaveBeenCalled()
		})
		describe('with various payment methods', () => {
			const testCases = [
				{ paymentMethod: 'cash', description: 'with cash' },
				{ paymentMethod: 'card', description: 'with card' },
				{ paymentMethod: undefined, description: 'without payment method' },
			]

			test.each(testCases)('should create a new expense $description', async ({ paymentMethod }) => {
				const createExpenseDtoWithPaymentMethod = { ...createExpenseDto, paymentMethod }

				await service.addExpense(base64TripId, createExpenseDtoWithPaymentMethod)

				expect(mockTripModel.findById).toHaveBeenCalledWith(objectId)
				expect(mockExpenseModel.create).toHaveBeenCalledWith(createExpenseDtoWithPaymentMethod)
				expect(mockTrip.expenses).toContain(mockExpense._id)
			})
		})
		it('should throw NotFoundException if trip with the given ID does not exist', async () => {
			mockTripModel.findById.mockResolvedValue(null)

			await expect(service.addExpense(base64TripId, {} as unknown as CreateExpenseDto)).rejects.toBeInstanceOf(
				NotFoundException,
			)
			expect(mockTripModel.findById).toHaveBeenCalledWith(objectId)
		})
	})
})

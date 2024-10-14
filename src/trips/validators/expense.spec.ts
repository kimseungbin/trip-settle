import { AreParticipantsInTripParticipantsConstraint, IsPayerInTripParticipantsConstraint } from './expense.validators'
import { ExpenseDto } from '../dto/expense.dto'

describe('IsPayerInTripParticipantsConstraint', () => {
	let validator: IsPayerInTripParticipantsConstraint

	beforeEach(() => {
		validator = new IsPayerInTripParticipantsConstraint()
	})

	it('should return true when payer is in trip participants', () => {
		const expense: ExpenseDto = {
			tripParticipants: ['Alice', 'Bob'],
			payer: 'Alice',
			participants: [],
			amount: 100,
			currency: 'USD',
			description: 'Dinner',
		}

		const validationArguments = {
			object: expense,
		}

		const result = validator.validate('Alice', validationArguments as any)

		expect(result).toBe(true)
	})

	it('should return false when payer is not in trip participants', () => {
		const expense: ExpenseDto = {
			tripParticipants: ['Alice', 'Bob'],
			payer: 'Charlie',
			participants: [],
			amount: 100,
			currency: 'USD',
			description: 'Dinner',
		}

		const validationArguments = {
			object: expense,
		}

		const result = validator.validate('Charlie', validationArguments as any)

		expect(result).toBe(false)
	})

	it('should return true when trip participants list is empty', () => {
		const expense: ExpenseDto = {
			tripParticipants: [],
			payer: 'Charlie',
			participants: [],
			amount: 100,
			currency: 'USD',
			description: 'Dinner',
		}

		const validationArguments = {
			object: expense,
		}

		const result = validator.validate('Charlie', validationArguments as any)

		expect(result).toBe(true)
	})

	it('should return correct error message', () => {
		expect(validator.defaultMessage()).toBe('Payer must be one of the trip participants')
	})
})

describe('AreParticipantsInTripParticipantsConstraint', () => {
	let validator: AreParticipantsInTripParticipantsConstraint

	beforeEach(() => {
		validator = new AreParticipantsInTripParticipantsConstraint()
	})

	it('should return true when all participants are in trip participants', () => {
		const expense: ExpenseDto = {
			tripParticipants: ['Alice', 'Bob'],
			participants: ['Alice', 'Bob'],
			payer: 'Alice',
			amount: 100,
			currency: 'USD',
			description: 'Dinner',
		}

		const validationArguments = {
			object: expense,
		}

		const result = validator.validate(['Alice', 'Bob'], validationArguments as any)

		expect(result).toBe(true)
	})

	it('should return false when some participants are not in trip participants', () => {
		const expense: ExpenseDto = {
			tripParticipants: ['Alice', 'Bob'],
			participants: ['Alice', 'Charlie'],
			payer: 'Alice',
			amount: 100,
			currency: 'USD',
			description: 'Dinner',
		}

		const validationArguments = {
			object: expense,
		}

		const result = validator.validate(['Alice', 'Charlie'], validationArguments as any)

		expect(result).toBe(false)
	})

	it('should return true when trip participants list is empty', () => {
		const expense: ExpenseDto = {
			tripParticipants: [],
			participants: ['Alice'],
			payer: 'Alice',
			amount: 100,
			currency: 'USD',
			description: 'Dinner',
		}

		const validationArguments = {
			object: expense,
		}

		const result = validator.validate(['Alice'], validationArguments as any)

		expect(result).toBe(true)
	})

	it('should return correct error message', () => {
		expect(validator.defaultMessage()).toBe('All participants must be among the trip participants.')
	})
})

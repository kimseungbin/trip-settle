import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { ExpenseDto } from '../dto/expense.dto'

@ValidatorConstraint({ name: 'IsPayerInTripParticipants', async: false })
export class IsPayerInTripParticipantsConstraint implements ValidatorConstraintInterface {
	validate(payer: string, validationArguments?: ValidationArguments): boolean {
		const { tripParticipants } = validationArguments.object as ExpenseDto

		if (!tripParticipants || tripParticipants.length === 0) return true

		return tripParticipants.includes(payer)
	}

	defaultMessage(): string {
		return 'Payer ust be one of the trip participants'
	}
}

@ValidatorConstraint({ name: 'AreParticipantsInTripParticipants', async: false })
export class AreParticipantsInTripParticipantsConstraint implements ValidatorConstraintInterface {
	validate(participants: string[], validationArguments?: ValidationArguments): boolean {
		const { tripParticipants } = validationArguments.object as ExpenseDto

		if (!tripParticipants || tripParticipants.length === 0) return true

		return participants.every(p => tripParticipants.includes(p))
	}

	defaultMessage(): string {
		return 'All participants must be among the trip participants.'
	}
}

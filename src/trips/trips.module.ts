import { Module } from '@nestjs/common'
import { TripsService } from './trips.service'
import { TripsController } from './trips.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Trip, TripSchema } from './schemas/trip.schema'
import { Expense, ExpenseSchema } from './schemas/expense.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Trip.name, schema: TripSchema },
			{
				name: Expense.name,
				schema: ExpenseSchema,
			},
		]),
	],
	controllers: [TripsController],
	providers: [TripsService],
})
export class TripsModule {}

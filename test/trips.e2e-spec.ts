import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TripsModule } from '../src/trips/trips.module'

describe('Trips', () => {
	let app: INestApplication

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [TripsModule],
		}).compile()

		app = module.createNestApplication()
		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	it.todo('POST /trips')
	it.todo('GET /trips/:id')
	it.todo('PATCH /trips/:id')
	it.todo('DELETE /trips/:id')
})

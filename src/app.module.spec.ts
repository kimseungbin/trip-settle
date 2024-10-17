import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { getConnectionToken } from '@nestjs/mongoose'

describe('Database Connection', () => {
	let app: INestApplication

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = module.createNestApplication()
		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	it('should connect to the in-memory MongoDB', async () => {
		const connection = app.get(getConnectionToken())
		expect(connection).toBeDefined()
		expect(connection.readyState).toBe(1)
	})
})

import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { getConnectionToken } from '@nestjs/mongoose'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

describe('AppModule', () => {
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

	it('should generate valid OpenAPI Specification', () => {
		const config = new DocumentBuilder()
			.setTitle('Title')
			.setDescription('API description')
			.setVersion('1.0')
			.build()

		const document = SwaggerModule.createDocument(app, config)

		expect(document.paths['/']).toBeDefined()
		expect(Object.keys(document.components.schemas).length).toBeGreaterThan(0)
	})
})

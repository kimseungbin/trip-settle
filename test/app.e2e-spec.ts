import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule, closeMongooseConnection } from './../src/app.module'
import { Connection } from 'mongoose'
import { getConnectionToken } from '@nestjs/mongoose'

describe('AppController (e2e)', () => {
	let app: INestApplication
	let connection: Connection

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		await app.init()

		// Initialize a new MongoDB connection for each test
		connection = moduleFixture.get<Connection>(getConnectionToken())
	})

	it('/ (GET)', () => {
		return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!')
	})

	afterAll(async () => {
		try {
			await connection.close()
		} catch (error) {
			console.error('Error closing connection:', error)
		}
		try {
			await closeMongooseConnection()
		} catch (error) {
			console.error('Error closing mongoose connection:', error)
		}
		try {
			await app.close()
		} catch (error) {
			console.error('Error closing app:', error)
		}
	})
})

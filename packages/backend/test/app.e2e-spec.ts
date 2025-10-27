import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
	let app: INestApplication

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		// Apply global prefix as configured in main.ts
		app.setGlobalPrefix('api')
		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	describe('/api (GET)', () => {
		it('should return welcome message', () => {
			return request(app.getHttpServer()).get('/api').expect(200).expect('Trip Settle API')
		})

		it('should return content-type text/html', () => {
			return request(app.getHttpServer())
				.get('/api')
				.expect('Content-Type', /text\/html/)
		})
	})

	describe('/api/health (GET)', () => {
		it('should return health status', () => {
			return request(app.getHttpServer())
				.get('/api/health')
				.expect(200)
				.expect(res => {
					expect(res.body).toHaveProperty('status')
					expect(res.body).toHaveProperty('database')
					expect(res.body.status).toBe('ok')
					expect(res.body.database).toBe('ok')
				})
		})

		it('should return JSON content-type', () => {
			return request(app.getHttpServer()).get('/api/health').expect('Content-Type', /json/)
		})
	})
})

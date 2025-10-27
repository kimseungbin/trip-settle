import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AppService } from './app.service'
import { DataSource } from 'typeorm'

describe('AppService', () => {
	let service: AppService

	beforeEach(async () => {
		// Create a mock DataSource for unit testing
		const mockDataSource = {
			query: vi.fn(),
		} as unknown as DataSource

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AppService,
				{
					provide: DataSource,
					useValue: mockDataSource,
				},
			],
		}).compile()

		service = module.get<AppService>(AppService)
	})

	describe('getHello', () => {
		it('should return API welcome message', () => {
			const result = service.getHello()
			expect(result).toBe('Trip Settle API')
		})

		it('should return a non-empty string', () => {
			const result = service.getHello()
			expect(result).toBeTruthy()
			expect(typeof result).toBe('string')
		})
	})
})

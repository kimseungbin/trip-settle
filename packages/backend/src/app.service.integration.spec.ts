import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { AppService } from './app.service'
import { DataSource } from 'typeorm'

describe('AppService Integration Tests', () => {
	let service: AppService
	let mockDataSource: DataSource

	beforeEach(async () => {
		// Create a mock DataSource that simulates successful database queries
		mockDataSource = {
			query: vi.fn().mockResolvedValue([{ value: 1 }]),
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

	describe('getHealth', () => {
		it('should return healthy status when database is accessible', async () => {
			const result = await service.getHealth()

			expect(result).toHaveProperty('status')
			expect(result).toHaveProperty('database')
			expect(result.status).toBe('ok')
			expect(result.database).toBe('ok')
			expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1')
		})

		it('should return error status when database is not accessible', async () => {
			// Mock database failure
			vi.mocked(mockDataSource.query).mockRejectedValueOnce(new Error('Connection failed'))

			const result = await service.getHealth()

			expect(result.status).toBe('ok')
			expect(result.database).toBe('error')
		})
	})
})

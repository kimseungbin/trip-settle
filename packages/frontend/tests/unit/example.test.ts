import { describe, it, expect } from 'vitest'

/**
 * Example unit test demonstrating Vitest + happy-dom setup
 *
 * This test verifies that the test infrastructure is working correctly.
 * For testing Svelte components, consider using @testing-library/svelte
 * or testing business logic separately from component rendering.
 */
describe('Test Infrastructure', () => {
	it('should run tests with Vitest', () => {
		expect(true).toBe(true)
	})

	it('should have access to DOM APIs via happy-dom', () => {
		const div = document.createElement('div')
		div.textContent = 'Hello, World!'

		expect(div.textContent).toBe('Hello, World!')
		expect(document).toBeDefined()
		expect(window).toBeDefined()
	})

	it('should support modern JavaScript features', () => {
		const array = [1, 2, 3, 4, 5]
		const doubled = array.map(x => x * 2)

		expect(doubled).toEqual([2, 4, 6, 8, 10])
	})

	it('should handle async operations', async () => {
		const promise = Promise.resolve('async value')
		const result = await promise

		expect(result).toBe('async value')
	})

	it('should support localStorage via happy-dom', () => {
		localStorage.setItem('test-key', 'test-value')
		const value = localStorage.getItem('test-key')

		expect(value).toBe('test-value')

		localStorage.removeItem('test-key')
		expect(localStorage.getItem('test-key')).toBeNull()
	})
})

/**
 * Example: Testing utility functions
 *
 * Unit tests work best for pure functions and business logic.
 * This demonstrates testing a simple utility function.
 */
describe('Utility Functions', () => {
	function formatCurrency(amount: number, currency: string): string {
		return `${currency} ${amount.toFixed(2)}`
	}

	it('should format currency correctly', () => {
		expect(formatCurrency(100, 'USD')).toBe('USD 100.00')
		expect(formatCurrency(50.5, 'EUR')).toBe('EUR 50.50')
		expect(formatCurrency(0, 'GBP')).toBe('GBP 0.00')
	})

	it('should handle negative amounts', () => {
		expect(formatCurrency(-25.99, 'USD')).toBe('USD -25.99')
	})
})

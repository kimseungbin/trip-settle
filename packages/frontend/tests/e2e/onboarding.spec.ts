import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage to simulate first-time user
		await page.goto('/')
		await page.evaluate(() => localStorage.clear())
	})

	test('should show onboarding for first-time users', async ({ page }) => {
		await page.goto('/')

		// First-time users should be redirected to onboarding
		await expect(page).toHaveURL('/onboarding')
		await expect(page.getByRole('heading', { name: /welcome to trip settle/i })).toBeVisible()
	})

	test('should not show onboarding for returning users', async ({ page }) => {
		// Simulate a returning user by setting the flag before navigation
		await page.goto('/')
		await page.evaluate(() => localStorage.setItem('hasSeenOnboarding', 'true'))

		// Navigate to home page
		await page.goto('/')

		// Should stay on home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()
	})

	test('should navigate to main app when clicking "Get Started"', async ({ page }) => {
		await page.goto('/onboarding')

		// Click the "Get Started" button
		await page.getByRole('button', { name: /get started/i }).click()

		// Should navigate to home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Should mark onboarding as complete
		const hasSeenOnboarding = await page.evaluate(() => localStorage.getItem('hasSeenOnboarding'))
		expect(hasSeenOnboarding).toBe('true')
	})

	test('should support keyboard navigation - Enter to proceed', async ({ page }) => {
		await page.goto('/onboarding')

		// Focus on the "Get Started" button and press Enter
		await page.getByRole('button', { name: /get started/i }).focus()
		await page.keyboard.press('Enter')

		// Should navigate to home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()
	})

	test('should support keyboard navigation - Escape to skip', async ({ page }) => {
		await page.goto('/onboarding')

		// Press Escape to skip onboarding
		await page.keyboard.press('Escape')

		// Should navigate to home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Should mark onboarding as complete (user chose to skip)
		const hasSeenOnboarding = await page.evaluate(() => localStorage.getItem('hasSeenOnboarding'))
		expect(hasSeenOnboarding).toBe('true')
	})

	test('should display feature highlights', async ({ page }) => {
		await page.goto('/onboarding')

		// Check for feature highlights
		await expect(page.getByText(/track expenses in multiple currencies/i)).toBeVisible()
		await expect(page.getByText(/split costs among trip participants/i)).toBeVisible()
		await expect(page.getByText(/instant settlement calculations/i)).toBeVisible()
	})

	test('should be accessible with proper ARIA labels', async ({ page }) => {
		await page.goto('/onboarding')

		// Check for proper heading hierarchy
		const mainHeading = page.getByRole('heading', { level: 1, name: /welcome to trip settle/i })
		await expect(mainHeading).toBeVisible()

		// Check for proper button accessibility
		const getStartedButton = page.getByRole('button', { name: /get started/i })
		await expect(getStartedButton).toBeVisible()
		await expect(getStartedButton).toBeEnabled()

		// Check for skip link (for accessibility)
		const skipLink = page.getByRole('button', { name: /skip/i })
		await expect(skipLink).toBeVisible()
	})
})

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
		// Simulate a returning user by setting the appSettings before navigation
		await page.goto('/')
		await page.evaluate(() => {
			localStorage.setItem(
				'appSettings',
				JSON.stringify({
					features: { isOnboarded: true, currencyMode: 'multi', defaultCurrency: 'KRW' },
					system: { hasSeenKeyboardHint: false },
				})
			)
		})

		// Navigate to home page
		await page.goto('/')

		// Should stay on home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()
	})

	test('should complete onboarding with multi-currency mode', async ({ page }) => {
		await page.goto('/onboarding')

		// Click the "Multiple Currencies" button
		await page.getByRole('button', { name: /multiple currencies/i }).click()

		// Should navigate to home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Should mark onboarding as complete with multi-currency mode
		const appSettings = await page.evaluate(() => localStorage.getItem('appSettings'))
		const settings = JSON.parse(appSettings!)
		expect(settings.features.isOnboarded).toBe(true)
		expect(settings.features.currencyMode).toBe('multi')
	})

	test('should complete onboarding with single-currency mode', async ({ page }) => {
		await page.goto('/onboarding')

		// Click the "Single Currency" button
		await page.getByRole('button', { name: /single currency/i }).click()

		// Should show currency selector
		await expect(page.getByRole('heading', { name: /choose your currency/i })).toBeVisible()

		// Click Continue button
		await page.getByRole('button', { name: /continue/i }).click()

		// Should navigate to home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Should mark onboarding as complete with single-currency mode
		const appSettings = await page.evaluate(() => localStorage.getItem('appSettings'))
		const settings = JSON.parse(appSettings!)
		expect(settings.features.isOnboarded).toBe(true)
		expect(settings.features.currencyMode).toBe('single')
	})

	test('should support keyboard navigation - Enter to proceed', async ({ page }) => {
		await page.goto('/onboarding')

		// Navigate to multi-currency button and press Enter
		await page.getByRole('button', { name: /multiple currencies/i }).focus()
		await page.keyboard.press('Enter')

		// Should navigate to home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()
	})

	test('should support keyboard navigation - Escape to skip', async ({ page }) => {
		await page.goto('/onboarding')

		// Press Escape to skip onboarding
		await page.keyboard.press('Escape')

		// Should navigate to home page (skip uses multi-currency mode)
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Should mark onboarding as complete with multi-currency mode (default)
		const appSettings = await page.evaluate(() => localStorage.getItem('appSettings'))
		const settings = JSON.parse(appSettings!)
		expect(settings.features.isOnboarded).toBe(true)
		expect(settings.features.currencyMode).toBe('multi')
	})

	test('should display currency mode options', async ({ page }) => {
		await page.goto('/onboarding')

		// Check for currency mode options
		await expect(page.getByText(/single currency/i)).toBeVisible()
		await expect(page.getByText(/multiple currencies/i)).toBeVisible()
		await expect(page.getByText(/all expenses in one currency/i)).toBeVisible()
		await expect(page.getByText(/track expenses in different currencies/i)).toBeVisible()
	})

	test('should be accessible with proper ARIA labels', async ({ page }) => {
		await page.goto('/onboarding')

		// Check for proper heading hierarchy
		const mainHeading = page.getByRole('heading', { level: 1, name: /welcome to trip settle/i })
		await expect(mainHeading).toBeVisible()

		// Check for proper button accessibility
		const singleCurrencyButton = page.getByRole('button', { name: /single currency/i })
		await expect(singleCurrencyButton).toBeVisible()
		await expect(singleCurrencyButton).toBeEnabled()

		const multiCurrencyButton = page.getByRole('button', { name: /multiple currencies/i })
		await expect(multiCurrencyButton).toBeVisible()
		await expect(multiCurrencyButton).toBeEnabled()

		// Check for skip link (for accessibility)
		const skipLink = page.getByRole('button', { name: /skip/i })
		await expect(skipLink).toBeVisible()
	})
})

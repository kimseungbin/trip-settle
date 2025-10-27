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
		await expect(page.getByRole('heading', { name: /trip settle/i })).toBeVisible()
	})

	test('should not show onboarding for returning users', async ({ page }) => {
		// Simulate a returning user by setting the appSettings before navigation
		await page.goto('/')
		await page.evaluate(() => {
			localStorage.setItem(
				'appSettings',
				JSON.stringify({
					features: {
						isOnboarded: true,
						currencyMode: 'multi',
						defaultCurrency: 'KRW',
						paymentMode: 'single',
						payers: [],
					},
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

		// Should show payment mode selection
		await expect(page.getByRole('heading', { name: 'Payment Mode', exact: true })).toBeVisible()

		// Click "Single Payer" to complete onboarding
		await page.getByRole('button', { name: /single payer/i }).click()

		// Should navigate to home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Should mark onboarding as complete with multi-currency mode
		const appSettings = await page.evaluate(() => localStorage.getItem('appSettings'))
		const settings = JSON.parse(appSettings!)
		expect(settings.features.isOnboarded).toBe(true)
		expect(settings.features.currencyMode).toBe('multi')
		expect(settings.features.paymentMode).toBe('single')
	})

	test('should complete onboarding with single-currency mode', async ({ page }) => {
		await page.goto('/onboarding')

		// Click the "Single Currency" button
		await page.getByRole('button', { name: /single currency/i }).click()

		// Should show currency selector
		await expect(page.getByRole('heading', { name: /choose your currency/i })).toBeVisible()

		// Select a currency (will auto-complete, no Continue button needed)
		// Click on a currency option in the dropdown (it opens automatically with initialOpen=true)
		await page.getByRole('option', { name: /KRW/ }).click()

		// Should show payment mode selection
		await expect(page.getByRole('heading', { name: 'Payment Mode', exact: true })).toBeVisible()

		// Click "Single Payer" to complete onboarding
		await page.getByRole('button', { name: /single payer/i }).click()

		// Should navigate to home page automatically after payment mode selection
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Should mark onboarding as complete with single-currency mode
		const appSettings = await page.evaluate(() => localStorage.getItem('appSettings'))
		const settings = JSON.parse(appSettings!)
		expect(settings.features.isOnboarded).toBe(true)
		expect(settings.features.currencyMode).toBe('single')
		expect(settings.features.paymentMode).toBe('single')
	})

	test('should support keyboard navigation - Enter on multi-currency button', async ({ page }) => {
		await page.goto('/onboarding')

		// Navigate to multi-currency button and press Enter
		await page.getByRole('button', { name: /multiple currencies/i }).focus()
		await page.keyboard.press('Enter')

		// Should show payment mode selection
		await expect(page.getByRole('heading', { name: 'Payment Mode', exact: true })).toBeVisible()

		// Navigate to single-payer button and press Enter
		await page.getByRole('button', { name: /single payer/i }).focus()
		await page.keyboard.press('Enter')

		// Should navigate to home page
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Verify settings
		const appSettings = await page.evaluate(() => localStorage.getItem('appSettings'))
		const settings = JSON.parse(appSettings!)
		expect(settings.features.isOnboarded).toBe(true)
		expect(settings.features.currencyMode).toBe('multi')
		expect(settings.features.paymentMode).toBe('single')
	})

	test('should support keyboard navigation - Enter on single-currency button', async ({ page }) => {
		await page.goto('/onboarding')

		// Navigate to single-currency button and press Enter
		await page.getByRole('button', { name: /single currency/i }).focus()
		await page.keyboard.press('Enter')

		// Should show currency selector
		await expect(page.getByRole('heading', { name: /choose your currency/i })).toBeVisible()

		// Select currency with keyboard (auto-completes, no Continue button)
		await page.getByRole('option', { name: /KRW/ }).click()

		// Should show payment mode selection
		await expect(page.getByRole('heading', { name: 'Payment Mode', exact: true })).toBeVisible()

		// Navigate to single-payer button and press Enter
		await page.getByRole('button', { name: /single payer/i }).focus()
		await page.keyboard.press('Enter')

		// Should navigate to home page automatically
		await expect(page).toHaveURL('/')

		// Verify settings
		const appSettings = await page.evaluate(() => localStorage.getItem('appSettings'))
		const settings = JSON.parse(appSettings!)
		expect(settings.features.isOnboarded).toBe(true)
		expect(settings.features.currencyMode).toBe('single')
		expect(settings.features.paymentMode).toBe('single')
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

	test('should have visible focus on first currency option when page loads', async ({ page }) => {
		await page.goto('/onboarding')

		// The first currency option (Single Currency button) should have focus immediately
		const singleCurrencyButton = page.getByRole('button', { name: /single currency/i })
		await expect(singleCurrencyButton).toBeFocused()
	})

	test('should support Tab navigation between currency options', async ({ page }) => {
		await page.goto('/onboarding')

		// First button should have initial focus
		const singleCurrencyButton = page.getByRole('button', { name: /single currency/i })
		const multiCurrencyButton = page.getByRole('button', { name: /multiple currencies/i })

		// Verify initial focus
		await expect(singleCurrencyButton).toBeFocused()

		// Press Tab to move to next option
		await page.keyboard.press('Tab')
		await expect(multiCurrencyButton).toBeFocused()

		// Press Tab again to move to skip button
		await page.keyboard.press('Tab')
		const skipButton = page.getByRole('button', { name: /skip/i })
		await expect(skipButton).toBeFocused()
	})

	test('should display currency mode options', async ({ page }) => {
		await page.goto('/onboarding')

		// Check for currency mode options (inside buttons)
		await expect(page.getByRole('button', { name: /single currency/i })).toBeVisible()
		await expect(page.getByRole('button', { name: /multiple currencies/i })).toBeVisible()
		// Descriptions are now hidden by default on mobile, shown via "Show more" button
		// Just verify the mode titles are visible
	})

	test('should be accessible with proper ARIA labels', async ({ page }) => {
		await page.goto('/onboarding')

		// Check for proper heading hierarchy (updated text)
		const mainHeading = page.getByRole('heading', { level: 1, name: /trip settle/i })
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

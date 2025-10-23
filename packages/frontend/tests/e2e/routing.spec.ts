import { test, expect } from '@playwright/test'

test.describe('Client-side Routing', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage to ensure clean state
		await page.goto('/')
		await page.evaluate(() => localStorage.clear())
	})

	test('should navigate to home page by default', async ({ page }) => {
		// Set returning user flag BEFORE navigating to prevent onboarding redirect
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

		// Navigate again - now settings are loaded before onMount check
		await page.goto('/')

		// Should show the main expense tracker
		await expect(page.locator('h1')).toContainText('Trip Settle')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()
	})

	test('should navigate to onboarding page via URL', async ({ page }) => {
		await page.goto('/onboarding')

		// Should show onboarding content
		await expect(page.getByRole('heading', { name: /welcome to trip settle/i })).toBeVisible()
		await expect(page.getByText(/expense settlement made easy/i)).toBeVisible()
	})

	test('should navigate between pages using navigate function', async ({ page }) => {
		await page.goto('/')

		// Navigate to onboarding programmatically (simulate button click)
		await page.evaluate(() => {
			// @ts-expect-error - accessing window router for testing
			window.__navigate?.('/onboarding')
		})

		// Should show onboarding
		await expect(page).toHaveURL('/onboarding')
		await expect(page.getByRole('heading', { name: /welcome to trip settle/i })).toBeVisible()

		// Navigate back to home
		await page.evaluate(() => {
			// @ts-expect-error - accessing window router for testing
			window.__navigate?.('/')
		})

		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()
	})

	test('should handle browser back/forward buttons', async ({ page }) => {
		await page.goto('/')
		await page.goto('/onboarding')

		// Should be on onboarding page
		await expect(page).toHaveURL('/onboarding')

		// Click browser back button
		await page.goBack()
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()

		// Click browser forward button
		await page.goForward()
		await expect(page).toHaveURL('/onboarding')
		await expect(page.getByRole('heading', { name: /welcome to trip settle/i })).toBeVisible()
	})

	test('should persist route on page refresh', async ({ page }) => {
		await page.goto('/onboarding')

		// Refresh the page
		await page.reload()

		// Should still be on onboarding page
		await expect(page).toHaveURL('/onboarding')
		await expect(page.getByRole('heading', { name: /welcome to trip settle/i })).toBeVisible()
	})

	test('should handle 404 for unknown routes', async ({ page }) => {
		await page.goto('/unknown-route')

		// Should redirect to home or show 404 message
		// For now, let's redirect to home as the simplest approach
		await expect(page).toHaveURL('/')
		await expect(page.getByRole('heading', { name: 'Track Your Expenses' })).toBeVisible()
	})
})

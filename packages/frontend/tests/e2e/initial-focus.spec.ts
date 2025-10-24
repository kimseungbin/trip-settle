import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Parameterized tests for initial page focus across all routes
 *
 * This test suite ensures that every page in the application has a clearly
 * focused element when it loads, improving keyboard navigation accessibility.
 */

/**
 * Test case definition for initial focus testing
 */
interface InitialFocusTestCase {
	route: string
	description: string
	getElement: (page: Page) => Locator
	setupStorage: (page: Page) => Promise<void>
}

/**
 * Test cases for initial focus verification across all routes
 */
const initialFocusTests: InitialFocusTestCase[] = [
	{
		route: '/onboarding',
		description: 'Onboarding page focuses first currency mode button',
		getElement: (page: Page) => page.getByRole('button', { name: /single currency/i }),
		setupStorage: async (page: Page) => {
			// Clear localStorage for first-time user experience
			await page.evaluate(() => localStorage.clear())
		},
	},
	{
		route: '/',
		description: 'Home page focuses expense name input',
		getElement: (page: Page) => page.getByPlaceholder('Expense name'),
		setupStorage: async (page: Page) => {
			// Set up localStorage to indicate completed onboarding
			await page.evaluate(() => {
				const settings = {
					features: {
						isOnboarded: true,
						currencyMode: 'multi',
						defaultCurrency: 'USD',
					},
					system: {
						hasSeenKeyboardHint: false,
					},
				}
				localStorage.setItem('appSettings', JSON.stringify(settings))
			})
		},
	},
]

test.describe('Initial Focus Accessibility', () => {
	/**
	 * Parameterized tests: Verify initial focus on each page
	 *
	 * These tests navigate to each route and verify that the expected element
	 * has focus immediately after page load. This ensures keyboard users can
	 * start interacting without needing to click first.
	 */
	for (const testCase of initialFocusTests) {
		test(testCase.description, async ({ page }) => {
			// Navigate to home to access localStorage
			await page.goto('/')

			// Set up storage state for the test
			await testCase.setupStorage(page)

			// Navigate to the route
			await page.goto(testCase.route)

			// Wait for page to load (use network idle to ensure all components mounted)
			await page.waitForLoadState('networkidle')

			// Get the element that should have focus
			const element = testCase.getElement(page)

			// Assert the element has focus
			await expect(element).toBeFocused()
		})
	}
})

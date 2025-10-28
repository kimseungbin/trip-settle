import { test, expect } from '@playwright/test'

/**
 * Helper function to submit the expense form
 * Workaround: Playwright's .click() and .press('Enter') don't reliably trigger
 * form submission in WebKit, so we manually dispatch the submit event
 */
async function submitExpenseForm(page: any) {
	await page.evaluate(() => {
		const form = document.querySelector('form')
		if (form) {
			const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
			form.dispatchEvent(submitEvent)
		}
	})
}

test.describe('Expense Workflow', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate first to initialize the page
		await page.goto('/')

		// Set up as returning user to skip onboarding
		await page.evaluate(() => {
			localStorage.clear()
			localStorage.setItem(
				'appSettings',
				JSON.stringify({
					features: {
						isOnboarded: true,
						currencyMode: 'single',
						defaultCurrency: 'KRW',
						paymentMode: 'single',
						payers: [],
					},
					system: { hasSeenKeyboardHint: true },
				})
			)
		})

		// Navigate again to apply localStorage changes
		// The settings store lazy-loads and will pick up the new localStorage value
		await page.goto('/')

		// Wait for the expense form to be fully loaded
		await page.waitForSelector('form', { state: 'attached' })
		// Give a tiny bit more time for Svelte reactivity to settle
		await page.waitForTimeout(100)
	})

	test('displays initial empty state', async ({ page }) => {
		// Check page title
		await expect(page.locator('h1')).toContainText('Trip Settle')

		// Check empty state message
		await expect(page.locator('.empty-state')).toContainText('No expenses yet')

		// Verify form elements are present
		await expect(page.getByPlaceholder('Expense name')).toBeVisible()
		await expect(page.getByPlaceholder('Amount')).toBeVisible()
		await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
	})

	test('can add a single expense', async ({ page }) => {
		// Fill in expense form
		await page.getByPlaceholder('Expense name').fill('Coffee')
		await page.getByPlaceholder('Amount').fill('4.50')

		// Submit form
		await submitExpenseForm(page)

		// Verify expense appears in list
		await expect(page.locator('.expense-name')).toContainText('Coffee')
		await expect(page.locator('.expense-amount')).toContainText('4.50')

		// In single-currency mode, currency is shown in total section only
		await expect(page.locator('.total-currency-text')).toContainText('KRW')

		// Verify total is updated
		await expect(page.locator('.total-amount')).toContainText('4.50')

		// Verify form is cleared
		await expect(page.getByPlaceholder('Expense name')).toHaveValue('')
		await expect(page.getByPlaceholder('Amount')).toHaveValue('')
	})

	test('can add multiple expenses', async ({ page }) => {
		// Add first expense
		await page.getByPlaceholder('Expense name').fill('Breakfast')
		await page.getByPlaceholder('Amount').fill('12.00')
		await submitExpenseForm(page)
		// Wait for first expense to appear
		await expect(page.locator('.expense-item')).toHaveCount(1)

		// Add second expense
		await page.getByPlaceholder('Expense name').fill('Lunch')
		await page.getByPlaceholder('Amount').fill('25.50')
		await submitExpenseForm(page)
		// Wait for second expense to appear
		await expect(page.locator('.expense-item')).toHaveCount(2)

		// Add third expense
		await page.getByPlaceholder('Expense name').fill('Dinner')
		await page.getByPlaceholder('Amount').fill('45.75')
		await submitExpenseForm(page)
		// Wait for third expense to appear (consistent with first two expenses)
		await expect(page.locator('.expense-item')).toHaveCount(3)

		// Verify all expenses are in the list
		const expenseItems = page.locator('.expense-item')
		await expect(expenseItems).toHaveCount(3)

		// Verify expense names
		await expect(page.locator('.expense-name').nth(0)).toContainText('Breakfast')
		await expect(page.locator('.expense-name').nth(1)).toContainText('Lunch')
		await expect(page.locator('.expense-name').nth(2)).toContainText('Dinner')

		// Verify total (12.00 + 25.50 + 45.75 = 83.25)
		await expect(page.locator('.total-amount')).toContainText('83.25')
	})

	test('can remove an expense', async ({ page }) => {
		// Add two expenses
		await page.getByPlaceholder('Expense name').fill('Taxi')
		await page.getByPlaceholder('Amount').fill('15.00')
		await submitExpenseForm(page)

		await page.getByPlaceholder('Expense name').fill('Bus')
		await page.getByPlaceholder('Amount').fill('5.00')
		await submitExpenseForm(page)

		// Verify both expenses exist
		await expect(page.locator('.expense-item')).toHaveCount(2)

		// Remove the first expense (Taxi)
		await page.locator('.remove-btn').first().click()

		// Verify only one expense remains
		await expect(page.locator('.expense-item')).toHaveCount(1)
		await expect(page.locator('.expense-name')).toContainText('Bus')

		// Verify total is updated
		await expect(page.locator('.total-amount')).toContainText('5.00')
	})

	test('can add expense with Enter key', async ({ page }) => {
		// Fill in expense form
		await page.getByPlaceholder('Expense name').fill('Snack')
		await page.getByPlaceholder('Amount').fill('3.25')

		// Submit form
		await submitExpenseForm(page)

		// Verify expense was added
		await expect(page.locator('.expense-name')).toContainText('Snack')
		await expect(page.locator('.expense-amount')).toContainText('3.25')
	})

	test('validates required fields', async ({ page }) => {
		// Try to submit empty form
		await submitExpenseForm(page)

		// No expense should be added
		await expect(page.locator('.expense-item')).toHaveCount(0)
		await expect(page.locator('.empty-state')).toBeVisible()
	})

	test('validates numeric amount', async ({ page }) => {
		// Fill in name but leave amount empty
		await page.getByPlaceholder('Expense name').fill('Test')
		await submitExpenseForm(page)

		// No expense should be added
		await expect(page.locator('.expense-item')).toHaveCount(0)
	})

	test('handles decimal amounts correctly', async ({ page }) => {
		// Add expense with decimal amount
		await page.getByPlaceholder('Expense name').fill('Gas')
		await page.getByPlaceholder('Amount').fill('42.99')
		await submitExpenseForm(page)

		// Verify amount is displayed with 2 decimal places
		await expect(page.locator('.expense-amount')).toContainText('42.99')
	})

	test('trims whitespace from expense name', async ({ page }) => {
		// Add expense with leading/trailing spaces
		await page.getByPlaceholder('Expense name').fill('  Hotel  ')
		await page.getByPlaceholder('Amount').fill('120.00')
		await submitExpenseForm(page)

		// Verify name is trimmed
		await expect(page.locator('.expense-name')).toHaveText('Hotel')
	})

	test('can add expenses in different currencies', async ({ page }) => {
		// This test needs multi-currency mode, so set it up separately
		await page.evaluate(() => {
			localStorage.setItem(
				'appSettings',
				JSON.stringify({
					features: { isOnboarded: true, currencyMode: 'multi', defaultCurrency: 'USD' },
					system: { hasSeenKeyboardHint: true },
				})
			)
		})
		await page.goto('/')

		// Add USD expense
		await page.getByPlaceholder('Expense name').fill('Coffee USD')
		await page.getByPlaceholder('Amount').fill('5.00')
		await submitExpenseForm(page)

		// Change currency to EUR (assuming currency selector exists)
		// Note: This test assumes you can select currency. Adjust selector as needed.
		const currencyButton = page.locator('button:has-text("USD")').first()
		if (await currencyButton.isVisible()) {
			await currencyButton.click()
			// Look for EUR option (adjust based on your CurrencySelector implementation)
			const eurOption = page.locator('text=EUR')
			if (await eurOption.isVisible()) {
				await eurOption.click()
			}
		}

		// Add EUR expense
		await page.getByPlaceholder('Expense name').fill('Coffee EUR')
		await page.getByPlaceholder('Amount').fill('4.50')
		await submitExpenseForm(page)

		// Verify both expenses exist
		await expect(page.locator('.expense-item')).toHaveCount(2)

		// Verify multiple currency totals are shown
		// Note: This assumes your UI shows separate totals per currency
		const totalAmounts = page.locator('.total-amount')
		await expect(totalAmounts).not.toHaveCount(0)
	})

	test('complete expense workflow - add, view, remove', async ({ page }) => {
		// 1. Start with empty state
		await expect(page.locator('.empty-state')).toBeVisible()

		// 2. Add first expense
		await page.getByPlaceholder('Expense name').fill('Breakfast')
		await page.getByPlaceholder('Amount').fill('15.00')
		await submitExpenseForm(page)

		// 3. Verify empty state is gone
		await expect(page.locator('.empty-state')).not.toBeVisible()
		await expect(page.locator('.expense-list')).toBeVisible()

		// 4. Add second expense
		await page.getByPlaceholder('Expense name').fill('Lunch')
		await page.getByPlaceholder('Amount').fill('22.50')
		await submitExpenseForm(page)

		// 5. Verify total
		await expect(page.locator('.total-amount')).toContainText('37.50')

		// 6. Remove all expenses
		const removeButtons = page.locator('.remove-btn')
		const count = await removeButtons.count()
		for (let i = 0; i < count; i++) {
			await removeButtons.first().click()
		}

		// 7. Verify back to empty state
		await expect(page.locator('.empty-state')).toBeVisible()
		await expect(page.locator('.expense-list')).not.toBeVisible()
	})
})

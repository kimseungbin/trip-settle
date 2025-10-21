import { test, expect } from '@playwright/test'

/**
 * Visual Regression Tests
 *
 * These tests take screenshots and compare them to baseline images.
 * If the UI changes unexpectedly, the tests will fail and show a diff.
 *
 * First run: Creates baseline screenshots
 * Subsequent runs: Compares against baseline
 *
 * To update baselines: npm run test:e2e -- --update-snapshots
 */

test.describe('Visual Regression', () => {
	test('initial empty state', async ({ page }) => {
		await page.goto('/')

		// Wait for page to be fully loaded
		await page.waitForLoadState('networkidle')

		// Take screenshot of entire page
		await expect(page).toHaveScreenshot('empty-state.png', {
			fullPage: true,
		})
	})

	test('expense form UI', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Screenshot just the form section
		const form = page.locator('.form-container')
		await expect(form).toHaveScreenshot('expense-form.png')
	})

	test('expense list with single item', async ({ page }) => {
		await page.goto('/')

		// Add one expense
		await page.getByPlaceholder('Expense name').fill('Coffee')
		await page.getByPlaceholder('Amount').fill('4.50')
		await page.getByRole('button', { name: 'Add' }).click()

		// Wait for expense to appear
		await page.waitForSelector('.expense-item')

		// Screenshot the entire page with one expense
		await expect(page).toHaveScreenshot('single-expense.png', {
			fullPage: true,
		})
	})

	test('expense list with multiple items', async ({ page }) => {
		await page.goto('/')

		// Add multiple expenses
		const expenses = [
			{ name: 'Breakfast', amount: '12.50' },
			{ name: 'Lunch', amount: '18.75' },
			{ name: 'Dinner', amount: '32.00' },
		]

		for (const expense of expenses) {
			await page.getByPlaceholder('Expense name').fill(expense.name)
			await page.getByPlaceholder('Amount').fill(expense.amount)
			await page.getByRole('button', { name: 'Add' }).click()
		}

		// Wait for all expenses to render
		await expect(page.locator('.expense-item')).toHaveCount(3)

		// Screenshot the list
		await expect(page).toHaveScreenshot('multiple-expenses.png', {
			fullPage: true,
		})
	})

	test('total calculation display', async ({ page }) => {
		await page.goto('/')

		// Add expenses
		await page.getByPlaceholder('Expense name').fill('Item 1')
		await page.getByPlaceholder('Amount').fill('100.00')
		await page.getByRole('button', { name: 'Add' }).click()

		await page.getByPlaceholder('Expense name').fill('Item 2')
		await page.getByPlaceholder('Amount').fill('50.50')
		await page.getByRole('button', { name: 'Add' }).click()

		// Wait for total to update
		await expect(page.locator('.total-amount')).toContainText('150.50')

		// Screenshot just the total section
		const total = page.locator('.total')
		await expect(total).toHaveScreenshot('expense-total.png')
	})

	test('expense list item hover state', async ({ page }) => {
		await page.goto('/')

		// Add an expense
		await page.getByPlaceholder('Expense name').fill('Test Expense')
		await page.getByPlaceholder('Amount').fill('25.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Hover over the expense item
		const expenseItem = page.locator('.expense-item').first()
		await expenseItem.hover()

		// Screenshot the hovered item
		await expect(expenseItem).toHaveScreenshot('expense-item-hover.png')
	})

	test('remove button visibility', async ({ page }) => {
		await page.goto('/')

		// Add an expense
		await page.getByPlaceholder('Expense name').fill('Test')
		await page.getByPlaceholder('Amount').fill('10.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Screenshot the expense item with remove button
		const expenseItem = page.locator('.expense-item').first()
		await expect(expenseItem).toHaveScreenshot('expense-item-with-remove.png')
	})
})

test.describe('Visual Regression - Mobile', () => {
	test.use({
		viewport: { width: 375, height: 667 }, // iPhone SE size
	})

	test('mobile empty state', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		await expect(page).toHaveScreenshot('mobile-empty-state.png', {
			fullPage: true,
		})
	})

	test('mobile expense form', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const form = page.locator('.form-container')
		await expect(form).toHaveScreenshot('mobile-expense-form.png')
	})

	test('mobile expense list', async ({ page }) => {
		await page.goto('/')

		// Add expenses
		await page.getByPlaceholder('Expense name').fill('Coffee')
		await page.getByPlaceholder('Amount').fill('4.50')
		await page.getByRole('button', { name: 'Add' }).click()

		await page.getByPlaceholder('Expense name').fill('Lunch')
		await page.getByPlaceholder('Amount').fill('12.00')
		await page.getByRole('button', { name: 'Add' }).click()

		await expect(page).toHaveScreenshot('mobile-expense-list.png', {
			fullPage: true,
		})
	})
})

test.describe('Visual Regression - Responsive Breakpoints', () => {
	const viewports = [
		{ name: 'mobile', width: 375, height: 667 },
		{ name: 'tablet', width: 768, height: 1024 },
		{ name: 'desktop', width: 1280, height: 720 },
	]

	for (const { name, width, height } of viewports) {
		test(`responsive layout - ${name}`, async ({ page }) => {
			await page.setViewportSize({ width, height })
			await page.goto('/')

			// Add sample data
			await page.getByPlaceholder('Expense name').fill('Sample')
			await page.getByPlaceholder('Amount').fill('10.00')
			await page.getByRole('button', { name: 'Add' }).click()

			await expect(page).toHaveScreenshot(`responsive-${name}.png`, {
				fullPage: true,
			})
		})
	}
})

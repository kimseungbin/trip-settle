import { expect, test } from '@playwright/test'

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
 *
 * PHASED ROLLOUT STRATEGY:
 * Phase 1 (Current): Empty state only - validate workflow
 * Phase 2: Add form + single expense tests
 * Phase 3: Add multiple expenses + interactions
 * Phase 4: Add mobile + responsive tests
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

	// PHASE 2: Uncomment to enable form UI test
	test.skip('expense form UI', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		// Screenshot just the form section
		const form = page.locator('.form-container')
		await expect(form).toHaveScreenshot('expense-form.png')
	})

	// PHASE 2: Uncomment to enable single item test
	test.skip('expense list with single item', async ({ page }) => {
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

	// PHASE 3: Uncomment to enable multiple items test
	test.skip('expense list with multiple items', async ({ page }) => {
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

	// PHASE 3: Uncomment to enable total calculation test
	test.skip('total calculation display', async ({ page }) => {
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

	// PHASE 3: Uncomment to enable hover state test
	test.skip('expense list item hover state', async ({ page }) => {
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

	// PHASE 3: Uncomment to enable remove button test
	test.skip('remove button visibility', async ({ page }) => {
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

// PHASE 4: Uncomment to enable mobile tests
test.describe.skip('Visual Regression - Mobile', () => {
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

// PHASE 4: Uncomment to enable responsive breakpoint tests
test.describe.skip('Visual Regression - Responsive Breakpoints', () => {
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

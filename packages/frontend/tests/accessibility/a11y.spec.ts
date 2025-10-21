import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility Tests
 *
 * These tests use axe-core to automatically detect accessibility violations
 * following WCAG 2.1 guidelines.
 */

test.describe('Accessibility', () => {
	test('homepage should not have accessibility violations', async ({ page }) => {
		await page.goto('/')
		await page.waitForLoadState('networkidle')

		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('expense form should not have accessibility violations', async ({ page }) => {
		await page.goto('/')

		const accessibilityScanResults = await new AxeBuilder({ page })
			.include('.form-container')
			.analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('expense list should not have accessibility violations', async ({ page }) => {
		await page.goto('/')

		// Add some expenses first
		await page.getByPlaceholder('Expense name').fill('Test Expense')
		await page.getByPlaceholder('Amount').fill('10.00')
		await page.getByRole('button', { name: 'Add' }).click()

		await page.getByPlaceholder('Expense name').fill('Another Expense')
		await page.getByPlaceholder('Amount').fill('20.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Scan the list container
		const accessibilityScanResults = await new AxeBuilder({ page })
			.include('.list-container')
			.analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('form inputs have accessible labels', async ({ page }) => {
		await page.goto('/')

		const nameInput = page.getByPlaceholder('Expense name')
		const amountInput = page.getByPlaceholder('Amount')

		// Inputs should have placeholders (accessible name)
		await expect(nameInput).toHaveAttribute('placeholder', 'Expense name')
		await expect(amountInput).toHaveAttribute('placeholder', 'Amount')

		// Check for aria-label or label association
		const accessibilityScanResults = await new AxeBuilder({ page })
			.include('form')
			.analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('buttons have accessible names', async ({ page }) => {
		await page.goto('/')

		// Add button should have accessible name
		const addButton = page.getByRole('button', { name: 'Add' })
		await expect(addButton).toBeVisible()

		// Add an expense to test remove button
		await page.getByPlaceholder('Expense name').fill('Test')
		await page.getByPlaceholder('Amount').fill('5.00')
		await addButton.click()

		// Remove button should have accessible name (× character or aria-label)
		const removeButton = page.locator('.remove-btn').first()
		await expect(removeButton).toBeVisible()

		// Scan buttons
		const accessibilityScanResults = await new AxeBuilder({ page })
			.include('button')
			.analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('color contrast meets WCAG AA standards', async ({ page }) => {
		await page.goto('/')

		// Add an expense for more color testing
		await page.getByPlaceholder('Expense name').fill('Contrast Test')
		await page.getByPlaceholder('Amount').fill('25.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Run contrast checks
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2aa', 'wcag21aa'])
			.analyze()

		const contrastViolations = accessibilityScanResults.violations.filter(
			v => v.id === 'color-contrast'
		)

		expect(contrastViolations).toEqual([])
	})

	test('page has proper heading structure', async ({ page }) => {
		await page.goto('/')

		// Check for h1
		const h1 = page.locator('h1')
		await expect(h1).toBeVisible()

		// Check heading hierarchy
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['best-practice'])
			.analyze()

		const headingViolations = accessibilityScanResults.violations.filter(
			v => v.id.includes('heading')
		)

		expect(headingViolations).toEqual([])
	})

	test('interactive elements are keyboard accessible', async ({ page }) => {
		await page.goto('/')

		// All interactive elements should be reachable by keyboard
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['keyboard'])
			.analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})

	test('focus order is logical', async ({ page }) => {
		await page.goto('/')

		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['best-practice'])
			.analyze()

		const focusViolations = accessibilityScanResults.violations.filter(
			v => v.id.includes('focus') || v.id.includes('tabindex')
		)

		expect(focusViolations).toEqual([])
	})

	test('no ARIA violations', async ({ page }) => {
		await page.goto('/')

		// Add content
		await page.getByPlaceholder('Expense name').fill('ARIA Test')
		await page.getByPlaceholder('Amount').fill('15.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Check ARIA usage
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa'])
			.analyze()

		const ariaViolations = accessibilityScanResults.violations.filter(
			v => v.id.includes('aria')
		)

		expect(ariaViolations).toEqual([])
	})

	test('images have alt text (if any)', async ({ page }) => {
		await page.goto('/')

		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

		const imageViolations = accessibilityScanResults.violations.filter(
			v => v.id === 'image-alt'
		)

		expect(imageViolations).toEqual([])
	})

	test('page is usable at 200% zoom', async ({ page }) => {
		await page.goto('/')

		// Simulate 200% zoom by reducing viewport and increasing font size
		await page.setViewportSize({ width: 640, height: 480 })

		// Page should still be functional
		await page.getByPlaceholder('Expense name').fill('Zoom Test')
		await page.getByPlaceholder('Amount').fill('12.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Verify functionality works
		await expect(page.locator('.expense-name')).toContainText('Zoom Test')

		// Check for accessibility violations at zoom level
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})
})

test.describe('Accessibility - Screen Reader', () => {
	test('form has appropriate semantics', async ({ page }) => {
		await page.goto('/')

		// Form should be identifiable
		const form = page.locator('form')
		await expect(form).toBeVisible()

		// Form should be in tab order
		await page.keyboard.press('Tab')
		// Should land on first input
		await expect(page.getByPlaceholder('Expense name')).toBeFocused()
	})

	test('expense list uses semantic HTML', async ({ page }) => {
		await page.goto('/')

		// Add expenses
		await page.getByPlaceholder('Expense name').fill('Item 1')
		await page.getByPlaceholder('Amount').fill('10.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// List should use <ul> and <li> tags
		const list = page.locator('ul.expense-list')
		await expect(list).toBeVisible()

		const listItems = list.locator('li')
		await expect(listItems).toHaveCount(1)
	})

	test('dynamic content announces to screen readers', async ({ page }) => {
		await page.goto('/')

		// When adding expense, content changes
		await page.getByPlaceholder('Expense name').fill('Dynamic Test')
		await page.getByPlaceholder('Amount').fill('8.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// The new expense should be in the DOM and accessible
		const newExpense = page.locator('.expense-name', { hasText: 'Dynamic Test' })
		await expect(newExpense).toBeVisible()

		// Check that there are no live region issues
		const accessibilityScanResults = await new AxeBuilder({ page })
			.withTags(['wcag2a'])
			.analyze()

		expect(accessibilityScanResults.violations).toEqual([])
	})
})
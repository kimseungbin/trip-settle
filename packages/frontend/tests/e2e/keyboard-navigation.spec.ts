import { test, expect } from '@playwright/test'

/**
 * Keyboard Navigation Tests
 *
 * These tests ensure the application is fully accessible via keyboard,
 * following the project's keyboard-first design principle.
 */

test.describe('Keyboard Navigation', () => {
	test.beforeEach(async ({ page }) => {
		// Set up as returning user to skip onboarding
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
		await page.goto('/')
	})

	test('can submit form with Enter key', async ({ page }) => {
		const nameInput = page.getByPlaceholder('Expense name')
		const amountInput = page.getByPlaceholder('Amount')

		// Fill form
		await nameInput.fill('Keyboard Test')
		await amountInput.fill('15.00')

		// Press Enter to submit
		await nameInput.press('Enter')

		// Verify expense was added
		await expect(page.locator('.expense-name')).toContainText('Keyboard Test')
	})

	test('can submit form with Cmd+Enter (Mac) or Ctrl+Enter (Windows)', async ({ page }) => {
		const nameInput = page.getByPlaceholder('Expense name')

		// Fill form
		await nameInput.fill('Shortcut Test')
		await page.getByPlaceholder('Amount').fill('20.00')

		// Try Cmd+Enter (works on both Mac and Windows/Linux with Ctrl)
		await nameInput.press('Meta+Enter')

		// Verify expense was added
		await expect(page.locator('.expense-name')).toContainText('Shortcut Test')
	})

	test('can navigate through form fields with Tab', async ({ page }) => {
		const nameInput = page.getByPlaceholder('Expense name')
		const amountInput = page.getByPlaceholder('Amount')
		const addButton = page.getByRole('button', { name: 'Add' })

		// Start at name input
		await nameInput.focus()
		await expect(nameInput).toBeFocused()

		// Tab to amount input
		await page.keyboard.press('Tab')
		await expect(amountInput).toBeFocused()

		// Tab to currency selector (should be next in tab order)
		await page.keyboard.press('Tab')
		// Currency selector button should be focused (matches any 3-letter currency code)
		const currencyButton = page.locator('button.currency-button')
		await expect(currencyButton).toBeFocused()

		// Tab to Add button
		await page.keyboard.press('Tab')
		await expect(addButton).toBeFocused()
	})

	test('can navigate backwards with Shift+Tab', async ({ page }) => {
		const addButton = page.getByRole('button', { name: 'Add' })

		// Focus on Add button
		await addButton.focus()
		await expect(addButton).toBeFocused()

		// Shift+Tab should go back through form fields
		await page.keyboard.press('Shift+Tab')
		// Should be on currency selector or amount (depending on implementation)

		// Keep going back to name input
		await page.keyboard.press('Shift+Tab')
		await page.keyboard.press('Shift+Tab')

		// Should eventually reach name input
		const focused = await page.evaluateHandle(() => document.activeElement)
		const tagName = await focused.evaluate(el => el?.tagName)
		expect(tagName).toBe('INPUT')
	})

	test('form fields are keyboard accessible', async ({ page }) => {
		// Name input should be focusable
		await page.getByPlaceholder('Expense name').focus()
		await expect(page.getByPlaceholder('Expense name')).toBeFocused()

		// Amount input should be focusable
		await page.getByPlaceholder('Amount').focus()
		await expect(page.getByPlaceholder('Amount')).toBeFocused()

		// Add button should be focusable
		await page.getByRole('button', { name: 'Add' }).focus()
		await expect(page.getByRole('button', { name: 'Add' })).toBeFocused()
	})

	test('can delete expense with keyboard', async ({ page }) => {
		// Add an expense first
		await page.getByPlaceholder('Expense name').fill('To Delete')
		await page.getByPlaceholder('Amount').fill('5.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Verify expense exists
		await expect(page.locator('.expense-item')).toHaveCount(1)

		// Focus on remove button
		const removeButton = page.locator('.remove-btn').first()
		await removeButton.focus()
		await expect(removeButton).toBeFocused()

		// Press Enter or Space to remove
		await page.keyboard.press('Enter')

		// Verify expense was removed
		await expect(page.locator('.expense-item')).toHaveCount(0)
		await expect(page.locator('.empty-state')).toBeVisible()
	})

	test('focus returns to name input after successful submission', async ({ page }) => {
		const nameInput = page.getByPlaceholder('Expense name')

		// Fill and submit
		await nameInput.fill('Focus Test')
		await page.getByPlaceholder('Amount').fill('10.00')
		await nameInput.press('Enter')

		// Wait for submission
		await expect(page.locator('.expense-name')).toContainText('Focus Test')

		// Check that focus returned to name input
		await expect(nameInput).toBeFocused()
	})

	test('can fill form entirely with keyboard', async ({ page }) => {
		// Start from beginning (press Tab until we reach the form)
		await page.keyboard.press('Tab')

		// Type expense name
		await page.keyboard.type('Keyboard Only Expense')

		// Tab to amount
		await page.keyboard.press('Tab')
		await page.keyboard.type('42.99')

		// Tab through currency selector (or skip if auto-focused)
		await page.keyboard.press('Tab')

		// Tab to submit button
		await page.keyboard.press('Tab')

		// Submit with Enter or Space
		await page.keyboard.press('Enter')

		// Verify expense was added
		await expect(page.locator('.expense-name')).toContainText('Keyboard Only Expense')
		await expect(page.locator('.expense-amount')).toContainText('42.99')
	})

	test('keyboard shortcuts work from any form field', async ({ page }) => {
		const amountInput = page.getByPlaceholder('Amount')

		// Fill both fields
		await page.getByPlaceholder('Expense name').fill('From Amount Field')
		await amountInput.fill('30.00')

		// Focus on amount field and use keyboard shortcut
		await amountInput.focus()
		await amountInput.press('Meta+Enter')

		// Verify expense was added (shortcut worked from amount field)
		await expect(page.locator('.expense-name')).toContainText('From Amount Field')
	})

	test('no keyboard traps - can escape from any element', async ({ page }) => {
		// Add an expense
		await page.getByPlaceholder('Expense name').fill('Test')
		await page.getByPlaceholder('Amount').fill('10.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Navigate to remove button
		const removeButton = page.locator('.remove-btn').first()
		await removeButton.focus()

		// Should be able to Tab away
		await page.keyboard.press('Tab')

		// Focus should move (not trapped on remove button)
		await expect(removeButton).not.toBeFocused()
	})

	test('Enter key works consistently across browsers', async ({ page }) => {
		const tests = [
			{ name: 'Test 1', amount: '5.00' },
			{ name: 'Test 2', amount: '10.00' },
			{ name: 'Test 3', amount: '15.00' },
		]

		for (const { name, amount } of tests) {
			await page.getByPlaceholder('Expense name').fill(name)
			await page.getByPlaceholder('Amount').fill(amount)
			await page.keyboard.press('Enter')

			// Each submission should work
			await expect(page.locator('.expense-name').filter({ hasText: name })).toBeVisible()
		}

		// All three expenses should exist
		await expect(page.locator('.expense-item')).toHaveCount(3)
	})

	test('can dismiss keyboard hint toast with Escape key', async ({ page }) => {
		// Clear keyboard hint setting to ensure toast shows
		await page.evaluate(() => {
			const stored = localStorage.getItem('appSettings')
			if (stored) {
				const parsed = JSON.parse(stored)
				parsed.system.hasSeenKeyboardHint = false
				localStorage.setItem('appSettings', JSON.stringify(parsed))
			}
		})
		await page.goto('/')

		// Trigger toast by clicking Add button (mouse submission)
		await page.getByPlaceholder('Expense name').fill('Test')
		await page.getByPlaceholder('Amount').fill('10.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Check if toast is visible after mouse submission
		const toast = page.locator('.toast')
		await expect(toast).toBeVisible()

		// Press Escape to dismiss
		await page.keyboard.press('Escape')

		// Toast should disappear (either immediately or after animation)
		await expect(toast).not.toBeVisible({ timeout: 1000 })
	})

	test('can dismiss keyboard hint toast with close button', async ({ page }) => {
		// Clear keyboard hint setting to ensure toast shows
		await page.evaluate(() => {
			const stored = localStorage.getItem('appSettings')
			if (stored) {
				const parsed = JSON.parse(stored)
				parsed.system.hasSeenKeyboardHint = false
				localStorage.setItem('appSettings', JSON.stringify(parsed))
			}
		})
		await page.goto('/')

		// Trigger toast by clicking Add button (mouse submission)
		await page.getByPlaceholder('Expense name').fill('Test')
		await page.getByPlaceholder('Amount').fill('10.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Check if toast is visible
		const toast = page.locator('.toast')
		await expect(toast).toBeVisible()

		// Click the dismiss button
		const dismissButton = page.getByRole('button', { name: 'Dismiss tip' })
		await dismissButton.click()

		// Toast should disappear
		await expect(toast).not.toBeVisible({ timeout: 1000 })
	})
})

test.describe('Keyboard Accessibility - Visual Indicators', () => {
	test.beforeEach(async ({ page }) => {
		// Set up as returning user to skip onboarding
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
		await page.goto('/')
	})

	test('focused elements have visible focus indicator', async ({ page }) => {
		// Check name input focus ring
		const nameInput = page.getByPlaceholder('Expense name')
		await nameInput.focus()

		// Take screenshot to verify visual focus indicator
		await expect(nameInput).toHaveScreenshot('focus-name-input.png')

		// Check amount input focus ring
		const amountInput = page.getByPlaceholder('Amount')
		await amountInput.focus()
		await expect(amountInput).toHaveScreenshot('focus-amount-input.png')

		// Check button focus ring
		const addButton = page.getByRole('button', { name: 'Add' })
		await addButton.focus()
		await expect(addButton).toHaveScreenshot('focus-add-button.png')
	})

	test('focus is visible when tabbing through page', async ({ page }) => {
		await page.goto('/')

		// Add an expense so we have more elements to tab through
		await page.getByPlaceholder('Expense name').fill('Focus Test')
		await page.getByPlaceholder('Amount').fill('10.00')
		await page.getByRole('button', { name: 'Add' }).click()

		// Tab through all interactive elements
		let tabCount = 0
		const maxTabs = 10 // Prevent infinite loop

		while (tabCount < maxTabs) {
			await page.keyboard.press('Tab')
			tabCount++

			// Take screenshot of currently focused element
			const focusedElement = await page.evaluateHandle(() => document.activeElement)
			const tagName = await focusedElement.evaluate(el => el?.tagName)

			// Focus should always be visible on interactive elements
			if (tagName === 'INPUT' || tagName === 'BUTTON') {
				const element = page.locator(':focus')
				await expect(element).toBeVisible()
			}
		}
	})
})

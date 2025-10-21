import { test, expect } from '@playwright/test'

/**
 * HintDebugger Component Tests
 *
 * These tests verify the debugging component that shows hint status
 * in local mode for development purposes.
 */

test.describe('HintDebugger Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('shows hint debugger component in local mode', async ({ page }) => {
		// Verify the HintDebugger component is visible
		const hintDebugger = page.locator('[data-testid="hint-debugger"]')
		await expect(hintDebugger).toBeVisible()
	})

	test('displays "Hints Enabled" when hints are not dismissed', async ({ page }) => {
		// Clear localStorage to ensure hints are enabled
		await page.evaluate(() => localStorage.clear())
		await page.reload()

		// Verify the status shows enabled
		const hintDebugger = page.locator('[data-testid="hint-debugger"]')
		await expect(hintDebugger).toContainText('Hints Enabled')
	})

	test('displays "Hints Disabled" when hints are manually disabled', async ({ page }) => {
		// Manually set localStorage to disable hints
		await page.evaluate(() => {
			localStorage.setItem('keyboard-hint-dismissed', 'true')
			window.dispatchEvent(new CustomEvent('hint-status-changed'))
		})

		// Wait a moment for the event to propagate
		await page.waitForTimeout(100)

		// Verify the debugger shows disabled
		const hintDebugger = page.locator('[data-testid="hint-debugger"]')
		await expect(hintDebugger).toContainText('Hints Disabled')
	})

	test('updates status when localStorage changes', async ({ page }) => {
		// Start with hints enabled
		await page.evaluate(() => localStorage.clear())
		await page.reload()

		const hintDebugger = page.locator('[data-testid="hint-debugger"]')
		await expect(hintDebugger).toContainText('Hints Enabled')

		// Manually set localStorage to disable hints
		await page.evaluate(() => localStorage.setItem('keyboard-hint-dismissed', 'true'))

		// Trigger a storage event or reload to see the change
		await page.reload()

		// Verify the debugger now shows disabled
		await expect(hintDebugger).toContainText('Hints Disabled')
	})

	test('appears below SystemStatus component', async ({ page }) => {
		// Get both components
		const systemStatus = page.locator('[data-testid="system-status"]')
		const hintDebugger = page.locator('[data-testid="hint-debugger"]')

		// Verify both are visible
		await expect(systemStatus).toBeVisible()
		await expect(hintDebugger).toBeVisible()

		// Get their bounding boxes
		const systemStatusBox = await systemStatus.boundingBox()
		const hintDebuggerBox = await hintDebugger.boundingBox()

		// Verify HintDebugger appears below SystemStatus
		expect(hintDebuggerBox!.y).toBeGreaterThan(systemStatusBox!.y + systemStatusBox!.height)
	})
})

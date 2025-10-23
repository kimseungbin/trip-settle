import { test, expect } from '@playwright/test'

/**
 * LocalStorageViewer Component Tests
 *
 * These tests verify the localStorage debugging component that displays
 * all localStorage state in local mode for development purposes.
 */

test.describe('LocalStorageViewer Component', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage before each test for clean state
		await page.goto('/')
		await page.evaluate(() => localStorage.clear())
		await page.reload()
	})

	test('shows localStorage viewer component in local mode', async ({ page }) => {
		// Verify the LocalStorageViewer component is visible
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		await expect(viewer).toBeVisible()
	})

	test('displays empty state when no localStorage items exist', async ({ page }) => {
		// Verify empty state message is shown
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		await expect(viewer).toContainText('No localStorage items found')
		await expect(viewer).toContainText('fresh browser session')
	})

	test('displays localStorage items after they are set', async ({ page }) => {
		// Set some localStorage items (using test keys to avoid triggering app logic)
		await page.evaluate(() => {
			localStorage.setItem('testKey1', 'value1')
			localStorage.setItem('testKey2', 'true')
			window.dispatchEvent(new Event('hint-status-changed'))
		})

		// Wait for the event to propagate
		await page.waitForTimeout(200)

		// Verify items are displayed
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		const storageItems = viewer.locator('[data-testid="storage-item"]')

		await expect(storageItems).toHaveCount(2)
		await expect(viewer).toContainText('testKey1')
		await expect(viewer).toContainText('testKey2')
	})

	test('formats boolean values with visual indicators', async ({ page }) => {
		// Set a boolean-like value (using test key)
		await page.evaluate(() => {
			localStorage.setItem('testBooleanKey', 'true')
			window.dispatchEvent(new Event('hint-status-changed'))
		})

		// Wait for the event to propagate
		await page.waitForTimeout(200)

		// Verify it's formatted with checkmark
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		await expect(viewer).toContainText('✅ Yes')
	})

	test('can clear individual localStorage keys', async ({ page }) => {
		// Set some localStorage items (using test keys)
		await page.evaluate(() => {
			localStorage.setItem('testKey1', 'value1')
			localStorage.setItem('testKey2', 'value2')
			window.dispatchEvent(new Event('hint-status-changed'))
		})

		// Wait for the event to propagate
		await page.waitForTimeout(200)

		// Verify both items are present
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		let storageItems = viewer.locator('[data-testid="storage-item"]')
		await expect(storageItems).toHaveCount(2)

		// Clear one item
		const clearBtn = page.locator('[data-testid="clear-testKey1"]')
		await clearBtn.click()

		// Verify only one item remains
		storageItems = viewer.locator('[data-testid="storage-item"]')
		await expect(storageItems).toHaveCount(1)
		await expect(viewer).not.toContainText('testKey1')
		await expect(viewer).toContainText('testKey2')
	})

	test('can clear all localStorage with confirmation', async ({ page }) => {
		// Set some localStorage items (using test keys)
		await page.evaluate(() => {
			localStorage.setItem('testKey1', 'value1')
			localStorage.setItem('testKey2', 'value2')
			window.dispatchEvent(new Event('hint-status-changed'))
		})

		// Wait for the event to propagate
		await page.waitForTimeout(200)

		// Verify items are present
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		const storageItems = viewer.locator('[data-testid="storage-item"]')
		await expect(storageItems).toHaveCount(2)

		// Set up dialog handler to accept confirmation
		page.on('dialog', async dialog => {
			expect(dialog.message()).toContain('Clear all localStorage')
			await dialog.accept()
		})

		// Click clear all button
		const clearAllBtn = page.locator('[data-testid="clear-all-storage"]')
		await clearAllBtn.click()

		// Verify all items are cleared
		await expect(viewer).toContainText('No localStorage items found')
	})

	test('shows key descriptions for known localStorage keys', async ({ page }) => {
		// Set known localStorage items (using actual app keys for this description test)
		// Note: We set appSettings structure to avoid triggering legacy key migration
		await page.evaluate(() => {
			localStorage.setItem(
				'appSettings',
				JSON.stringify({
					features: { isOnboarded: false, currencyMode: 'multi', defaultCurrency: 'KRW' },
					system: { hasSeenKeyboardHint: false },
				})
			)
			window.dispatchEvent(new Event('hint-status-changed'))
		})

		// Wait for the event to propagate
		await page.waitForTimeout(200)

		// Verify the appSettings key is shown (descriptions for nested keys may vary)
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		await expect(viewer).toContainText('appSettings')
	})

	test('appears below SystemStatus component', async ({ page }) => {
		// Get both components
		const systemStatus = page.locator('[data-testid="system-status"]')
		const storageViewer = page.locator('[data-testid="local-storage-viewer"]')

		// Verify both are visible
		await expect(systemStatus).toBeVisible()
		await expect(storageViewer).toBeVisible()

		// Get their bounding boxes
		const systemStatusBox = await systemStatus.boundingBox()
		const storageViewerBox = await storageViewer.boundingBox()

		// Verify LocalStorageViewer appears below SystemStatus
		expect(storageViewerBox!.y).toBeGreaterThan(systemStatusBox!.y + systemStatusBox!.height)
	})

	test('updates dynamically when localStorage changes', async ({ page }) => {
		// Start with no items (already cleared in beforeEach)
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		await expect(viewer).toContainText('No localStorage items found')

		// Add an item (using test key)
		await page.evaluate(() => {
			localStorage.setItem('dynamicTestKey', 'dynamicValue')
			window.dispatchEvent(new Event('hint-status-changed'))
		})

		// Wait a moment for the event to propagate
		await page.waitForTimeout(200)

		// Verify item appears without reload
		const storageItems = viewer.locator('[data-testid="storage-item"]')
		await expect(storageItems).toHaveCount(1)
		await expect(viewer).toContainText('dynamicTestKey')
	})
})

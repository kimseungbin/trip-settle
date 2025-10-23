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
		// Set some localStorage items
		await page.evaluate(() => {
			localStorage.setItem('hasSeenOnboarding', 'true')
			localStorage.setItem('keyboard-hint-dismissed', 'true')
		})
		await page.reload()

		// Verify items are displayed
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		const storageItems = viewer.locator('[data-testid="storage-item"]')

		await expect(storageItems).toHaveCount(2)
		await expect(viewer).toContainText('hasSeenOnboarding')
		await expect(viewer).toContainText('keyboard-hint-dismissed')
	})

	test('formats boolean values with visual indicators', async ({ page }) => {
		// Set a boolean-like value
		await page.evaluate(() => {
			localStorage.setItem('hasSeenOnboarding', 'true')
		})
		await page.reload()

		// Verify it's formatted with checkmark
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		await expect(viewer).toContainText('✅ Yes')
	})

	test('can clear individual localStorage keys', async ({ page }) => {
		// Set some localStorage items
		await page.evaluate(() => {
			localStorage.setItem('hasSeenOnboarding', 'true')
			localStorage.setItem('keyboard-hint-dismissed', 'true')
		})
		await page.reload()

		// Verify both items are present
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		let storageItems = viewer.locator('[data-testid="storage-item"]')
		await expect(storageItems).toHaveCount(2)

		// Clear one item
		const clearOnboardingBtn = page.locator('[data-testid="clear-hasSeenOnboarding"]')
		await clearOnboardingBtn.click()

		// Verify only one item remains
		storageItems = viewer.locator('[data-testid="storage-item"]')
		await expect(storageItems).toHaveCount(1)
		await expect(viewer).not.toContainText('hasSeenOnboarding')
		await expect(viewer).toContainText('keyboard-hint-dismissed')
	})

	test('can clear all localStorage with confirmation', async ({ page }) => {
		// Set some localStorage items
		await page.evaluate(() => {
			localStorage.setItem('hasSeenOnboarding', 'true')
			localStorage.setItem('keyboard-hint-dismissed', 'true')
		})
		await page.reload()

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
		// Set known localStorage items
		await page.evaluate(() => {
			localStorage.setItem('hasSeenOnboarding', 'true')
			localStorage.setItem('keyboard-hint-dismissed', 'true')
		})
		await page.reload()

		// Verify descriptions are shown
		const viewer = page.locator('[data-testid="local-storage-viewer"]')
		await expect(viewer).toContainText('Tracks whether user has completed onboarding')
		await expect(viewer).toContainText('Tracks whether user dismissed keyboard hints')
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

		// Add an item
		await page.evaluate(() => {
			localStorage.setItem('hasSeenOnboarding', 'true')
			window.dispatchEvent(new Event('hint-status-changed'))
		})

		// Wait a moment for the event to propagate
		await page.waitForTimeout(200)

		// Verify item appears without reload
		const storageItems = viewer.locator('[data-testid="storage-item"]')
		await expect(storageItems).toHaveCount(1)
		await expect(viewer).toContainText('hasSeenOnboarding')
	})
})

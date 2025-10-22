import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Trip Settle frontend E2E tests
 * See https://playwright.dev/docs/test-configuration
 */

// Detect if running in Docker (via PLAYWRIGHT_BASE_URL env var)
const isDocker = !!process.env.PLAYWRIGHT_BASE_URL
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'

export default defineConfig({
	// Test directory
	testDir: './tests',

	// Run tests in parallel across files, but sequentially within each file
	// This avoids race conditions while still getting parallelization benefits
	fullyParallel: false,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Workers: use PLAYWRIGHT_WORKERS env var if set, otherwise 1 in CI, undefined locally
	workers: process.env.PLAYWRIGHT_WORKERS
		? parseInt(process.env.PLAYWRIGHT_WORKERS, 10)
		: process.env.CI
		  ? 1
		  : undefined,

	// Reporter to use
	reporter: [
		['html', { outputFolder: 'playwright-report' }],
		['list'],
		...(process.env.CI ? [['github'] as const] : []),
	],

	// Shared settings for all projects
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL,

		// Collect trace when retrying the failed test
		trace: 'on-first-retry',

		// Screenshot on failure
		screenshot: 'only-on-failure',

		// Video on failure
		video: 'retain-on-failure',
	},

	// Configure projects for major browsers
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},

		// Uncomment to test on Firefox
		// {
		// 	name: 'firefox',
		// 	use: { ...devices['Desktop Firefox'] },
		// },

		// Test on WebKit (Safari)
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},

		// Test against mobile viewports
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 12'] },
		},
	],

	// Run your local dev server before starting the tests
	// Skip webServer in Docker mode (services already running via docker-compose)
	webServer: isDocker
		? undefined
		: [
				{
					command: 'npm run dev --workspace=backend',
					url: 'http://localhost:3000/api/health',
					reuseExistingServer: !process.env.CI,
					stdout: 'ignore',
					stderr: 'pipe',
					timeout: 120 * 1000,
					cwd: '../..',
				},
				{
					command: 'npm run dev --workspace=frontend',
					url: 'http://localhost:5173',
					reuseExistingServer: !process.env.CI,
					stdout: 'ignore',
					stderr: 'pipe',
					cwd: '../..',
				},
		  ],
})

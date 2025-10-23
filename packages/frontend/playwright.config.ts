import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Trip Settle frontend E2E tests
 * See https://playwright.dev/docs/test-configuration
 */

// Test environment: local (dev machine), ci-docker (GH Actions), ecs (AWS), etc.
const testEnv = process.env.TEST_ENV || 'local'

// Determine if we should run visual snapshot tests
// Only run in ci-docker where Linux snapshots are maintained
const shouldRunVisualTests = testEnv === 'ci-docker'

// Detect if running in Docker (via PLAYWRIGHT_BASE_URL env var)
const isDocker = !!process.env.PLAYWRIGHT_BASE_URL
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'

// Detect local development environment (not CI, not Docker)
const isLocalDev = !process.env.CI && !isDocker

export default defineConfig({
	// Test directory
	testDir: './tests',

	// Only match Playwright test files (exclude Vitest *.test.ts files)
	testMatch: '**/*.spec.ts',

	// Run tests in parallel across files, but sequentially within each file
	// This avoids race conditions while still getting parallelization benefits
	fullyParallel: false,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// No retries - tests should be reliable and pass on first run
	// Retries hide flakiness and slow down CI feedback loop
	retries: 0,

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
		// JUnit XML reporter for WebStorm test runner integration
		['junit', { outputFile: 'test-results/junit.xml' }],
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
	// Local dev: Single browser (webkit/Safari) for speed
	// CI/Docker: Full browser matrix for cross-browser compatibility
	projects: isLocalDev
		? [
				// Local development: webkit only (Safari on Mac)
				{
					name: 'webkit',
					use: { ...devices['Desktop Safari'] },
					grep: /^(?!.*Visual)/, // Skip visual tests locally
				},
			]
		: [
				// CI/Docker: Essential browsers only (Chromium + WebKit for cross-engine coverage)
				// Mobile browsers removed for 50% faster CI (responsive tested via viewport config)
				{
					name: 'chromium',
					use: { ...devices['Desktop Chrome'] },
					grep: shouldRunVisualTests ? undefined : /^(?!.*Visual)/,
				},
				{
					name: 'webkit',
					use: { ...devices['Desktop Safari'] },
					grep: shouldRunVisualTests ? undefined : /^(?!.*Visual)/,
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

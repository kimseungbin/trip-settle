import * as core from '@actions/core'
import * as fs from 'fs'

/**
 * Playwright JSON Reporter Schema Types
 */
interface PlaywrightConfig {
	version?: string
	workers?: number
}

interface TestResult {
	status: 'passed' | 'failed' | 'skipped' | 'timedOut'
	duration: number
	error?: {
		message?: string
		stack?: string
	}
	attachments?: Array<{
		name?: string
		path?: string
		contentType?: string
	}>
}

interface TestCase {
	projectName?: string
	results?: TestResult[]
}

interface TestSpec {
	title: string
	tests?: TestCase[]
}

interface TestSuite {
	title?: string
	file?: string
	specs?: TestSpec[]
	suites?: TestSuite[]
}

interface PlaywrightResults {
	config?: PlaywrightConfig
	suites?: TestSuite[]
}

/**
 * Test failure metadata
 */
interface TestFailure {
	testFile: string
	testName: string
	browser: string
	errorType: 'timeout' | 'visual_regression' | 'assertion' | 'navigation' | 'setup_teardown' | 'unknown'
	errorMessage: string
	stackTrace: string
	duration: number
	artifacts: {
		screenshots: string[]
		videos: string[]
		traces: string[]
	}
}

/**
 * Test statistics
 */
interface TestStats {
	total: number
	passed: number
	failed: number
	skipped: number
	duration: number
}

/**
 * Extract E2E test failure metadata from Playwright JSON reporter output
 * and generate INI-format note for git notes storage.
 */
function run(): void {
	try {
		// Get inputs
		const resultsPath = core.getInput('results-path', { required: true })
		const outputPath = core.getInput('output-path', { required: true })

		core.info(`📊 Extracting E2E failure metadata...`)
		core.info(`   Results: ${resultsPath}`)
		core.info(`   Output: ${outputPath}`)

		// Read Playwright JSON results
		let results: PlaywrightResults
		try {
			const resultsData = fs.readFileSync(resultsPath, 'utf-8')
			results = JSON.parse(resultsData) as PlaywrightResults
		} catch (error) {
			throw new Error(`Failed to read results file: ${error instanceof Error ? error.message : String(error)}`)
		}

		// Extract metadata from environment
		const timestamp = new Date().toISOString()
		const commit = process.env.GITHUB_SHA?.substring(0, 7) || 'unknown'
		const branch = process.env.GITHUB_REF_NAME || 'unknown'
		const runUrl =
			process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
				? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
				: 'local'

		// Analyze test results
		const stats = analyzeTestStats(results)
		const failures = extractFailures(results)

		const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0'

		// Generate INI-format note
		const note = generateNote({
			timestamp,
			commit,
			branch,
			runUrl,
			stats,
			passRate,
			failures,
			resultsPath,
			config: results.config,
		})

		// Write output
		fs.writeFileSync(outputPath, note, 'utf-8')

		// Set outputs
		core.setOutput('tests-total', stats.total.toString())
		core.setOutput('tests-passed', stats.passed.toString())
		core.setOutput('tests-failed', stats.failed.toString())
		core.setOutput('tests-skipped', stats.skipped.toString())
		core.setOutput('pass-rate', passRate)
		core.setOutput('failures-count', failures.length.toString())

		// Log summary
		core.info(`✅ E2E failure metadata extracted successfully`)
		core.info(`   Tests: ${stats.total} total, ${stats.passed} passed, ${stats.failed} failed`)

		if (failures.length > 0) {
			core.warning(`   Failures: ${failures.length} test(s) failed`)
			failures.forEach((f, i) => {
				core.info(`     ${i + 1}. ${f.testName} [${f.browser}] (${f.errorType})`)
			})
		}
	} catch (error) {
		if (error instanceof Error) {
			core.setFailed(error.message)
		} else {
			core.setFailed('An unknown error occurred')
		}
	}
}

/**
 * Analyze test statistics from Playwright results
 */
function analyzeTestStats(results: PlaywrightResults): TestStats {
	const stats: TestStats = {
		total: 0,
		passed: 0,
		failed: 0,
		skipped: 0,
		duration: 0,
	}

	function processSuite(suite: TestSuite): void {
		suite.specs?.forEach(spec => {
			spec.tests?.forEach(test => {
				const result = test.results?.[0]
				if (!result) return

				stats.total++
				stats.duration += result.duration || 0

				switch (result.status) {
					case 'passed':
						stats.passed++
						break
					case 'failed':
					case 'timedOut':
						stats.failed++
						break
					case 'skipped':
						stats.skipped++
						break
				}
			})
		})

		suite.suites?.forEach(subSuite => processSuite(subSuite))
	}

	results.suites?.forEach(suite => processSuite(suite))

	return stats
}

/**
 * Extract failure details from Playwright results
 */
function extractFailures(results: PlaywrightResults): TestFailure[] {
	const failures: TestFailure[] = []

	function processSuite(suite: TestSuite, suitePath: string[] = []): void {
		const currentPath = [...suitePath, suite.title].filter((item): item is string => Boolean(item))

		suite.specs?.forEach(spec => {
			spec.tests?.forEach(test => {
				const result = test.results?.[0]
				if (!result || result.status === 'passed' || result.status === 'skipped') return

				// Classify error type
				const error = result.error || {}
				const errorMessage = error.message || 'No error message'
				const stackTrace = error.stack || ''

				const errorType = classifyError(errorMessage)

				// Extract artifact paths
				const artifacts = {
					screenshots: [] as string[],
					videos: [] as string[],
					traces: [] as string[],
				}

				result.attachments?.forEach(attachment => {
					if (attachment.contentType?.startsWith('image/')) {
						artifacts.screenshots.push(attachment.path || 'embedded')
					} else if (attachment.contentType?.includes('video')) {
						artifacts.videos.push(attachment.path || 'embedded')
					} else if (attachment.name?.includes('trace')) {
						artifacts.traces.push(attachment.path || 'embedded')
					}
				})

				failures.push({
					testFile: suite.file || 'unknown',
					testName: [...currentPath, spec.title].join(' › '),
					browser: test.projectName || 'unknown',
					errorType,
					errorMessage: errorMessage.split('\n')[0], // First line only
					stackTrace: stackTrace.split('\n').slice(0, 5).join('\n'), // First 5 lines
					duration: result.duration || 0,
					artifacts,
				})
			})
		})

		suite.suites?.forEach(subSuite => processSuite(subSuite, currentPath))
	}

	results.suites?.forEach(suite => processSuite(suite))

	return failures
}

/**
 * Classify error type based on error message
 */
function classifyError(
	errorMessage: string
): 'timeout' | 'visual_regression' | 'assertion' | 'navigation' | 'setup_teardown' | 'unknown' {
	if (/Timeout|timeout|exceeded/i.test(errorMessage)) {
		return 'timeout'
	} else if (/Screenshot|snapshot|pixels? differ/i.test(errorMessage)) {
		return 'visual_regression'
	} else if (/expect|toBe|toHaveText|toContain/i.test(errorMessage)) {
		return 'assertion'
	} else if (/Navigation|goto|net::ERR/i.test(errorMessage)) {
		return 'navigation'
	} else if (/beforeEach|afterEach|beforeAll|afterAll/i.test(errorMessage)) {
		return 'setup_teardown'
	}
	return 'unknown'
}

/**
 * Generate INI-format note
 */
function generateNote(data: {
	timestamp: string
	commit: string
	branch: string
	runUrl: string
	stats: TestStats
	passRate: string
	failures: TestFailure[]
	resultsPath: string
	config?: PlaywrightConfig
}): string {
	const { timestamp, commit, branch, runUrl, stats, passRate, failures, resultsPath, config } = data

	let note = `=== E2E TEST FAILURE REPORT ===

[metadata]
timestamp = ${timestamp}
commit = ${commit}
branch = ${branch}
run_url = ${runUrl}
total_tests = ${stats.total}
passed = ${stats.passed}
failed = ${stats.failed}
skipped = ${stats.skipped}
pass_rate = ${passRate}%
duration_sec = ${Math.round(stats.duration / 1000)}

[summary]
status = ${stats.failed > 0 ? 'FAILED' : 'PASSED'}
new_failures = ${failures.length}
timeout_failures = ${failures.filter(f => f.errorType === 'timeout').length}
visual_failures = ${failures.filter(f => f.errorType === 'visual_regression').length}
assertion_failures = ${failures.filter(f => f.errorType === 'assertion').length}
navigation_failures = ${failures.filter(f => f.errorType === 'navigation').length}
setup_failures = ${failures.filter(f => f.errorType === 'setup_teardown').length}

`

	// Add individual failure details
	failures.forEach((failure, index) => {
		const num = index + 1
		note += `[failure.${num}]
test_file = ${failure.testFile}
test_name = ${failure.testName}
browser = ${failure.browser}
error_type = ${failure.errorType}
error_message = ${failure.errorMessage.replace(/\n/g, ' ')}
duration_ms = ${failure.duration}
screenshots = ${failure.artifacts.screenshots.join(', ') || 'none'}
videos = ${failure.artifacts.videos.join(', ') || 'none'}
traces = ${failure.artifacts.traces.join(', ') || 'none'}

`
	})

	// Add diagnostics section
	note += `[diagnostics]
playwright_version = ${config?.version || 'unknown'}
test_env = ${process.env.TEST_ENV || 'unknown'}
workers = ${config?.workers || 'unknown'}
reporter_output = ${resultsPath}
artifacts_uploaded = ${process.env.CI === 'true' ? 'yes (GitHub Actions)' : 'no (local run)'}
`

	return note
}

// Run the action
void run()

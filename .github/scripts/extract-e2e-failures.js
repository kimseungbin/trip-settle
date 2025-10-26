#!/usr/bin/env node

/**
 * Extract E2E test failure metadata from Playwright JSON reporter output
 * and generate INI-format note for git notes storage.
 *
 * Usage:
 *   node extract-e2e-failures.js <results-json-path> <output-note-path>
 *
 * Example:
 *   node extract-e2e-failures.js packages/frontend/test-results/results.json e2e-failure-note.txt
 */

const fs = require('fs')
const path = require('path')

// Parse command-line arguments
const [, , resultsPath, outputPath] = process.argv

if (!resultsPath || !outputPath) {
	console.error('Usage: extract-e2e-failures.js <results-json-path> <output-note-path>')
	process.exit(1)
}

// Read Playwright JSON results
let results
try {
	const resultsData = fs.readFileSync(resultsPath, 'utf-8')
	results = JSON.parse(resultsData)
} catch (error) {
	console.error(`Error reading results file: ${error.message}`)
	process.exit(1)
}

// Extract metadata
const timestamp = new Date().toISOString()
const commit = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'unknown'
const branch = process.env.GITHUB_REF_NAME || 'unknown'
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
	? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
	: 'local'

// Analyze test results
const stats = results.suites?.reduce(
	(acc, suite) => {
		suite.specs?.forEach(spec => {
			spec.tests?.forEach(test => {
				const result = test.results?.[0]
				if (!result) return

				acc.total++
				acc.duration += result.duration || 0

				if (result.status === 'passed') {
					acc.passed++
				} else if (result.status === 'failed') {
					acc.failed++
				} else if (result.status === 'skipped') {
					acc.skipped++
				} else if (result.status === 'timedOut') {
					acc.failed++
				}
			})
		})
		return acc
	},
	{ total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 }
) || { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 }

const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0'

// Extract failures
const failures = []

function extractFailures(suite, suitePath = []) {
	const currentPath = [...suitePath, suite.title].filter(Boolean)

	suite.specs?.forEach(spec => {
		spec.tests?.forEach(test => {
			const result = test.results?.[0]
			if (!result || result.status === 'passed') return

			// Classify error type
			const error = result.error || {}
			const errorMessage = error.message || 'No error message'
			const stackTrace = error.stack || ''

			let errorType = 'unknown'
			if (errorMessage.match(/Timeout|timeout|exceeded/i)) {
				errorType = 'timeout'
			} else if (errorMessage.match(/Screenshot|snapshot|pixels? differ/i)) {
				errorType = 'visual_regression'
			} else if (errorMessage.match(/expect|toBe|toHaveText|toContain/i)) {
				errorType = 'assertion'
			} else if (errorMessage.match(/Navigation|goto|net::ERR/i)) {
				errorType = 'navigation'
			} else if (errorMessage.match(/beforeEach|afterEach|beforeAll|afterAll/i)) {
				errorType = 'setup_teardown'
			}

			// Extract artifact paths (screenshots, videos, traces)
			const artifacts = {
				screenshots: [],
				videos: [],
				traces: []
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
				artifacts
			})
		})
	})

	suite.suites?.forEach(subSuite => extractFailures(subSuite, currentPath))
}

results.suites?.forEach(suite => extractFailures(suite))

// Generate INI-format note
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
playwright_version = ${results.config?.version || 'unknown'}
test_env = ${process.env.TEST_ENV || 'unknown'}
workers = ${results.config?.workers || 'unknown'}
reporter_output = ${resultsPath}
artifacts_uploaded = ${process.env.CI === 'true' ? 'yes (GitHub Actions)' : 'no (local run)'}
`

// Write output
try {
	fs.writeFileSync(outputPath, note, 'utf-8')
	console.log(`✅ E2E failure metadata extracted successfully`)
	console.log(`   Input: ${resultsPath}`)
	console.log(`   Output: ${outputPath}`)
	console.log(`   Tests: ${stats.total} total, ${stats.passed} passed, ${stats.failed} failed`)
	if (failures.length > 0) {
		console.log(`   Failures: ${failures.length} tests failed`)
		failures.forEach((f, i) => {
			console.log(`     ${i + 1}. ${f.testName} [${f.browser}] (${f.errorType})`)
		})
	}
} catch (error) {
	console.error(`Error writing output file: ${error.message}`)
	process.exit(1)
}

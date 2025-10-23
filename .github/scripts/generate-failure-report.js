#!/usr/bin/env node

/**
 * Generate CI Failure Report
 *
 * This script aggregates failure information from various CI jobs and creates
 * a unified markdown report optimized for Claude Code to read and provide
 * actionable feedback.
 *
 * Usage: node generate-failure-report.js
 *
 * Environment variables:
 * - BUILD_LOG_PATH: Path to build log file (default: build-log.txt)
 * - OUTPUT_PATH: Path to output markdown report (default: ci-failure-report.md)
 */

const fs = require('fs')
const path = require('path')

// Configuration
const CONFIG = {
	buildLogPath: process.env.BUILD_LOG_PATH || 'build-log.txt',
	outputPath: process.env.OUTPUT_PATH || 'ci-failure-report.md',
	githubServerUrl: process.env.GITHUB_SERVER_URL || 'https://github.com',
	githubRepository: process.env.GITHUB_REPOSITORY || '',
	githubRunId: process.env.GITHUB_RUN_ID || '',
	githubSha: process.env.GITHUB_SHA || '',
	githubRef: process.env.GITHUB_REF || '',
}

/**
 * Parse TypeScript compilation errors from build output
 * @param {string} logContent - Build log content
 * @returns {Array} Array of error objects
 */
function parseBuildErrors(logContent) {
	const errors = []

	// Match TypeScript errors: "path/to/file.ts(line,col): error TS1234: message"
	const tsErrorRegex = /^(.+?\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/gm
	let match

	while ((match = tsErrorRegex.exec(logContent)) !== null) {
		errors.push({
			file: match[1],
			line: parseInt(match[2], 10),
			column: parseInt(match[3], 10),
			code: match[4],
			message: match[5],
			type: 'typescript',
		})
	}

	// Match generic build errors
	const genericErrorRegex = /^error (.+)$/gim
	while ((match = genericErrorRegex.exec(logContent)) !== null) {
		// Skip if already captured as TypeScript error
		if (!match[1].startsWith('TS')) {
			errors.push({
				message: match[1],
				type: 'build',
			})
		}
	}

	return errors
}

/**
 * Generate markdown section for build failures
 * @param {Array} errors - Array of error objects
 * @returns {string} Markdown content
 */
function generateBuildSection(errors) {
	if (errors.length === 0) {
		return ''
	}

	let markdown = '## Build Failures\n\n'
	markdown += `**Total Errors:** ${errors.length}\n\n`

	// Group errors by file
	const errorsByFile = errors.reduce((acc, error) => {
		if (error.file) {
			const file = error.file
			if (!acc[file]) {
				acc[file] = []
			}
			acc[file].push(error)
		} else {
			if (!acc['_general']) {
				acc['_general'] = []
			}
			acc['_general'].push(error)
		}
		return acc
	}, {})

	// Output file-specific errors
	for (const [file, fileErrors] of Object.entries(errorsByFile)) {
		if (file === '_general') continue

		markdown += `### \`${file}\`\n\n`

		for (const error of fileErrors) {
			markdown += `**Line ${error.line}:${error.column}** - \`${error.code}\`\n\n`
			markdown += `\`\`\`\n${error.message}\n\`\`\`\n\n`
		}
	}

	// Output general errors
	if (errorsByFile['_general']) {
		markdown += '### General Build Errors\n\n'
		for (const error of errorsByFile['_general']) {
			markdown += `- ${error.message}\n`
		}
		markdown += '\n'
	}

	return markdown
}

/**
 * Generate markdown header with CI context
 * @returns {string} Markdown content
 */
function generateHeader() {
	const runUrl = `${CONFIG.githubServerUrl}/${CONFIG.githubRepository}/actions/runs/${CONFIG.githubRunId}`
	const commitUrl = `${CONFIG.githubServerUrl}/${CONFIG.githubRepository}/commit/${CONFIG.githubSha}`

	let markdown = '# CI Failure Report\n\n'
	markdown += `**Generated:** ${new Date().toISOString()}\n\n`

	if (CONFIG.githubRunId) {
		markdown += `**Workflow Run:** [#${CONFIG.githubRunId}](${runUrl})\n\n`
	}

	if (CONFIG.githubSha) {
		markdown += `**Commit:** [\`${CONFIG.githubSha.substring(0, 7)}\`](${commitUrl})\n\n`
	}

	if (CONFIG.githubRef) {
		markdown += `**Ref:** \`${CONFIG.githubRef}\`\n\n`
	}

	markdown += '---\n\n'

	return markdown
}

/**
 * Generate markdown footer with guidance
 * @returns {string} Markdown content
 */
function generateFooter() {
	let markdown = '\n---\n\n'
	markdown += '## How to Fix\n\n'
	markdown += '1. Review the errors above and identify the root cause\n'
	markdown += '2. Fix the issues locally and ensure tests pass\n'
	markdown += '3. Run `npm run build` to verify the build succeeds\n'
	markdown += '4. Commit and push your changes\n\n'
	markdown += '## Need Help?\n\n'
	markdown += 'You can provide this report to Claude Code for assistance:\n'
	markdown += '1. Download this artifact from the GitHub Actions run\n'
	markdown += '2. Share the report with Claude Code\n'
	markdown += '3. Claude Code will analyze the errors and suggest fixes\n'

	return markdown
}

/**
 * Main function to generate the failure report
 */
function generateReport() {
	console.log('🔍 Generating CI failure report...')

	let markdown = generateHeader()
	let hasErrors = false

	// Process build log if exists
	if (fs.existsSync(CONFIG.buildLogPath)) {
		console.log(`📄 Reading build log: ${CONFIG.buildLogPath}`)
		const logContent = fs.readFileSync(CONFIG.buildLogPath, 'utf-8')
		const buildErrors = parseBuildErrors(logContent)

		if (buildErrors.length > 0) {
			console.log(`❌ Found ${buildErrors.length} build error(s)`)
			markdown += generateBuildSection(buildErrors)
			hasErrors = true
		} else {
			console.log('✅ No build errors found in log')
		}
	} else {
		console.log(`⚠️  Build log not found: ${CONFIG.buildLogPath}`)
		markdown += '## Build Failures\n\n'
		markdown += '⚠️ Build log file not found. The build may have failed before generating logs.\n\n'
		hasErrors = true
	}

	// Add footer
	markdown += generateFooter()

	// Write report
	if (hasErrors) {
		console.log(`📝 Writing report to: ${CONFIG.outputPath}`)
		fs.writeFileSync(CONFIG.outputPath, markdown, 'utf-8')
		console.log('✅ Report generated successfully')

		// Also output to console for GitHub Actions job summary
		console.log('\n' + '='.repeat(80))
		console.log('REPORT PREVIEW:')
		console.log('='.repeat(80))
		console.log(markdown)
		console.log('='.repeat(80))
	} else {
		console.log('✅ No failures to report')
	}
}

// Run the script
try {
	generateReport()
} catch (error) {
	console.error('❌ Error generating report:', error)
	process.exit(1)
}
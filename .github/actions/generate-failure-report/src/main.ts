import * as core from '@actions/core'
import * as fs from 'fs'

/**
 * Build error types
 */
interface TypeScriptError {
	file: string
	line: number
	column: number
	code: string
	message: string
	type: 'typescript'
}

interface GenericError {
	message: string
	type: 'build'
}

type BuildError = TypeScriptError | GenericError

/**
 * Errors grouped by file
 */
interface ErrorsByFile {
	[file: string]: BuildError[]
}

/**
 * Generate CI Failure Report
 *
 * This action aggregates failure information from various CI jobs and creates
 * a unified markdown report optimized for Claude Code to read and provide
 * actionable feedback.
 */
function run(): void {
	try {
		// Get inputs
		const buildLogPath = core.getInput('build-log-path') || 'build-log.txt'
		const outputPath = core.getInput('output-path') || 'ci-failure-report.md'

		core.info('🔍 Generating CI failure report...')
		core.info(`   Build log: ${buildLogPath}`)
		core.info(`   Output: ${outputPath}`)

		// Generate report
		const markdown = generateReport(buildLogPath)

		// Write report
		fs.writeFileSync(outputPath, markdown, 'utf-8')

		// Set outputs
		core.setOutput('report-path', outputPath)

		core.info('✅ Report generated successfully')
	} catch (error) {
		if (error instanceof Error) {
			core.setFailed(error.message)
		} else {
			core.setFailed('An unknown error occurred')
		}
	}
}

/**
 * Main function to generate the failure report
 */
function generateReport(buildLogPath: string): string {
	let markdown = generateHeader()
	let hasErrors = false

	// Process build log if exists
	if (fs.existsSync(buildLogPath)) {
		core.info(`📄 Reading build log: ${buildLogPath}`)
		const logContent = fs.readFileSync(buildLogPath, 'utf-8')
		const buildErrors = parseBuildErrors(logContent)

		if (buildErrors.length > 0) {
			core.info(`❌ Found ${buildErrors.length} build error(s)`)
			markdown += generateBuildSection(buildErrors)
			hasErrors = true
		} else {
			core.info('✅ No build errors found in log')
		}
	} else {
		core.warning(`Build log not found: ${buildLogPath}`)
		markdown += '## Build Failures\n\n'
		markdown += '⚠️ Build log file not found. The build may have failed before generating logs.\n\n'
		hasErrors = true
	}

	// Add footer
	markdown += generateFooter()

	if (!hasErrors) {
		core.info('✅ No failures to report')
	}

	return markdown
}

/**
 * Parse TypeScript compilation errors from build output
 */
function parseBuildErrors(logContent: string): BuildError[] {
	const errors: BuildError[] = []

	// Match TypeScript errors: "path/to/file.ts(line,col): error TS1234: message"
	const tsErrorRegex = /^(.+?\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/gm
	let match: RegExpExecArray | null

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
 */
function generateBuildSection(errors: BuildError[]): string {
	if (errors.length === 0) {
		return ''
	}

	let markdown = '## Build Failures\n\n'
	markdown += `**Total Errors:** ${errors.length}\n\n`

	// Group errors by file
	const errorsByFile = groupErrorsByFile(errors)

	// Output file-specific errors
	for (const [file, fileErrors] of Object.entries(errorsByFile)) {
		if (file === '_general') continue

		markdown += `### \`${file}\`\n\n`

		for (const error of fileErrors) {
			if (error.type === 'typescript') {
				markdown += `**Line ${error.line}:${error.column}** - \`${error.code}\`\n\n`
				markdown += `\`\`\`\n${error.message}\n\`\`\`\n\n`
			}
		}
	}

	// Output general errors
	if (errorsByFile['_general']) {
		markdown += '### General Build Errors\n\n'
		for (const error of errorsByFile['_general']) {
			if (error.type === 'build') {
				markdown += `- ${error.message}\n`
			}
		}
		markdown += '\n'
	}

	return markdown
}

/**
 * Group errors by file
 */
function groupErrorsByFile(errors: BuildError[]): ErrorsByFile {
	return errors.reduce<ErrorsByFile>((acc, error) => {
		if (error.type === 'typescript') {
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
}

/**
 * Generate markdown header with CI context
 */
function generateHeader(): string {
	const githubServerUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
	const githubRepository = process.env.GITHUB_REPOSITORY || ''
	const githubRunId = process.env.GITHUB_RUN_ID || ''
	const githubSha = process.env.GITHUB_SHA || ''
	const githubRef = process.env.GITHUB_REF || ''

	const runUrl = `${githubServerUrl}/${githubRepository}/actions/runs/${githubRunId}`
	const commitUrl = `${githubServerUrl}/${githubRepository}/commit/${githubSha}`

	let markdown = '# CI Failure Report\n\n'
	markdown += `**Generated:** ${new Date().toISOString()}\n\n`

	if (githubRunId) {
		markdown += `**Workflow Run:** [#${githubRunId}](${runUrl})\n\n`
	}

	if (githubSha) {
		markdown += `**Commit:** [\`${githubSha.substring(0, 7)}\`](${commitUrl})\n\n`
	}

	if (githubRef) {
		markdown += `**Ref:** \`${githubRef}\`\n\n`
	}

	markdown += '---\n\n'

	return markdown
}

/**
 * Generate markdown footer with guidance
 */
function generateFooter(): string {
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

// Run the action
void run()

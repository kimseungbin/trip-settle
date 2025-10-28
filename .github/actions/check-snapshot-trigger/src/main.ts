import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * Supported test scopes for snapshot updates
 */
type TestScope = 'all' | 'visual' | 'e2e'

/**
 * Result of trigger condition check
 */
interface TriggerResult {
	shouldRun: boolean
	branch: string
	testScope: TestScope
}

/**
 * Check if visual snapshot update workflow should run
 * This action detects three trigger methods:
 *   1. Manual workflow_dispatch
 *   2. PR comment containing "/update-snapshots"
 *   3. Commit footer containing "Snapshots: update" or "Snapshots: skip"
 */
async function run(): Promise<void> {
	try {
		const { eventName, payload, ref } = github.context

		// Initialize result with defaults
		const result: TriggerResult = {
			shouldRun: false,
			branch: ref.replace('refs/heads/', ''),
			testScope: 'all',
		}

		core.info(`🔍 Checking snapshot update trigger condition...`)
		core.info(`Event: ${eventName}`)

		// Check trigger condition based on event type
		switch (eventName) {
			case 'workflow_dispatch':
				handleWorkflowDispatch(result, payload)
				break

			case 'issue_comment':
				handleIssueComment(result, payload)
				break

			case 'push':
				handlePush(result, payload)
				break

			default:
				core.info(`ℹ️  Unknown or unsupported event type: ${eventName}`)
		}

		// Set outputs
		core.setOutput('should_run', result.shouldRun.toString())
		core.setOutput('branch', result.branch)
		core.setOutput('test_scope', result.testScope)

		// Log results
		core.info('')
		core.info('Results:')
		core.info(`  should_run = ${result.shouldRun}`)
		core.info(`  branch = ${result.branch}`)
		core.info(`  test_scope = ${result.testScope}`)

		if (result.shouldRun) {
			core.notice(`✅ Snapshot update triggered via ${eventName} (scope: ${result.testScope})`)
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
 * Handle workflow_dispatch trigger
 */
function handleWorkflowDispatch(result: TriggerResult, payload: typeof github.context.payload): void {
	core.info('✅ Manual workflow_dispatch trigger detected')
	result.shouldRun = true

	// Check if custom branch was specified
	const customBranch = payload.inputs?.branch
	if (customBranch && customBranch.trim() !== '') {
		result.branch = customBranch
		core.info(`   Using custom branch: ${result.branch}`)
	}
}

/**
 * Handle issue_comment trigger (PR comment)
 */
function handleIssueComment(result: TriggerResult, payload: typeof github.context.payload): void {
	core.info('🔍 Checking PR comment trigger...')

	const commentBody = payload.comment?.body
	const isPullRequest = payload.issue?.pull_request !== undefined

	if (commentBody && commentBody.startsWith('/update-snapshots') && isPullRequest) {
		core.info('✅ PR comment trigger detected: /update-snapshots')
		result.shouldRun = true
		// Note: Branch is inherited from current context
	} else {
		core.info('ℹ️  Comment does not match /update-snapshots pattern or not on PR')
	}
}

/**
 * Handle push trigger (commit footer)
 */
function handlePush(result: TriggerResult, payload: typeof github.context.payload): void {
	core.info('🔍 Checking commit footer trigger...')

	const commits = payload.commits || []
	core.info(`   Checking ${commits.length} commit(s) in push...`)

	// Check ALL commits in the push for snapshot update trigger
	// This handles multi-commit pushes where footer might not be in HEAD
	const matchingCommits = commits.filter(
		(commit: { message: string }) =>
			commit.message.includes('Snapshots: update') || commit.message.includes('[update-snapshots]') // Legacy format
	)

	if (matchingCommits.length > 0) {
		core.info('✅ Commit footer trigger detected: Snapshots: update')
		core.info('   Matching commits:')

		matchingCommits.forEach((commit: { id: string; message: string }) => {
			const shortId = commit.id.substring(0, 7)
			const firstLine = commit.message.split('\n')[0]
			core.info(`     ${shortId}: ${firstLine}`)
		})

		result.shouldRun = true

		// Extract test scope from commit footer (optional optimization)
		// Supported formats:
		//   Snapshots: update        → all (default, safest)
		//   Snapshots: update:all    → all
		//   Snapshots: update:visual → visual tests only (tests/visual/)
		//   Snapshots: update:e2e    → e2e tests only (tests/e2e/)
		const scopeMatch = matchingCommits[0].message.match(/Snapshots: update:(\w+)/)

		if (scopeMatch) {
			const extractedScope = scopeMatch[1]

			if (isValidTestScope(extractedScope)) {
				result.testScope = extractedScope
				core.info(`   Test scope: ${result.testScope}`)
			} else {
				core.warning(`   ⚠️  Unknown scope '${extractedScope}', defaulting to 'all'`)
				result.testScope = 'all'
			}
		} else {
			// No scope specified, default to all
			result.testScope = 'all'
			core.info('   Test scope: all (default)')
		}
	} else {
		core.info('ℹ️  No commits in push contain snapshot update trigger')
	}
}

/**
 * Type guard to validate test scope
 */
function isValidTestScope(scope: string): scope is TestScope {
	return ['all', 'visual', 'e2e'].includes(scope)
}

// Run the action
run()

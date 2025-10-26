---
name: Snapshot Update Analysis
description: Analyze visual snapshot update workflow execution from git notes. Use when user asks about snapshot update performance, trends, or workflow failures.
---

# Snapshot Update Analysis

This skill analyzes the visual snapshot update workflow execution metrics captured by GitHub Actions and stored in git notes.

## When to Use

Invoke this skill when the user:
- Asks about snapshot update workflow failures
- Requests snapshot update success rate or trends
- Wants to know why snapshot updates are failing
- Asks which trigger method is most reliable
- Mentions "snapshot updates", "visual regression failures", or "snapshot workflow"

## Instructions

When analyzing snapshot update workflow execution:

1. **Read the analysis guide**:
   - Read `.claude/skills/snapshot-update-analysis/analysis.yaml`
   - Understand the workflow metadata structure and analysis steps

2. **Use git-notes-helper for git notes operations**:
   - This skill depends on `.claude/skills/git-notes-helper/helper.yaml`
   - Reference git-notes-helper Operations 1-8 for fetching, parsing, and analyzing notes
   - Use namespace: `ci/snapshot-updates`

3. **Extract and analyze workflow metadata**:
   - Fetch notes using git-notes-helper Operation 1
   - Parse INI-format notes (status, outcome, triggered_by, error_step, etc.)
   - Use git-notes-helper Operation 5 for field extraction
   - Use git-notes-helper Operation 7 for historical analysis

4. **Analyze patterns** (domain-specific):
   - Calculate workflow success rate
   - Group by trigger method (push, issue_comment, workflow_dispatch)
   - Identify which steps fail most often
   - Track snapshot change frequency and file counts
   - Detect failure trends

5. **Present findings**:
   - Overall workflow health (success rate)
   - Trigger method reliability comparison
   - Step-level failure breakdown
   - Snapshot change patterns
   - Recent failures with debugging info
   - Actionable recommendations

## Example Workflow

```
User: "Analyze snapshot update workflow"

1. Read analysis.yaml for instructions
2. Fetch git notes: git fetch origin refs/notes/ci/snapshot-updates
3. Extract metadata from last 20 workflow runs
4. Calculate success rate: 85% (17/20 successful)
5. Group by trigger:
   - workflow_dispatch: 100% success (5/5)
   - issue_comment: 75% success (3/4)
   - push: 82% success (9/11)
6. Identify failed steps:
   - playwright_tests: 2 failures
   - push_step: 1 failure
7. Present findings:
   - Workflow healthy overall (85% success)
   - Manual triggers most reliable
   - Playwright tests occasionally fail (review test stability)
   - Recommendations: Investigate flaky visual tests
```

## Analysis Guide Location

The detailed analysis instructions are in: `.claude/skills/snapshot-update-analysis/analysis.yaml`

This file includes:
- Workflow metadata structure
- Extraction script logic
- Step-by-step analysis instructions
- Parsing templates
- Common issues and solutions
- Output format templates

## Key Metrics

- **Success Rate**: % of workflow runs that complete successfully
- **Trigger Method Distribution**: Which trigger methods are used most often
- **Step-Level Failures**: Which step fails most (checkout, docker, playwright, commit, push)
- **Snapshot Change Frequency**: How often snapshots actually change
- **Average Files Changed**: Typical snapshot update size

## Workflow Triggers

The workflow can be triggered three ways:

1. **workflow_dispatch**: Manual trigger from GitHub UI
   - Most reliable (direct user control)
   - Used for one-off updates

2. **issue_comment**: PR comment `/update-snapshots`
   - Convenient for PR workflows
   - Requires PR comment detection

3. **push**: Commit footer `Snapshots: update`
   - Automated based on commit message
   - Most common trigger method

## Notes

- Git notes must be fetched explicitly (not fetched by default)
- Notes are stored in `refs/notes/ci/snapshot-updates` namespace
- If no notes exist, the workflow needs to run at least once
- Metadata captured even for failed workflow runs (`if: always()`)
- High failure rates may indicate flaky visual tests or infrastructure issues

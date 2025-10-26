# Snapshot Update Analysis Skill - Improvements Based on Actual Execution

This document records observations and potential improvements from actual execution of the snapshot-update-analysis skill.

## Execution Summary (2025-10-26)

**Context**: User requested analysis of failing snapshot update workflows.

**What Worked Well:**

1. ✅ **Git notes fetching** - Successfully fetched notes from remote
2. ✅ **Metadata parsing** - INI-style format was easy to parse with grep/cut
3. ✅ **Pattern identification** - Quickly identified that all failures were at `playwright_tests` step
4. ✅ **Root cause analysis** - Metadata structure provided clear diagnostic info (error_step, error_message)
5. ✅ **Actionable recommendations** - Could immediately suggest specific fixes (timeout increase, error propagation)

**Challenges Encountered:**

1. ❌ **Skill not auto-invokable** - Skill exists in `.claude/skills/` and registered in `.claude/settings.json`, but `Skill(snapshot-update-analysis)` command failed with "Unknown skill"
   - **Workaround**: Manually read the skill YAML and followed instructions
   - **Root cause**: Skill may not be properly registered in Claude Code's skill system
   - **Impact**: Required manual intervention instead of seamless skill invocation

2. ⚠️ **Bash parsing complexity** - Initial attempts to parse metadata with while loops failed due to shell syntax issues
   - **Workaround**: Used simpler sequential commands (for loops, manual commit list)
   - **Lesson**: git-notes-helper's "avoid complex while loops" guidance is correct

3. ⚠️ **"running" status ambiguity** - Multiple commits showed `status = running` hours after workflow completed
   - **Insight**: Post-job metadata capture may not be working correctly for timeouts
   - **Recommendation**: Workflow needs better timeout handling (which we fixed)

4. ⚠️ **Limited historical analysis** - Only analyzed 6 most recent commits due to manual process
   - **Reason**: Without automated skill invocation, full historical analysis was time-consuming
   - **Future**: Skill should provide summary statistics automatically

## Recommended Improvements

### 1. Skill Registration (High Priority)

**Problem**: Skill command failed despite being in `.claude/skills/` and `.claude/settings.json`

**Investigation needed**:
- Check if skill needs to be in a specific format or location
- Verify skill registration mechanism in Claude Code
- Compare with working skills (e.g., `git-commit-rules`, `docker-cache-analysis`)

**Temporary solution**: Document that users may need to manually reference the skill YAML

### 2. Add Pre-Built Analysis Script (Medium Priority)

**Rationale**: Manual bash commands are error-prone and time-consuming

**Proposal**: Create `.github/scripts/analyze-snapshot-updates.sh` that:
- Fetches git notes automatically
- Parses metadata for last N commits
- Generates summary report
- Outputs markdown suitable for GitHub issues/PRs

**Benefits**:
- Can be run by humans without Claude Code
- Provides consistent analysis format
- Can be integrated into CI for automated reporting

### 3. Enhance Skill Instructions (Low Priority)

**Add section**: "Common Bash Pitfalls When Parsing Notes"
```yaml
troubleshooting:
  bash_syntax_errors:
    symptom: "(eval):1: parse error near `)'"
    cause: "Shell word splitting or unescaped parentheses in subshells"
    solution: |
      Use simpler commands:
      # ❌ Avoid: Complex while read loops with multiple pipelines
      git notes list | while read hash commit; do ...

      # ✅ Prefer: Simple for loops with explicit commit list
      for commit in abc123 def456; do
        git notes show $commit | grep "^status"
      done
```

### 4. Add "Quick Status Check" Command (Low Priority)

**Proposal**: Add a simplified quick-check at the top of the skill instructions:

```yaml
quick_check:
  description: "Fast health check for recent snapshot updates (last 5 runs)"
  command: |
    # Fetch notes
    git fetch origin refs/notes/ci/snapshot-updates:refs/notes/ci/snapshot-updates 2>/dev/null

    # Get last 5 commits with notes
    COMMITS=$(git notes --ref=ci/snapshot-updates list | head -5 | awk '{print $2}')

    # Show summary
    echo "Recent Snapshot Update Runs:"
    for commit in $COMMITS; do
      status=$(git notes --ref=ci/snapshot-updates show $commit | grep "^status" | cut -d'=' -f2 | xargs)
      error=$(git notes --ref=ci/snapshot-updates show $commit | grep "^error_step" | cut -d'=' -f2 | xargs)
      echo "  $commit: $status (error: $error)"
    done
```

### 5. Document Metadata Status Meanings (Low Priority)

**Add section**: "Understanding Metadata Status Values"

```yaml
metadata_interpretation:
  status_field:
    values:
      - "success": Workflow completed successfully
      - "failure": Workflow failed at some step
      - "running": Workflow still in progress OR metadata captured before completion (check timestamp!)
      - "cancelled": User or system cancelled the workflow
      - "skipped": Workflow was skipped (trigger condition not met)

  outcome_field:
    values:
      - "snapshots_updated": Success - snapshots were changed and committed
      - "no_changes": Success - snapshots were already up to date
      - "failed": Failure - check error_step for details
      - "in_progress": Workflow still running (may be stale if timestamp old)

  error_step_field:
    values:
      - "none": No error occurred
      - "checkout_step": Failed to checkout code
      - "docker_setup": Failed to set up Docker Buildx
      - "playwright_tests": Playwright tests failed or timed out (most common)
      - "commit_step": Failed to commit changes
      - "push_step": Failed to push to remote
```

## Recommendations for CLAUDE.md

No changes needed to CLAUDE.md. The skill is already:
- ✅ Documented in "Git Notes for CI Metadata" section (line 560)
- ✅ Listed in "See also" references
- ✅ Mentioned as using git-notes-helper (line 541)

The existing documentation is sufficient. Users can find the skill via the git notes section.

## Recommendations for Related Skills

### git-notes-helper (no changes needed)
- ✅ Guidance to "avoid complex while loops" was correct and helpful
- ✅ Operation patterns (fetch, show, parse) worked well
- ✅ INI field parsing examples were accurate

### docker-cache-analysis (no changes needed)
- ✅ Can reference this skill as a working example
- ✅ Similar analysis patterns (fetch, parse, report)

### e2e-failure-analysis (no changes needed)
- ✅ Similar diagnostic flow (identify failures, provide recommendations)

## Next Steps

1. **Immediate**: Document skill invocation limitation (if it persists)
2. **Short-term**: Create standalone analysis script for manual use
3. **Long-term**: Investigate skill registration mechanism and fix if needed

## Conclusion

The skill's **content and structure are excellent**. The metadata format is well-designed, the instructions are clear, and the analysis flow is logical. The only significant issue is the skill invocation failure, which may be a Claude Code system limitation rather than a skill design problem.

**Overall Assessment**: Skill is production-ready for manual execution. Automation via `Skill()` command needs investigation.
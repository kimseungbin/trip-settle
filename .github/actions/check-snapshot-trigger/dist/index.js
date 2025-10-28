// src/main.ts
import * as core from "@actions/core";
import * as github from "@actions/github";
async function run() {
  try {
    const { eventName, payload, ref } = github.context;
    const result = {
      shouldRun: false,
      branch: ref.replace("refs/heads/", ""),
      testScope: "all"
    };
    core.info(`\u{1F50D} Checking snapshot update trigger condition...`);
    core.info(`Event: ${eventName}`);
    switch (eventName) {
      case "workflow_dispatch":
        handleWorkflowDispatch(result, payload);
        break;
      case "issue_comment":
        handleIssueComment(result, payload);
        break;
      case "push":
        handlePush(result, payload);
        break;
      default:
        core.info(`\u2139\uFE0F  Unknown or unsupported event type: ${eventName}`);
    }
    core.setOutput("should_run", result.shouldRun.toString());
    core.setOutput("branch", result.branch);
    core.setOutput("test_scope", result.testScope);
    core.info("");
    core.info("Results:");
    core.info(`  should_run = ${result.shouldRun}`);
    core.info(`  branch = ${result.branch}`);
    core.info(`  test_scope = ${result.testScope}`);
    if (result.shouldRun) {
      core.notice(`\u2705 Snapshot update triggered via ${eventName} (scope: ${result.testScope})`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unknown error occurred");
    }
  }
}
function handleWorkflowDispatch(result, payload) {
  core.info("\u2705 Manual workflow_dispatch trigger detected");
  result.shouldRun = true;
  const customBranch = payload.inputs?.branch;
  if (customBranch && customBranch.trim() !== "") {
    result.branch = customBranch;
    core.info(`   Using custom branch: ${result.branch}`);
  }
}
function handleIssueComment(result, payload) {
  core.info("\u{1F50D} Checking PR comment trigger...");
  const commentBody = payload.comment?.body;
  const isPullRequest = payload.issue?.pull_request !== void 0;
  if (commentBody && commentBody.startsWith("/update-snapshots") && isPullRequest) {
    core.info("\u2705 PR comment trigger detected: /update-snapshots");
    result.shouldRun = true;
  } else {
    core.info("\u2139\uFE0F  Comment does not match /update-snapshots pattern or not on PR");
  }
}
function handlePush(result, payload) {
  core.info("\u{1F50D} Checking commit footer trigger...");
  const commits = payload.commits || [];
  core.info(`   Checking ${commits.length} commit(s) in push...`);
  const matchingCommits = commits.filter(
    (commit) => commit.message.includes("Snapshots: update") || commit.message.includes("[update-snapshots]")
    // Legacy format
  );
  if (matchingCommits.length > 0) {
    core.info("\u2705 Commit footer trigger detected: Snapshots: update");
    core.info("   Matching commits:");
    matchingCommits.forEach((commit) => {
      const shortId = commit.id.substring(0, 7);
      const firstLine = commit.message.split("\n")[0];
      core.info(`     ${shortId}: ${firstLine}`);
    });
    result.shouldRun = true;
    const scopeMatch = matchingCommits[0].message.match(/Snapshots: update:(\w+)/);
    if (scopeMatch) {
      const extractedScope = scopeMatch[1];
      if (isValidTestScope(extractedScope)) {
        result.testScope = extractedScope;
        core.info(`   Test scope: ${result.testScope}`);
      } else {
        core.warning(`   \u26A0\uFE0F  Unknown scope '${extractedScope}', defaulting to 'all'`);
        result.testScope = "all";
      }
    } else {
      result.testScope = "all";
      core.info("   Test scope: all (default)");
    }
  } else {
    core.info("\u2139\uFE0F  No commits in push contain snapshot update trigger");
  }
}
function isValidTestScope(scope) {
  return ["all", "visual", "e2e"].includes(scope);
}
run();
//# sourceMappingURL=index.js.map

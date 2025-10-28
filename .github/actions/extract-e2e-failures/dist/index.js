// src/main.ts
import * as core from "@actions/core";
import * as fs from "fs";
function run() {
  try {
    const resultsPath = core.getInput("results-path", { required: true });
    const outputPath = core.getInput("output-path", { required: true });
    core.info(`\u{1F4CA} Extracting E2E failure metadata...`);
    core.info(`   Results: ${resultsPath}`);
    core.info(`   Output: ${outputPath}`);
    let results;
    try {
      const resultsData = fs.readFileSync(resultsPath, "utf-8");
      results = JSON.parse(resultsData);
    } catch (error) {
      throw new Error(`Failed to read results file: ${error instanceof Error ? error.message : String(error)}`);
    }
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const commit = process.env.GITHUB_SHA?.substring(0, 7) || "unknown";
    const branch = process.env.GITHUB_REF_NAME || "unknown";
    const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : "local";
    const stats = analyzeTestStats(results);
    const failures = extractFailures(results);
    const passRate = stats.total > 0 ? (stats.passed / stats.total * 100).toFixed(1) : "0.0";
    const note = generateNote({
      timestamp,
      commit,
      branch,
      runUrl,
      stats,
      passRate,
      failures,
      resultsPath,
      config: results.config
    });
    fs.writeFileSync(outputPath, note, "utf-8");
    core.setOutput("tests-total", stats.total.toString());
    core.setOutput("tests-passed", stats.passed.toString());
    core.setOutput("tests-failed", stats.failed.toString());
    core.setOutput("tests-skipped", stats.skipped.toString());
    core.setOutput("pass-rate", passRate);
    core.setOutput("failures-count", failures.length.toString());
    core.info(`\u2705 E2E failure metadata extracted successfully`);
    core.info(`   Tests: ${stats.total} total, ${stats.passed} passed, ${stats.failed} failed`);
    if (failures.length > 0) {
      core.warning(`   Failures: ${failures.length} test(s) failed`);
      failures.forEach((f, i) => {
        core.info(`     ${i + 1}. ${f.testName} [${f.browser}] (${f.errorType})`);
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unknown error occurred");
    }
  }
}
function analyzeTestStats(results) {
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  };
  function processSuite(suite) {
    suite.specs?.forEach((spec) => {
      spec.tests?.forEach((test) => {
        const result = test.results?.[0];
        if (!result) return;
        stats.total++;
        stats.duration += result.duration || 0;
        switch (result.status) {
          case "passed":
            stats.passed++;
            break;
          case "failed":
          case "timedOut":
            stats.failed++;
            break;
          case "skipped":
            stats.skipped++;
            break;
        }
      });
    });
    suite.suites?.forEach((subSuite) => processSuite(subSuite));
  }
  results.suites?.forEach((suite) => processSuite(suite));
  return stats;
}
function extractFailures(results) {
  const failures = [];
  function processSuite(suite, suitePath = []) {
    const currentPath = [...suitePath, suite.title].filter((item) => Boolean(item));
    suite.specs?.forEach((spec) => {
      spec.tests?.forEach((test) => {
        const result = test.results?.[0];
        if (!result || result.status === "passed" || result.status === "skipped") return;
        const error = result.error || {};
        const errorMessage = error.message || "No error message";
        const stackTrace = error.stack || "";
        const errorType = classifyError(errorMessage);
        const artifacts = {
          screenshots: [],
          videos: [],
          traces: []
        };
        result.attachments?.forEach((attachment) => {
          if (attachment.contentType?.startsWith("image/")) {
            artifacts.screenshots.push(attachment.path || "embedded");
          } else if (attachment.contentType?.includes("video")) {
            artifacts.videos.push(attachment.path || "embedded");
          } else if (attachment.name?.includes("trace")) {
            artifacts.traces.push(attachment.path || "embedded");
          }
        });
        failures.push({
          testFile: suite.file || "unknown",
          testName: [...currentPath, spec.title].join(" \u203A "),
          browser: test.projectName || "unknown",
          errorType,
          errorMessage: errorMessage.split("\n")[0],
          // First line only
          stackTrace: stackTrace.split("\n").slice(0, 5).join("\n"),
          // First 5 lines
          duration: result.duration || 0,
          artifacts
        });
      });
    });
    suite.suites?.forEach((subSuite) => processSuite(subSuite, currentPath));
  }
  results.suites?.forEach((suite) => processSuite(suite));
  return failures;
}
function classifyError(errorMessage) {
  if (/Timeout|timeout|exceeded/i.test(errorMessage)) {
    return "timeout";
  } else if (/Screenshot|snapshot|pixels? differ/i.test(errorMessage)) {
    return "visual_regression";
  } else if (/expect|toBe|toHaveText|toContain/i.test(errorMessage)) {
    return "assertion";
  } else if (/Navigation|goto|net::ERR/i.test(errorMessage)) {
    return "navigation";
  } else if (/beforeEach|afterEach|beforeAll|afterAll/i.test(errorMessage)) {
    return "setup_teardown";
  }
  return "unknown";
}
function generateNote(data) {
  const { timestamp, commit, branch, runUrl, stats, passRate, failures, resultsPath, config } = data;
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
duration_sec = ${Math.round(stats.duration / 1e3)}

[summary]
status = ${stats.failed > 0 ? "FAILED" : "PASSED"}
new_failures = ${failures.length}
timeout_failures = ${failures.filter((f) => f.errorType === "timeout").length}
visual_failures = ${failures.filter((f) => f.errorType === "visual_regression").length}
assertion_failures = ${failures.filter((f) => f.errorType === "assertion").length}
navigation_failures = ${failures.filter((f) => f.errorType === "navigation").length}
setup_failures = ${failures.filter((f) => f.errorType === "setup_teardown").length}

`;
  failures.forEach((failure, index) => {
    const num = index + 1;
    note += `[failure.${num}]
test_file = ${failure.testFile}
test_name = ${failure.testName}
browser = ${failure.browser}
error_type = ${failure.errorType}
error_message = ${failure.errorMessage.replace(/\n/g, " ")}
duration_ms = ${failure.duration}
screenshots = ${failure.artifacts.screenshots.join(", ") || "none"}
videos = ${failure.artifacts.videos.join(", ") || "none"}
traces = ${failure.artifacts.traces.join(", ") || "none"}

`;
  });
  note += `[diagnostics]
playwright_version = ${config?.version || "unknown"}
test_env = ${process.env.TEST_ENV || "unknown"}
workers = ${config?.workers || "unknown"}
reporter_output = ${resultsPath}
artifacts_uploaded = ${process.env.CI === "true" ? "yes (GitHub Actions)" : "no (local run)"}
`;
  return note;
}
void run();
//# sourceMappingURL=index.js.map

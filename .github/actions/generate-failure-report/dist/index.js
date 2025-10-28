// src/main.ts
import * as core from "@actions/core";
import * as fs from "fs";
function run() {
  try {
    const buildLogPath = core.getInput("build-log-path") || "build-log.txt";
    const outputPath = core.getInput("output-path") || "ci-failure-report.md";
    core.info("\u{1F50D} Generating CI failure report...");
    core.info(`   Build log: ${buildLogPath}`);
    core.info(`   Output: ${outputPath}`);
    const markdown = generateReport(buildLogPath);
    fs.writeFileSync(outputPath, markdown, "utf-8");
    core.setOutput("report-path", outputPath);
    core.info("\u2705 Report generated successfully");
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unknown error occurred");
    }
  }
}
function generateReport(buildLogPath) {
  let markdown = generateHeader();
  let hasErrors = false;
  if (fs.existsSync(buildLogPath)) {
    core.info(`\u{1F4C4} Reading build log: ${buildLogPath}`);
    const logContent = fs.readFileSync(buildLogPath, "utf-8");
    const buildErrors = parseBuildErrors(logContent);
    if (buildErrors.length > 0) {
      core.info(`\u274C Found ${buildErrors.length} build error(s)`);
      markdown += generateBuildSection(buildErrors);
      hasErrors = true;
    } else {
      core.info("\u2705 No build errors found in log");
    }
  } else {
    core.warning(`Build log not found: ${buildLogPath}`);
    markdown += "## Build Failures\n\n";
    markdown += "\u26A0\uFE0F Build log file not found. The build may have failed before generating logs.\n\n";
    hasErrors = true;
  }
  markdown += generateFooter();
  if (!hasErrors) {
    core.info("\u2705 No failures to report");
  }
  return markdown;
}
function parseBuildErrors(logContent) {
  const errors = [];
  const tsErrorRegex = /^(.+?\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/gm;
  let match;
  while ((match = tsErrorRegex.exec(logContent)) !== null) {
    errors.push({
      file: match[1],
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      code: match[4],
      message: match[5],
      type: "typescript"
    });
  }
  const genericErrorRegex = /^error (.+)$/gim;
  while ((match = genericErrorRegex.exec(logContent)) !== null) {
    if (!match[1].startsWith("TS")) {
      errors.push({
        message: match[1],
        type: "build"
      });
    }
  }
  return errors;
}
function generateBuildSection(errors) {
  if (errors.length === 0) {
    return "";
  }
  let markdown = "## Build Failures\n\n";
  markdown += `**Total Errors:** ${errors.length}

`;
  const errorsByFile = groupErrorsByFile(errors);
  for (const [file, fileErrors] of Object.entries(errorsByFile)) {
    if (file === "_general") continue;
    markdown += `### \`${file}\`

`;
    for (const error of fileErrors) {
      if (error.type === "typescript") {
        markdown += `**Line ${error.line}:${error.column}** - \`${error.code}\`

`;
        markdown += `\`\`\`
${error.message}
\`\`\`

`;
      }
    }
  }
  if (errorsByFile["_general"]) {
    markdown += "### General Build Errors\n\n";
    for (const error of errorsByFile["_general"]) {
      if (error.type === "build") {
        markdown += `- ${error.message}
`;
      }
    }
    markdown += "\n";
  }
  return markdown;
}
function groupErrorsByFile(errors) {
  return errors.reduce((acc, error) => {
    if (error.type === "typescript") {
      const file = error.file;
      if (!acc[file]) {
        acc[file] = [];
      }
      acc[file].push(error);
    } else {
      if (!acc["_general"]) {
        acc["_general"] = [];
      }
      acc["_general"].push(error);
    }
    return acc;
  }, {});
}
function generateHeader() {
  const githubServerUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const githubRepository = process.env.GITHUB_REPOSITORY || "";
  const githubRunId = process.env.GITHUB_RUN_ID || "";
  const githubSha = process.env.GITHUB_SHA || "";
  const githubRef = process.env.GITHUB_REF || "";
  const runUrl = `${githubServerUrl}/${githubRepository}/actions/runs/${githubRunId}`;
  const commitUrl = `${githubServerUrl}/${githubRepository}/commit/${githubSha}`;
  let markdown = "# CI Failure Report\n\n";
  markdown += `**Generated:** ${(/* @__PURE__ */ new Date()).toISOString()}

`;
  if (githubRunId) {
    markdown += `**Workflow Run:** [#${githubRunId}](${runUrl})

`;
  }
  if (githubSha) {
    markdown += `**Commit:** [\`${githubSha.substring(0, 7)}\`](${commitUrl})

`;
  }
  if (githubRef) {
    markdown += `**Ref:** \`${githubRef}\`

`;
  }
  markdown += "---\n\n";
  return markdown;
}
function generateFooter() {
  let markdown = "\n---\n\n";
  markdown += "## How to Fix\n\n";
  markdown += "1. Review the errors above and identify the root cause\n";
  markdown += "2. Fix the issues locally and ensure tests pass\n";
  markdown += "3. Run `npm run build` to verify the build succeeds\n";
  markdown += "4. Commit and push your changes\n\n";
  markdown += "## Need Help?\n\n";
  markdown += "You can provide this report to Claude Code for assistance:\n";
  markdown += "1. Download this artifact from the GitHub Actions run\n";
  markdown += "2. Share the report with Claude Code\n";
  markdown += "3. Claude Code will analyze the errors and suggest fixes\n";
  return markdown;
}
void run();
//# sourceMappingURL=index.js.map

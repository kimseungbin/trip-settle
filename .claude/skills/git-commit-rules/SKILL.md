---
name: Git Commit Rules
description: Generate standardized git commit messages based on YAML-defined rules. Use when user requests to commit changes or asks for commit message generation following project standards.
---

# Git Commit Rules

This skill generates git commit messages following rules defined in `.claude/skills/git-commit-rules/commit-rules.yaml`.

## Instructions

When the user requests to create a commit or generate a commit message:

1. **Read the commit rules configuration**:
   - Read `.claude/skills/git-commit-rules/commit-rules.yaml`
   - Parse the rules including: types, scopes, format patterns, and conventions

2. **Analyze the current changes**:
   - Run `git status` to see modified/added files
   - Run `git diff --staged` to see staged changes (if any)
   - Run `git diff` to see unstaged changes
   - Identify the scope of changes (which packages, modules, or areas are affected)

3. **Determine commit type and scope**:
   - Based on the changes, determine the appropriate type from the rules (feat, fix, refactor, etc.)
   - Identify the scope (frontend, backend, infra, config, etc.)
   - Consider the monorepo structure: packages/frontend, packages/backend, packages/infra

4. **Generate the commit message**:
   - Follow the format pattern specified in the YAML rules
   - Use the type and scope identified
   - Write a clear, concise description (present tense, imperative mood)
   - Add body and footer if needed (breaking changes, references, etc.)
   - Respect line length limits from the rules

5. **Present to user**:
   - Show the generated commit message
   - Explain why this type and scope were chosen
   - Ask for confirmation before committing

6. **Evaluate rule coverage**:
   - If the commit doesn't fit well into existing types or scopes
   - If you notice patterns that aren't covered by current rules
   - Provide feedback to the user suggesting updates to `commit-rules.yaml`
   - Explain what new type, scope, or convention should be added
   - Suggest the specific YAML changes needed

7. **Create the commit** (if user approves):
   - Stage any unstaged files if appropriate
   - Use the generated message with proper formatting

## Example Workflow

```
User: "Commit the changes"

1. Read commit-rules.yaml
2. Analyze: Modified packages/backend/src/trips/trips.service.ts
3. Determine: type=feat, scope=backend
4. Generate: "feat(backend): Add trip expense calculation logic"
5. Show message and ask for confirmation
6. Create commit if approved
```

## Rules File Location

The rules are defined in: `.claude/skills/git-commit-rules/commit-rules.yaml`

If the file doesn't exist, create it using the template in `commit-rules.template.yaml`.

## Notes

- Always respect the project's existing commit history style
- For multi-package changes, use broader scopes like "monorepo" or list multiple scopes
- Breaking changes must be clearly indicated per the rules
- Reference issue numbers when mentioned by the user

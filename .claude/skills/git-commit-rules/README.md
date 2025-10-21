# Git Commit Rules Skill

This skill automatically generates standardized commit messages for the Trip Settle project based on rules defined in `commit-rules.yaml`.

## Usage

Simply ask Claude to commit your changes:

```
"Commit the changes"
"Create a commit for these changes"
"Generate a commit message"
```

Claude will:
1. Analyze your staged/unstaged changes
2. Determine the appropriate type and scope
3. Generate a commit message following project conventions
4. Ask for your confirmation before committing

## Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Examples

```
feat(backend): Add trip settlement calculation logic
fix(frontend): Resolve date picker validation error
refactor(config): Consolidate TypeScript configurations
```

## Customization

Edit `commit-rules.yaml` to customize:
- Commit types
- Scopes (areas of the codebase)
- Message format patterns
- Subject line length limits
- Conventions and special rules

## File Structure

```
.claude/skills/git-commit-rules/
├── SKILL.md                      # Skill instructions for Claude
├── commit-rules.yaml             # Active rules configuration
├── commit-rules.template.yaml    # Template with examples
└── README.md                     # This file
```

## Benefits

- Consistent commit history across the team
- Automatic scope detection based on file paths
- Enforced conventions (imperative mood, length limits)
- Context-aware message generation
- Easy to customize for project needs
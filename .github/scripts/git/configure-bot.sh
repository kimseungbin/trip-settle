#!/usr/bin/env bash

# Configure git for GitHub Actions bot commits
# This script sets up git user name and email for automated commits
# from GitHub Actions workflows.
#
# Usage: ./configure-bot.sh
#
# No arguments required. Uses standard GitHub Actions bot identity.

set -euo pipefail

echo "🤖 Configuring git for GitHub Actions bot..."

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

echo "✅ Git configured:"
echo "   Name: $(git config user.name)"
echo "   Email: $(git config user.email)"
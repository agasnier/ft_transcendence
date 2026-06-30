#!/bin/bash
# Configures the commit template for THIS repo, on THIS machine.
# Each team member runs it once after cloning.
set -e

# adding the commit_template to the git commit console
git config commit.template .resources/git/src/commit_template

# change the local path for git hooks
git config core.hooksPath .resources/git/src/hooks

echo "Commit template configured."
echo "Run 'git commit' (without -m) to see the template."

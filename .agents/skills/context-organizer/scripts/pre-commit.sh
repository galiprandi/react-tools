#!/usr/bin/env sh
# Hook pre-commit para regenerar BEHAVIOR.md
# Instalar: cp skills/context-organizer/scripts/pre-commit.sh .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

node --run test -- --json --outputFile=.context/test-results.json || exit 1
node skills/context-organizer/scripts/compile-behavior.mjs
git add BEHAVIOR.md

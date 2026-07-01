---
name: Update package.json scripts to include test:watch
about: Add a convenient test:watch script for local development
title: Update package.json scripts to include test:watch
labels: chore, dev
---

Points: 3
Estimated time: 1 day

### What needs doing
- Add a `test:watch` script to the relevant `package.json` files.
- Ensure it runs the existing test watch mode in the project.

### Acceptance criteria
- [ ] `pnpm run test:watch` works locally in the affected package.

### Branch / Commit
- Suggested branch: `chore/add-test-watch`
- Commit example: `chore(scripts): add test:watch script`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.

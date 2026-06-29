---
name: Add small CI cache step for node_modules
about: Speed up CI by caching node_modules
title: Add small CI cache step for node_modules
labels: ci, performance
---

Points: 3
Estimated time: 1 day

### What needs doing
- Update `.github/workflows/ci.yml` to add a caching step for `~/.pnpm-store` or `node_modules`.

### Acceptance criteria
- [ ] CI config updated and cache used on the next run.

### Branch / Commit
- Suggested branch: `chore/ci-cache`
- Commit example: `chore(ci): add node_modules cache step`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.

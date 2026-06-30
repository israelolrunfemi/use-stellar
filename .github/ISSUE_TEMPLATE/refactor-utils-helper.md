---
name: Refactor a small helper in utils for clarity
about: Extract a helper into a named function and add tests
title: Refactor a small helper in utils for clarity
labels: refactor, test
---

Points: 8
Estimated time: 1 day

### What needs doing
- Identify an anonymous or repeated helper in `packages/core/src/utils`.
- Extract it into a named function and add unit tests for the extracted helper.

### Acceptance criteria
- [ ] Helper extraction completed.
- [ ] Unit tests added and passing locally.

### Branch / Commit
- Suggested branch: `refactor/utils-helper`
- Commit example: `refactor(utils): extract formatAmount helper`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.

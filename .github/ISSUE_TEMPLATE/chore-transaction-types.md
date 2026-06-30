---
name: Tighten TypeScript types for useTransaction
about: Improve return types for useTransaction and add tests
title: Tighten TypeScript types for useTransaction
labels: typescript, hooks
---

Points: 8
Estimated time: 1 day

### What needs doing
- Update the `useTransaction` return types to avoid `any`.
- Add a unit test that validates the typed behavior.

### Acceptance criteria
- [ ] TypeScript shows no `any` in the public API.
- [ ] Tests added and passing locally.

### Branch / Commit
- Suggested branch: `chore/transaction-types`
- Commit example: `chore(types): improve useTransaction return types`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.

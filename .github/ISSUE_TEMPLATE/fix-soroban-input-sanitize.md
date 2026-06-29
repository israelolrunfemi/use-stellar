---
name: Add basic input sanitization to useSorobanContract
about: Sanitize and validate contract inputs before sending
title: Add basic input sanitization to useSorobanContract
labels: security, hooks
---

Points: 15
Estimated time: 1 day

### What needs doing
- Add basic validation/sanitization to inputs in `packages/core/src/hooks/useSorobanContract.ts`.
- Return clear errors for invalid inputs and add unit tests.

### Acceptance criteria
- [ ] Invalid inputs are rejected with clear errors.

### Branch / Commit
- Suggested branch: `fix/soroban-input-sanitize`
- Commit example: `fix(useSorobanContract): validate contract inputs`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.

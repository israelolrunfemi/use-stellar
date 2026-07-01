---
name: Fix null-account crash in useBalance
about: Ensure useBalance handles null account without throwing
title: Fix null-account crash in useBalance
labels: bug, hooks
---

Points: 10
Estimated time: 1 day

### What needs doing
- Update `packages/core/src/hooks/useBalance.ts` to handle `null` account input and return a safe empty state.
- Add unit tests covering null and undefined account values.

### Acceptance criteria
- [ ] No runtime errors when account is null.
- [ ] Unit tests added and passing.

### Branch / Commit
- Suggested branch: `fix/useBalance-null-account`
- Commit example: `fix(useBalance): handle null account`

> Before pushing, run `git pull --rebase origin main` and resolve conflicts locally.
